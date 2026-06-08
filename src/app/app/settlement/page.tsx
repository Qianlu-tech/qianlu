import type { Metadata } from "next";
import SettlementView from "./view";

export const metadata: Metadata = {
  title: "Settlement History · Qianlu",
  description:
    "Immutable onchain settlement records. ERP-compatible CSV export. No names — wallets and hashes only.",
};

export default function Page() {
  return <SettlementView />;
}
