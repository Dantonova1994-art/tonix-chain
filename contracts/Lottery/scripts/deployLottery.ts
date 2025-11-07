import { TonClient, WalletContractV4, internal, toNano } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { readFileSync } from 'fs';
import 'dotenv/config';

(async () => {
  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });

  const mnemonics = process.env.WALLET_MNEMONIC!.split(' ');
  const key = await mnemonicToWalletKey(mnemonics);
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  const walletContract = client.open(wallet);

  console.log('Deploying from:', wallet.address.toString());

  const boc = readFileSync('./build/Lottery.cell');
  const deployAmount = toNano('0.05');

  await walletContract.sendTransfer({
    seqno: await walletContract.getSeqno(),
    secretKey: key.secretKey,
    messages: [internal({
      to: wallet.address,
      value: deployAmount,
      init: { code: boc, data: Buffer.alloc(0) },
      body: 'deploy',
    })],
  });

  console.log('✅ Lottery contract deployed successfully');
})()
