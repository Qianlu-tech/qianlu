# Qianlu · 千路 — Thousand Routes

Anonymous, wallet-first cross-border **trade finance on BNB Chain**. Wallet-to-wallet
stablecoin payments, tokenized invoices, permissionless financing, and hash-only
document attestation — across Asia-Pacific. No KYC. No custody. No gatekeepers.

> Fast. Private. Borderless.

## Highlights

- **Payments** — send USDT / FDUSD / USDC to any BSC wallet at a flat 0.20% fee, with
  batch (multicall) payouts and shareable public invoice links.
- **Invoices & financing** — tokenized, wallet-only invoices and permissionless
  receivables financing.
- **Document attestation** — hash-only verification backed by EAS on BNB Greenfield.
- **QLU token** — stake for fee rebates, governance and revenue share.
- **Wallet sign-in** — connect with any injected wallet (MetaMask, Binance Wallet,
  Trust…) on BNB Smart Chain, authorized with a SIWE-style signature.
- **Bilingual** — English / 简体中文, and a liquid-glass "silk road" design system.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Motion
- TanStack Query · Recharts
- BNB Smart Chain (BSC) + opBNB

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

### Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Lint                                 |

### Configuration

Runtime/build config is read from `NEXT_PUBLIC_*` environment variables (API base URL,
chain IDs, RPC URLs, contract addresses, WalletConnect project ID). Create a
`.env.local` for local overrides — it is not committed.

```bash
NEXT_PUBLIC_API_BASE_URL=...
NEXT_PUBLIC_CHAIN_ID=56            # BSC mainnet (97 = testnet)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
# …plus contract addresses
```

## Project structure

```
src/
  app/                 # App Router routes (landing, /app dashboard, /pay, /verify)
  components/
    qianlu/            # App-specific components (Nav, Footer, wallet, charts…)
    ui/                # shadcn/ui primitives
  hooks/
  lib/                 # i18n, wallet (BNB Chain), utils
public/
  media/               # optimized hero / background video (H.264 + VP9)
```
