import React, { useState } from 'react';
import Head from 'next/head';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Hero from '../components/Hero';
import StatusCard from '../components/StatusCard';
import Tabs from '../components/Tabs';
import ConnectButton from '../components/ConnectButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tonix-lottery-ui.vercel.app';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const connected = wallet !== null;

  // Mock data for testing
  const [mockData] = useState({
    status: 'Active' as 'Active' | 'Drawing' | 'Finished',
    prizePool: '1,250.5 TON',
    participants: 342,
    nextDraw: '2024-12-25 18:00',
  });

  const handleStartGame = () => {
    if (!connected) {
      tonConnectUI?.openModal();
    } else {
      // Handle buy ticket logic here
      console.log('Buy ticket');
    }
  };

  return (
    <>
      <Head>
        <title>Tonix Chain — Лотерея будущего на TON</title>
        <meta name="description" content="Децентрализованная лотерея нового поколения на TON 💎" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Tonix Chain — Лотерея будущего на TON" />
        <meta property="og:description" content="Децентрализованная лотерея нового поколения на TON 💎" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:site_name" content="Tonix Chain" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content="Tonix Chain — Лотерея будущего на TON" />
        <meta name="twitter:description" content="Децентрализованная лотерея нового поколения на TON 💎" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        
        {/* Telegram */}
        <meta name="telegram:channel" content="@tonixchain" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/icon.png" />
      </Head>

      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Hero Section */}
        <Hero onStartGame={handleStartGame} />

        {/* Status Card - positioned on the right side of hero */}
        <div className="relative -mt-32 mb-12 px-4 flex justify-end max-w-7xl mx-auto">
          <div className="w-full max-w-sm">
            <StatusCard
              status={mockData.status}
              prizePool={mockData.prizePool}
              participants={mockData.participants}
              nextDraw={mockData.nextDraw}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="relative z-10 pb-20">
          <Tabs
            prizePool={mockData.prizePool}
            participants={mockData.participants}
            nextDraw={mockData.nextDraw}
          />
        </div>

        {/* Wallet Connection Section */}
        <div className="relative z-10 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-4 text-white">Подключите кошелек</h3>
              <ConnectButton />
              
              {connected && (
                <div className="mt-6">
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-neon-gradient rounded-xl font-bold text-white neon-glow neon-glow-hover transform transition-all duration-300 hover:scale-105"
                  >
                    Купить билет
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom button for mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-cyan-500/20 md:hidden z-50">
          <button
            onClick={handleStartGame}
            className="w-full px-6 py-4 bg-neon-gradient rounded-xl font-bold text-lg text-white neon-glow"
          >
            НАЧАТЬ ИГРУ
          </button>
        </div>
      </main>
    </>
  );
}
