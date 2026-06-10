/**
 * Chain constants + a dedicated read client.
 *
 * Reads (token balance, decimals) and tx-receipt waiting go through this viem
 * client over an explicit public RPC — NOT WalletConnect's RPC, which is often
 * blocked by ad-blockers/DNS (the `rpc.walletconnect.org ERR_NAME_NOT_RESOLVED`
 * you may see in the console). Writes still go through the user's wallet via
 * wagmi, so they use the wallet's own RPC and aren't affected by this.
 *
 * No "use client" on purpose: this is a plain module so it can be imported by
 * client hooks/components without dragging in wallet.tsx's React context.
 */
import { createPublicClient, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";

export const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);

const isTestnet = TARGET_CHAIN_ID === 97;
const chain = isTestnet ? bscTestnet : bsc;

export const CHAIN_NAME = isTestnet ? "BNB Smart Chain Testnet" : "BNB Smart Chain";
export const EXPLORER = isTestnet ? "https://testnet.bscscan.com" : "https://bscscan.com";

const RPC_URL =
  process.env.NEXT_PUBLIC_BSC_RPC_URL ||
  (isTestnet ? "https://data-seed-prebsc-1-s1.binance.org:8545" : "https://bsc-dataseed.binance.org");

export const readClient = createPublicClient({ chain, transport: http(RPC_URL) });

/** Block-explorer URL for a transaction hash on the active chain. */
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}`;
