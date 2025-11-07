import { TonConnectUIProvider } from '@tonconnect/ui-react';
import "../styles/globals.css";

const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || 
  'https://tonix-lottery-ui.vercel.app/tonconnect-manifest.json';

export default function App({ Component, pageProps }: any) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
