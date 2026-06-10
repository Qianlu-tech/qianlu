import type { Metadata } from "next";
import { InvoicePay } from "@/components/qianlu/InvoicePay";
import { api, apiEnabled, type Asset } from "@/lib/api";

export const metadata: Metadata = {
  title: "Pay Invoice · Qianlu",
  description:
    "Pay a Qianlu invoice with a BSC wallet. No account required. Wallet-to-wallet on BNB Chain.",
};

// Deterministic demo data so a shared /pay/:id link renders a stable invoice.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = hash(id);
  // Deterministic demo fallback for when the backend invoice isn't available.
  let amount = 2000 + (h % 48000);
  let from = `0x${h.toString(16).padStart(4, "0").slice(0, 4)}…E1a2`;
  let to = `0x${(h * 7).toString(16).padStart(4, "0").slice(0, 4)}…44dE`;
  let asset: Asset | undefined;

  if (apiEnabled()) {
    try {
      const inv = await api.invoice(id); // public endpoint, no auth
      amount = inv.amount;
      from = inv.from;
      to = inv.to;
      asset = inv.asset;
    } catch {
      /* backend not live / not found → keep deterministic demo */
    }
  }

  return <InvoicePay id={id} amount={amount} from={from} to={to} asset={asset} />;
}
