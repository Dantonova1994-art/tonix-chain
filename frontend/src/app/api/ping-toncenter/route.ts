import { getHttpEndpoint } from "@orbs-network/ton-access";

export async function GET() {
  try {
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    return new Response(JSON.stringify({ endpoint }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
