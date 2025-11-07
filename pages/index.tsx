import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Tonix Chain</title>
        <meta name="description" content="Tonix Chain - Decentralized Lottery on TON" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container">
        <h1>Welcome to Tonix Chain</h1>
        <p>Decentralized Lottery on TON Blockchain</p>
      </main>
    </>
  );
}

