/**
 * Stablecoin registry. The backend pins no token addresses — the frontend owns
 * them. Set via NEXT_PUBLIC_USDT/USDC/FDUSD (see .env.local), and because those
 * are inlined at build time they must be referenced statically (no dynamic
 * `process.env[...]` access) and also set in Vercel for the deploy.
 *
 * All three are 18-decimal on BSC (unlike 6-decimal USDT/USDC on Ethereum).
 */
import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import type { Asset } from "./api";

export const ASSETS: readonly Asset[] = ["USDT", "FDUSD", "USDC"] as const;

/** Stablecoins on BSC use 18 decimals. */
export const STABLE_DECIMALS = 18;

const RAW: Record<Asset, string | undefined> = {
  USDT: process.env.NEXT_PUBLIC_USDT,
  FDUSD: process.env.NEXT_PUBLIC_FDUSD,
  USDC: process.env.NEXT_PUBLIC_USDC,
};

/** Checksummed contract address for an asset, or null if unset/invalid/zero. */
export function tokenAddress(asset: Asset): Address | null {
  const raw = RAW[asset]?.trim();
  if (!raw || !isAddress(raw)) return null;
  const addr = getAddress(raw);
  return addr === zeroAddress ? null : addr;
}

export const isAssetConfigured = (asset: Asset): boolean => tokenAddress(asset) !== null;
