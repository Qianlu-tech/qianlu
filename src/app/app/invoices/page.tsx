import type { Metadata } from "next";
import InvoicesView from "./view";

export const metadata: Metadata = {
  title: "Invoices · Qianlu",
  description: "Tokenized, wallet-only invoices on BNB Chain.",
};

export default function Page() {
  return <InvoicesView />;
}
