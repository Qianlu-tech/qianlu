import type { Metadata } from "next";
import BatchView from "./view";

export const metadata: Metadata = {
  title: "Batch Payments · Qianlu",
  description:
    "Pay every supplier in a single BSC transaction via a multicall contract. Upload a CSV.",
};

export default function Page() {
  return <BatchView />;
}
