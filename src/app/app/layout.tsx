import type { ReactNode } from "react";
import { AuthGate } from "@/components/qianlu/AuthGate";

// Every /app/* route is wallet-gated: connect → select wallet → authorize (SIWE)
// → dashboard. Until sign-in completes, the gate is shown instead of the page,
// so no per-wallet data (real or placeholder) renders for signed-out visitors.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
