import type { Metadata } from "next";
import { InvoicePay } from "@/components/qianlu/InvoicePay";

export const metadata: Metadata = {
  title: "Pay Invoice · Qianlu",
  description: "Pay any Qianlu invoice with a BSC wallet. No account required.",
};

export default function Page() {
  return <InvoicePay />;
}
