import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function App({ Component, pageProps }: any) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
