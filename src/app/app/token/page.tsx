import type { Metadata } from "next";
import TokenView from "./view";

export const metadata: Metadata = {
  title: "QLU Token · Qianlu",
  description:
    "Stake QLU for fee rebates, financing discounts, governance and FDUSD revenue share. BEP-20 on BNB Chain.",
};

export default function Page() {
  return <TokenView />;
}
