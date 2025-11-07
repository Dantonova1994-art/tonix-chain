import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano, Address } from '@ton/core';
import { TonixLottery } from '../build/TonixLottery_TonixLottery';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TonixLottery', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonixLottery');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let player1: SandboxContract<TreasuryContract>;
    let player2: SandboxContract<TreasuryContract>;
    let player3: SandboxContract<TreasuryContract>;
    let lottery: SandboxContract<TonixLottery>;
    
    const TICKET_PRICE = toNano('1');

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        owner = await blockchain.treasury('owner');
        player1 = await blockchain.treasury('player1');
        player2 = await blockchain.treasury('player2');
        player3 = await blockchain.treasury('player3');

        lottery = blockchain.openContract(
            await TonixLottery.fromInit(owner.address, TICKET_PRICE)
        );

        const deployResult = await lottery.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
                bounce: false,
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lottery.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy correctly', async () => {
        const state = await lottery.getTicketPrice(lottery.provider);
        expect(state).toEqual(TICKET_PRICE);
        
        const roundActive = await lottery.getRoundActive(lottery.provider);
        expect(roundActive).toBe(true);
        
        const participantCount = await lottery.getParticipantCount(lottery.provider);
        expect(participantCount).toBe(0n);
    });

    it('should allow players to buy tickets', async () => {
        // Player 1 buys ticket
        const result1 = await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        expect(result1.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: true,
        });

        let participantCount = await lottery.getParticipantCount(lottery.provider);
        expect(participantCount).toBe(1n);

        // Player 2 buys ticket
        const result2 = await lottery.send(
            player2.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        expect(result2.transactions).toHaveTransaction({
            from: player2.address,
            to: lottery.address,
            success: true,
        });

        participantCount = await lottery.getParticipantCount(lottery.provider);
        expect(participantCount).toBe(2n);
    });

    it('should reject incorrect ticket price', async () => {
        const result = await lottery.send(
            player1.getSender(),
            {
                value: toNano('0.5'), // Incorrect price
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: false,
            exitCode: 21547, // "Incorrect ticket price"
        });
    });

    it('should prevent duplicate ticket purchases', async () => {
        // First purchase
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        // Try to buy again
        const result = await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: false,
            exitCode: 59137, // "Already participating in this round"
        });
    });

    it('should allow owner to draw winner', async () => {
        // Two players buy tickets
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            player2.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        // Owner draws winner
        const result = await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: true,
        });

        const roundActive = await lottery.getRoundActive(lottery.provider);
        expect(roundActive).toBe(false);

        const winner = await lottery.getWinner(lottery.provider);
        expect(winner).not.toBeNull();
        expect([player1.address, player2.address]).toContainEqual(winner);
    });

    it('should prevent non-owner from drawing winner', async () => {
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        const result = await lottery.send(
            player1.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: player1.address,
            to: lottery.address,
            success: false,
            exitCode: 132, // "Access denied" from Ownable
        });
    });

    it('should allow winner to claim prize', async () => {
        // Three players buy tickets
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            player2.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            player3.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        // Owner draws winner
        await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        const winner = await lottery.getWinner(lottery.provider);
        expect(winner).not.toBeNull();

        const winnerCanClaim = await lottery.getWinnerCanClaim(lottery.provider);
        expect(winnerCanClaim).toBe(true);

        // Winner claims prize
        const winnerContract = winner! === player1.address 
            ? player1 
            : winner! === player2.address 
            ? player2 
            : player3;

        const winnerBalanceBefore = await winnerContract.getBalance();

        const result = await lottery.send(
            winnerContract.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'ClaimPrize',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: winnerContract.address,
            to: lottery.address,
            success: true,
        });

        const winnerBalanceAfter = await winnerContract.getBalance();
        expect(Number(winnerBalanceAfter)).toBeGreaterThan(Number(winnerBalanceBefore));

        const winnerCanClaimAfter = await lottery.getWinnerCanClaim(lottery.provider);
        expect(winnerCanClaimAfter).toBe(false);
    });

    it('should prevent non-winner from claiming prize', async () => {
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            player2.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        const winner = await lottery.getWinner(lottery.provider);

        // Try to claim with non-winner
        const nonWinner = winner! === player1.address ? player2 : player1;

        const result = await lottery.send(
            nonWinner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'ClaimPrize',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: nonWinner.address,
            to: lottery.address,
            success: false,
            exitCode: 43564, // "Only winner can claim"
        });
    });

    it('should allow owner to reset round', async () => {
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        // Winner claims prize
        const winner = await lottery.getWinner(lottery.provider);
        const winnerContract = winner! === player1.address ? player1 : player1;

        if (winner! === player1.address) {
            await lottery.send(
                player1.getSender(),
                {
                    value: toNano('0.01'),
                    bounce: false,
                },
                {
                    $$type: 'ClaimPrize',
                }
            );
        }

        // Reset round
        const result = await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'ResetRound',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: true,
        });

        const roundActive = await lottery.getRoundActive(lottery.provider);
        expect(roundActive).toBe(true);

        const participantCount = await lottery.getParticipantCount(lottery.provider);
        expect(participantCount).toBe(0n);

        const winnerAfterReset = await lottery.getWinner(lottery.provider);
        expect(winnerAfterReset).toBeNull();
    });

    it('should allow owner to emergency withdraw when round is not active', async () => {
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'DrawWinner',
            }
        );

        const ownerBalanceBefore = await owner.getBalance();

        const result = await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'EmergencyWithdraw',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: true,
        });

        const ownerBalanceAfter = await owner.getBalance();
        expect(Number(ownerBalanceAfter)).toBeGreaterThan(Number(ownerBalanceBefore));
    });

    it('should prevent emergency withdraw during active round', async () => {
        await lottery.send(
            player1.getSender(),
            {
                value: TICKET_PRICE,
                bounce: false,
            },
            {
                $$type: 'BuyTicket',
            }
        );

        const result = await lottery.send(
            owner.getSender(),
            {
                value: toNano('0.01'),
                bounce: false,
            },
            {
                $$type: 'EmergencyWithdraw',
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: lottery.address,
            success: false,
            exitCode: 42251, // "Cannot withdraw during active round"
        });
    });
});

