import Head from 'next/head';
import Hero from '../components/Hero';

export default function Home() {
  return (
    <>
      <Head>
        <title>Tonix Chain — Лотерея будущего на TON</title>
        <meta name="description" content="Децентрализованная лотерея нового поколения на TON 💎" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-black text-white">
        <Hero />
      </main>
    </>
  );
}

