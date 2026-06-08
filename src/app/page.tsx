import type { Metadata } from "next";
import HomeView from "./home-view";

export const metadata: Metadata = {
  title: "Qianlu — Thousand Routes · Anonymous Trade Finance on BNB Chain",
  description:
    "Anonymous, wallet-first cross-border trade finance on BNB Chain. Pay, invoice, finance and attest — without identity. Fast. Private. Borderless.",
};

export default function Page() {
  return <HomeView />;
}
