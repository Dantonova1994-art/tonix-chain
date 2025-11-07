import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";

export async function getClient() {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "mainnet") as "mainnet" | "testnet";
  const endpoint = await getHttpEndpoint({ network });
  return new TonClient({ endpoint });
}

export async function getContractBalance(address: string) {
  const client = await getClient();
  const balance = await client.getBalance(Address.parse(address));
  return Number(balance) / 1e9;
}
