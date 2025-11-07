# 🎯 Tonix Lottery Contract (Tact)

Production-grade lottery smart contract on TON blockchain.

## 📋 Features

- ✅ **Buy Ticket** - Purchase lottery tickets
- ✅ **Draw Winner** - Random winner selection (owner only)
- ✅ **Claim Prize** - Winner can claim their prize
- ✅ **Reset Round** - Start new round (owner only)
- ✅ **Emergency Withdraw** - Owner can withdraw funds in emergency (owner only)

## 🔒 Security Features

- ✅ Owner-only functions protected
- ✅ Round state validation
- ✅ Prevention of duplicate participation
- ✅ Gas reserve protection
- ✅ Reentrancy protection (Tact built-in)

## 📦 Contract State

```
- ticketPrice: Int as coins
- participants: Dictionary<Int, Address>
- participantCount: Int
- pool: Int as coins
- roundActive: Bool
- winner: Address?
- winnerCanClaim: Bool
```

## 🚀 Deployment

```bash
npx blueprint run deployLottery
```

Or use the deployment script:
```bash
npx tsx scripts/fix_and_deploy.ts
```

## 📝 Messages

### BuyTicket
Purchase a ticket by sending exact `ticketPrice` amount.

### DrawWinner
Owner can draw winner from participants (requires active round with participants).

### ClaimPrize
Winner can claim their prize (one-time only).

### ResetRound
Owner can reset and start new round (requires round to be inactive and prize claimed).

### EmergencyWithdraw
Owner can withdraw funds in emergency (requires inactive round).

## 🧪 Testing

```bash
npm test
```

## 📚 Documentation

See `/docs` for detailed documentation.

