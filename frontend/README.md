# Tonix Chain dApp

Production-ready Next.js dApp with TonConnect integration and TON smart contract support.

## Features

- 🔗 **TonConnect Integration** - Connect TON wallets seamlessly
- 📡 **TON Mainnet Support** - Full integration with TON blockchain
- 🎨 **Modern UI** - TailwindCSS with TONIX brand styling
- ⚡ **Fast & Optimized** - Next.js 14 with static generation
- 🚀 **Vercel Ready** - One-click deployment

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_TONCONNECT_MANIFEST_URL=https://your-domain.vercel.app/tonconnect-manifest.json
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Set **Root Directory** = `frontend`
4. Add environment variables in Vercel Settings
5. Deploy!

## Project Structure

```
frontend/
├── lib/
│   └── ton.ts              # TON client and contract utilities
├── components/
│   ├── Hero.tsx            # Hero section
│   ├── WalletConnect.tsx   # TonConnect wallet integration
│   └── ContractStatus.tsx  # Smart contract status display
├── pages/
│   ├── index.tsx           # Main page
│   └── api/
│       └── ping-toncenter.ts  # API endpoint for TON endpoint
└── tonconnect-manifest.json   # TonConnect manifest
```

## Tech Stack

- **Next.js 14.2.3** - React framework
- **TailwindCSS 3.4.1** - Styling
- **TonConnect** - Wallet integration
- **@ton/core** - TON blockchain SDK
- **@orbs-network/ton-access** - TON endpoint provider

## License

ISC
