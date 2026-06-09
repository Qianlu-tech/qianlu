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
if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork,
    projectId,
    metadata: appKitMetadata,
    themeMode: "light",
    features: { analytics: false, email: false, socials: [] },
  });
}

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
