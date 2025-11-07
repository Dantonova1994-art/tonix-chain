import { toNano } from '@ton/core';
import { Lottery } from '../wrappers/Lottery';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ownerAddress = provider.sender().address!;
    const ticketPrice = toNano('1'); // 1 TON per ticket

    const lottery = provider.open(
        Lottery.createFromConfig(
            {
                owner: ownerAddress,
                ticketPrice: ticketPrice,
            },
            await compile('Lottery')
        )
    );

    await lottery.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lottery.address);

    console.log('Lottery contract deployed at:', lottery.address.toString());
    console.log('Owner:', ownerAddress.toString());
    console.log('Ticket price:', ticketPrice.toString(), 'nanoTON');
    
    // You can now interact with the contract:
    // await lottery.sendBuy(provider.sender(), ticketPrice);
    // await lottery.sendDraw(provider.sender(), toNano('0.05'));
}
