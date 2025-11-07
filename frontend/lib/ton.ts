import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, toNano } from '@ton/core';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';

// Конфигурация сети
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Получение TON endpoint
export async function getTonClient(): Promise<TonClient> {
  const endpoint = await getHttpEndpoint({ network: NETWORK as 'mainnet' | 'testnet' });
  return new TonClient({ endpoint });
}

// Базовый класс для работы с контрактом
export class TonixLottery implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new TonixLottery(address);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: 1,
      body: beginCell().endCell(),
    });
  }

  // Геттеры для получения данных контракта
  async getState(provider: ContractProvider) {
    const state = await provider.getState();
    return {
      balance: state.balance,
      state: state.state,
    };
  }

  async getContractData(provider: ContractProvider) {
    try {
      const result = await provider.get('get_contract_data', []);
      return result.stack;
    } catch (error) {
      console.error('Error getting contract data:', error);
      return null;
    }
  }
}

// Утилиты для работы с адресами
export function formatAddress(address: string | Address): string {
  const addr = typeof address === 'string' ? Address.parse(address) : address;
  const full = addr.toString();
  return `${full.slice(0, 6)}...${full.slice(-4)}`;
}

// Утилиты для работы с TON
export function toTON(nano: bigint | string): string {
  const value = typeof nano === 'string' ? BigInt(nano) : nano;
  return (Number(value) / 1e9).toFixed(2);
}

export function fromTON(ton: string): bigint {
  return BigInt(Math.floor(parseFloat(ton) * 1e9));
}

