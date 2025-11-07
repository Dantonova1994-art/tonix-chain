import React from 'react';
import Head from 'next/head';
import Roadmap from '../components/Roadmap';

export default function RoadmapPage() {
  return (
    <>
      <Head>
        <title>Roadmap — TONIX CHAIN</title>
        <meta name="description" content="Roadmap v1.1 — TONIX CHAIN development plans" />
      </Head>
      <Roadmap />
    </>
  );
}

