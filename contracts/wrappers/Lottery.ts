import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LotteryConfig = {
    owner: Address;
    ticketPrice: bigint;
};

export function lotteryConfigToCell(config: LotteryConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeCoins(config.ticketPrice)
        .storeDict(null) // participants dict (empty initially)
        .storeUint(0, 16) // count
        .endCell();
}

export class Lottery implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Lottery(address);
    }

    static createFromConfig(config: LotteryConfig, code: Cell, workchain = 0) {
        const data = lotteryConfigToCell(config);
        const init = { code, data };
        return new Lottery(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendBuy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x01, 8) // OP_BUY
                .endCell(),
        });
    }

    async sendDraw(provider: ContractProvider, via: Sender, value: bigint = 0n) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x02, 8) // OP_DRAW
                .endCell(),
        });
    }
}
