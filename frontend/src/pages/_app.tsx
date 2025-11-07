import type { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../styles/globals.css';

const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || 
  'https://tonix-lottery-ui.vercel.app/tonconnect-manifest.json';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Component {...pageProps} />
      <SpeedInsights />
    </TonConnectUIProvider>
  );
}
