import type { Metadata } from "next";
import { InvoicePay } from "@/components/qianlu/InvoicePay";

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
  const amount = 2000 + (h % 48000);
  const from = `0x${h.toString(16).padStart(4, "0").slice(0, 4)}…E1a2`;
  const to = `0x${(h * 7).toString(16).padStart(4, "0").slice(0, 4)}…44dE`;
  return <InvoicePay id={id} amount={amount} from={from} to={to} />;
}
