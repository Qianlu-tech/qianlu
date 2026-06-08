import type { Metadata } from "next";
import DashboardView from "./view";

export const metadata: Metadata = {
  title: "Dashboard · Qianlu",
  description: "Your anonymous trade-finance dashboard on BNB Chain.",
};

export default function Page() {
  return <DashboardView />;
}
