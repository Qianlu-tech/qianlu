"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { SilkBackground } from "@/components/qianlu/SilkBackground";
import { Nav } from "@/components/qianlu/Nav";
import { Footer } from "@/components/qianlu/Footer";
import { PageTransition } from "@/components/qianlu/PageTransition";
import { I18nProvider } from "@/lib/i18n";
import {
  WalletProvider,
  wagmiAdapter,
  wagmiConfig,
  networks,
  defaultNetwork,
  projectId,
  appKitMetadata,
} from "@/lib/wallet";

// Initialize the AppKit modal once (client). Renders the unified wallet picker
// (browser extensions, mobile wallets, WalletConnect QR) on connect().
//
// Call this UNCONDITIONALLY (even when projectId is empty). The `useAppKit`
// hook throws if `createAppKit` was never called, which crashes the static
// prerender of pages like `/_not-found` on Vercel when the env var is missing.
// With an empty projectId AppKit doesn't throw — it just registers the modal
// and shows a runtime alert — so the build stays green and wallet connect lights
// up as soon as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is configured.
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork,
  projectId,
  metadata: appKitMetadata,
  themeMode: "light",
  features: { analytics: false, email: false, socials: [] },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <I18nProvider>
            <SilkBackground />
            <Nav />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <Toaster position="top-center" toastOptions={{ className: "glass" }} />
          </I18nProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
