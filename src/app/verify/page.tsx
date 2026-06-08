import type { Metadata } from "next";
import VerifyView from "./view";

export const metadata: Metadata = {
  title: "Verify Trade Document · Qianlu",
  description:
    "Verify any trade document against its EAS attestation on BNB Greenfield. Hash-only. No account required.",
};

export default function Page() {
  return <VerifyView />;
}
