import React from 'react';
import Head from 'next/head';
import { TonConnectButton } from '@tonconnect/ui-react';

const SITE_URL = 'https://tonix-lottery-ui.vercel.app';

export default function Home() {
  return (
    <>
      <Head>
        <title>Tonix Chain — Лотерея будущего на TON</title>
        <meta name="description" content="Играй и выигрывай в первой Web3-лотерее на TON 💎" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Tonix Chain — Лотерея будущего на TON" />
        <meta property="og:description" content="Играй и выигрывай в первой Web3-лотерее на TON 💎" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:site_name" content="Tonix Chain" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content="Tonix Chain — Лотерея будущего на TON" />
        <meta name="twitter:description" content="Играй и выигрывай в первой Web3-лотерее на TON 💎" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        
        {/* Telegram */}
        <meta name="telegram:channel" content="@tonixchain" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/icon.png" />
      </Head>
      <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #00ffff 0%, #000055 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '20px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #00ffff, #0088ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          💎 TONIX CHAIN
        </h1>
        <p style={{ 
          marginBottom: '2rem',
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          Лотерея будущего на TON
        </p>
        <div style={{
          marginTop: '20px'
        }}>
          <TonConnectButton />
        </div>
      </main>
    </>
  );
}
