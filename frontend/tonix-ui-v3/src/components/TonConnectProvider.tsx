"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function TonConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TonConnectUIProvider manifestUrl="https://tonix-lottery-ui.vercel.app/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

