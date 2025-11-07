import React from 'react';
import Head from 'next/head';
import styles from '../styles/Legal.module.css';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Use — TONIX CHAIN</title>
        <meta name="description" content="Terms of Use for TONIX CHAIN lottery platform" />
      </Head>
      <main className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>📜 Terms of Use</h1>
          
          <section className={styles.section}>
            <h2>1. Introduction</h2>
            <p>Welcome to TONIX CHAIN — a decentralized lottery platform built on The Open Network (TON) blockchain. By accessing and using this application, you agree to be bound by these Terms of Use.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Blockchain Transactions</h2>
            <p>All transactions occur directly on the TON blockchain. Once executed, transactions <strong>cannot be reversed or refunded</strong>. Please ensure you understand the implications of blockchain transactions before participating.</p>
          </section>

          <section className={styles.section}>
            <h2>3. User Responsibility</h2>
            <p>You are solely responsible for:</p>
            <ul>
              <li>Securing your wallet and private keys</li>
              <li>All actions performed through your wallet</li>
              <li>Verifying transaction details before confirming</li>
              <li>Understanding the rules and mechanics of the lottery</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Smart Contract Operation</h2>
            <p>TONIX CHAIN operates entirely on-chain through smart contracts. We do not:</p>
            <ul>
              <li>Store user data or personal information</li>
              <li>Hold custody of user assets</li>
              <li>Have the ability to modify or reverse transactions</li>
              <li>Control the outcome of lottery draws</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Participation</h2>
            <p>Participation in the lottery is <strong>entirely voluntary</strong>. By purchasing tickets and interacting with the smart contract, you acknowledge that you have read, understood, and accept these Terms of Use in full.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Risk Disclaimer</h2>
            <p>Cryptocurrency and blockchain activities carry inherent risks. You participate at your own risk. The developers of TONIX CHAIN are not liable for any losses incurred.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Changes to Terms</h2>
            <p>These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.</p>
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
