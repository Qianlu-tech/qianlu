import type { Metadata } from "next";
import DocumentsView from "./view";

export const metadata: Metadata = {
  title: "Trade Documents · Qianlu",
  description: "Hash-only document attestation on BNB Greenfield. EAS-signed. Zero PII.",
};

export default function Page() {
  return <DocumentsView />;
}
