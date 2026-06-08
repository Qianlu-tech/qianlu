import type { Metadata } from "next";
import SendView from "./view";

export const metadata: Metadata = {
  title: "Send Payment · Qianlu",
  description:
    "Send USDT, FDUSD or USDC to any BSC wallet address. No recipient account required.",
};

export default function Page() {
  return <SendView />;
}
