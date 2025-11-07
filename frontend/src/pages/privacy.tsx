import React from 'react';
import Head from 'next/head';
import styles from '../styles/Legal.module.css';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — TONIX CHAIN</title>
        <meta name="description" content="Privacy Policy for TONIX CHAIN lottery platform" />
      </Head>
      <main className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>🔒 Privacy Policy</h1>
          
          <section className={styles.section}>
            <h2>1. Overview</h2>
            <p>TONIX CHAIN respects your privacy. This application operates as a decentralized application (dApp) and does not collect, store, or process any personal data or user information.</p>
          </section>

          <section className={styles.section}>
            <h2>2. No Data Collection</h2>
            <p>We do not collect or store:</p>
            <ul>
              <li>Personal information or identification data</li>
              <li>Wallet addresses (except as visible on-chain)</li>
              <li>Transaction history (beyond public blockchain records)</li>
              <li>Cookies or tracking identifiers</li>
              <li>Usage analytics or behavioral data</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Wallet Connection</h2>
            <p>When you connect your wallet using TonConnect or similar services:</p>
            <ul>
              <li>The connection is handled directly between your wallet and the blockchain</li>
              <li>No wallet information is transmitted to our servers</li>
              <li>Transaction signing occurs locally in your wallet</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Public Blockchain Data</h2>
            <p>The interface displays information that is publicly available on the TON blockchain, including:</p>
            <ul>
              <li>Contract balance (pool size)</li>
              <li>Number of participants</li>
              <li>Winner addresses (from completed draws)</li>
              <li>Transaction history</li>
            </ul>
            <p>This data is read directly from the blockchain and is not stored by our application.</p>
          </section>

          <section className={styles.section}>
            <h2>5. No Tracking</h2>
            <p>TONIX CHAIN does not use:</p>
            <ul>
              <li>Cookies or local storage for tracking</li>
              <li>Third-party analytics services</li>
              <li>Advertising networks</li>
              <li>User behavior tracking tools</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Blockchain Transparency</h2>
            <p>By using TONIX CHAIN, you acknowledge that:</p>
            <ul>
              <li>All blockchain transactions are publicly visible</li>
              <li>Wallet addresses are pseudonymous but traceable</li>
              <li>Transaction history is permanently recorded on-chain</li>
              <li>This transparency is inherent to blockchain technology</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>TonConnect</strong>: For wallet connections (privacy policy governed by their terms)</li>
              <li><strong>Toncenter API</strong>: For reading blockchain data (public API, no authentication required)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>8. Contact</h2>
            <p>If you have questions about this Privacy Policy, please refer to the TONIX CHAIN contract on the TON blockchain or check our Terms of Use page.</p>
          </section>

          <div className={styles.footer}>
            <p>Last updated: November 2024</p>
            <a href="/" className={styles.link}>← Back to Home</a>
          </div>
        </div>
      </main>
    </>
  );
}
