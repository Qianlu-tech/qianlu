import type { Metadata } from "next";
import FinancingView from "./view";

export const metadata: Metadata = {
  title: "Invoice Financing · Qianlu",
  description: "Permissionless receivables financing on Venus Protocol. No underwriting.",
};

export default function Page() {
  return <FinancingView />;
}
