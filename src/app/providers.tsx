"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { SilkBackground } from "@/components/qianlu/SilkBackground";
import { Nav } from "@/components/qianlu/Nav";
import { Footer } from "@/components/qianlu/Footer";
import { PageTransition } from "@/components/qianlu/PageTransition";
import { I18nProvider } from "@/lib/i18n";
import { WalletProvider } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
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
  );
}
