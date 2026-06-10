"use client";

/**
 * Real stablecoin payments. A "send" is a plain BEP-20 `transfer` from the
 * user's wallet to the recipient — no fee, no router contract, no `approve`.
 *
 * Architecture (matters for the indexer): the on-chain transfer IS the payment.
 * `POST /payments` is bookkeeping recorded AFTER the receipt confirms, and the
 * dashboard "settled" state comes from polling `GET /payments/:txHash` while the
 * backend indexer flips pending → confirmed. So a dead indexer or a failed POST
 * never makes a real payment *look* failed — the money already moved on-chain.
 */
import { useCallback, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { BaseError, erc20Abi, getAddress, isAddress, parseUnits, type Hash } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { CHAIN_NAME, TARGET_CHAIN_ID, readClient } from "./chain";
import { STABLE_DECIMALS, tokenAddress } from "./tokens";
import { ApiError, apiEnabled, paymentsApi, type Asset } from "./api";

export type TransferArgs = { to: string; amount: string | number; asset: Asset };
type Progress = (phase: "preflight" | "sign" | "mining", hash?: Hash) => void;

/** A validation/guard failure we raise ourselves (already human-readable). */
export class SendError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Turn wallet/viem/SendError failures into one short user-facing line. */
export function humanizeError(err: unknown): string {
  if (err instanceof SendError) return err.message;
  const e = err as { code?: number; name?: string; shortMessage?: string; message?: string };
  if (e?.code === 4001 || /reject|denied|cancell?ed/i.test(`${e?.name ?? ""} ${e?.message ?? ""}`)) {
    return "You rejected the request in your wallet.";
  }
  if (err instanceof BaseError) {
    if (/insufficient funds/i.test(err.message)) return "Not enough BNB to cover gas.";
    return err.shortMessage || err.message;
  }
  return e?.shortMessage || e?.message || "Something went wrong — please try again.";
}

/**
 * Low-level: validate → ensure chain → check balance + gas → `transfer` → wait
 * for the receipt. Returns the confirmed tx hash, throws on any failure.
 * Reused by single send, dashboard Quick Send, and batch.
 */
export function useTransfer() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  return useCallback(
    async ({ to, amount, asset }: TransferArgs, onProgress?: Progress): Promise<Hash> => {
      if (!address) throw new SendError("Connect your wallet first.");
      if (!isAddress(to)) throw new SendError("Enter a valid 0x recipient address.");
      const recipient = getAddress(to);

      const amountStr = String(amount).trim();
      const num = Number(amountStr);
      if (!Number.isFinite(num) || num <= 0) throw new SendError("Enter an amount greater than 0.");

      const token = tokenAddress(asset);
      if (!token) throw new SendError(`${asset} isn't configured for ${CHAIN_NAME}.`);

      let amountRaw: bigint;
      try {
        amountRaw = parseUnits(amountStr, STABLE_DECIMALS);
      } catch {
        throw new SendError("That amount has too many decimal places.");
      }

      onProgress?.("preflight");
      if (chainId !== TARGET_CHAIN_ID) await switchChainAsync({ chainId: TARGET_CHAIN_ID });

      // Pre-flight against a reliable RPC — this is what stops a $0 wallet before
      // a pointless wallet popup.
      const [balance, gas] = await Promise.all([
        readClient.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
        readClient.getBalance({ address }),
      ]);
      if (balance < amountRaw) throw new SendError(`Not enough ${asset} — your balance is below that amount.`);
      if (gas === 0n) throw new SendError("You need some BNB in this wallet to cover gas.");

      onProgress?.("sign");
      const hash = await writeContractAsync({
        address: token,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, amountRaw],
        chainId: TARGET_CHAIN_ID,
      });

      onProgress?.("mining", hash);
      const receipt = await readClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new SendError("The transfer reverted on-chain.");
      return hash;
    },
    [address, chainId, switchChainAsync, writeContractAsync],
  );
}

/**
 * Record an already-confirmed transfer with the backend. Never throws.
 *
 * The backend write limit is ~20/min, so a fast/large batch can 429 on later
 * rows. The idempotency key is the txHash (set in `paymentsApi.create`), so a
 * retry can't double-record — we back off and retry a couple of times. Money
 * already moved on-chain, so a permanent failure here is bookkeeping, not a
 * failed payment.
 */
export async function recordPayment(txHash: Hash, to: string, amount: number, asset: Asset): Promise<boolean> {
  if (!apiEnabled()) return false;
  const recipient = getAddress(to);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await paymentsApi.create({ to: recipient, amount, asset, txHash });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 429 && attempt < 2) {
        await sleep(4000 * (attempt + 1));
        continue;
      }
      console.error("[payments] failed to record", txHash, err);
      return false;
    }
  }
  return false;
}

export type SendPhase = "idle" | "preflight" | "sign" | "mining" | "sent" | "error";
export type RecordPhase = "idle" | "offline" | "recording" | "settled" | "lagging" | "failed";

/**
 * Stateful single-payment flow for the Send page + dashboard Quick Send.
 * Exposes the on-chain phase and the (decoupled) backend recording phase.
 */
export function useSendPayment() {
  const transfer = useTransfer();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<SendPhase>("idle");
  const [record, setRecord] = useState<RecordPhase>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setRecord("idle");
    setTxHash(null);
    setError(null);
  }, []);

  const track = useCallback(
    async (hash: Hash, to: string, amount: number, asset: Asset) => {
      if (!apiEnabled()) {
        setRecord("offline");
        return;
      }
      setRecord("recording");
      if (!(await recordPayment(hash, to, amount, asset))) {
        setRecord("failed");
        return;
      }
      // Poll while the indexer flips pending → confirmed (~30s budget).
      for (let i = 0; i < 12; i++) {
        await sleep(2500);
        try {
          const res = await paymentsApi.state(hash);
          if (res.status === "confirmed") {
            setRecord("settled");
            queryClient.invalidateQueries();
            return;
          }
          if (res.status === "failed") {
            setRecord("failed");
            return;
          }
        } catch {
          /* transient — keep polling */
        }
      }
      setRecord("lagging"); // recorded, but the indexer hasn't confirmed in time
    },
    [queryClient],
  );

  const send = useCallback(
    async ({ to, amount, asset }: TransferArgs): Promise<Hash | null> => {
      setError(null);
      setTxHash(null);
      setRecord("idle");
      try {
        const hash = await transfer({ to, amount, asset }, (p, h) => {
          if (p === "mining" && h) setTxHash(h);
          setPhase(p);
        });
        setTxHash(hash);
        setPhase("sent");
        void track(hash, to, Number(amount), asset);
        return hash;
      } catch (err) {
        setError(humanizeError(err));
        setPhase("error");
        return null;
      }
    },
    [transfer, track],
  );

  return { phase, record, txHash, error, send, reset };
}
