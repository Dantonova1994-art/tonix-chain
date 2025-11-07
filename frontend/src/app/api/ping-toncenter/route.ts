import { getHttpEndpoint } from "@orbs-network/ton-access";

export async function GET() {
  try {
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    return new Response(JSON.stringify({ endpoint }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
