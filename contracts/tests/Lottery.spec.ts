import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Lottery } from '../wrappers/Lottery';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Lottery', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Lottery');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let player1: SandboxContract<TreasuryContract>;
    let player2: SandboxContract<TreasuryContract>;
    let lottery: SandboxContract<Lottery>;
    
    const TICKET_PRICE = toNano('1');

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        owner = await blockchain.treasury('owner');
        player1 = await blockchain.treasury('player1');
        player2 = await blockchain.treasury('player2');

        lottery = blockchain.openContract(
            Lottery.createFromConfig(
                {
                    owner: owner.address,
                    ticketPrice: TICKET_PRICE,
                },
                code
            )
        );

        const deployResult = await lottery.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lottery.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lottery are ready to use
        const contract = await blockchain.getContract(lottery.address);
        expect(contract.balance > 0n).toBe(true);
    });

    it('should allow buying tickets', async () => {
        // Player 1 buys a ticket
        const buyResult1 = await lottery.sendBuy(player1.getSender(), TICKET_PRICE);

        expect(buyResult1.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: true,
        });

        // Player 2 buys a ticket
        const buyResult2 = await lottery.sendBuy(player2.getSender(), TICKET_PRICE);

        expect(buyResult2.transactions).toHaveTransaction({
            from: player2.address,
            to: lottery.address,
            success: true,
        });

        // Check that contract balance increased
        const contract = await blockchain.getContract(lottery.address);
        expect(contract.balance >= TICKET_PRICE * 2n).toBe(true);
    });

    it('should reject insufficient payment', async () => {
        const insufficientAmount = TICKET_PRICE / 2n;
        
        const buyResult = await lottery.sendBuy(player1.getSender(), insufficientAmount);

        expect(buyResult.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: false,
            exitCode: 100, // insufficient funds error
        });
    });

    it('should allow owner to draw winner', async () => {
        // Two players buy tickets
        await lottery.sendBuy(player1.getSender(), TICKET_PRICE);
        await lottery.sendBuy(player2.getSender(), TICKET_PRICE);

        const lotteryContract = await blockchain.getContract(lottery.address);
        const balanceBeforeDraw = lotteryContract.balance;
        const player1Contract = await blockchain.getContract(player1.address);
        const player2Contract = await blockchain.getContract(player2.address);
        const player1BalanceBefore = player1Contract.balance;
        const player2BalanceBefore = player2Contract.balance;

        // Owner draws winner
        const drawResult = await lottery.sendDraw(owner.getSender(), toNano('0.05'));

        expect(drawResult.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: true,
        });

        // Check that someone received the prize
        const player1BalanceAfter = player1Contract.balance;
        const player2BalanceAfter = player2Contract.balance;

        // One of the players should have received the prize
        const prizeReceived = 
            (player1BalanceAfter > player1BalanceBefore) ||
            (player2BalanceAfter > player2BalanceBefore);
        
        expect(prizeReceived).toBe(true);

        // Contract balance should be significantly reduced (almost empty after fees)
        const balanceAfterDraw = lotteryContract.balance;
        expect(balanceAfterDraw < balanceBeforeDraw / 10n).toBe(true); // Most should be sent
    });

    it('should reject draw from non-owner', async () => {
        // Player buys a ticket
        await lottery.sendBuy(player1.getSender(), TICKET_PRICE);

        // Non-owner tries to draw
        const drawResult = await lottery.sendDraw(player1.getSender(), toNano('0.05'));

        expect(drawResult.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: false,
            exitCode: 103, // owner check failed
        });
    });

    it('should reject draw when no participants', async () => {
        // Try to draw with no participants
        const drawResult = await lottery.sendDraw(owner.getSender(), toNano('0.05'));

        expect(drawResult.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: false,
            exitCode: 101, // no participants error
        });
    });

    it('should reset participants after draw', async () => {
        // Buy tickets
        await lottery.sendBuy(player1.getSender(), TICKET_PRICE);
        await lottery.sendBuy(player2.getSender(), TICKET_PRICE);

        // First draw
        await lottery.sendDraw(owner.getSender(), toNano('0.05'));

        // Buy tickets again after draw
        await lottery.sendBuy(player1.getSender(), TICKET_PRICE);

        // Second draw should work (participants were reset)
        const drawResult2 = await lottery.sendDraw(owner.getSender(), toNano('0.05'));

        expect(drawResult2.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: true,
        });
    });
});
