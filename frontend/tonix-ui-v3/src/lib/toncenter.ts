const TONCENTER_API = "https://toncenter.com/api/v2";
const API_KEY = "tonix-chain-mainnet-prod"; // твой API-ключ, если есть (можно оставить пустым)
const LOTTERY_CORE_ADDRESS = "EQA8TtwKrKElNI1gMlLFPPsW5erpKYaVCNQKQbe3LVQDtgMR";

export async function getLotteryInfo() {
  try {
    const response = await fetch(
      `${TONCENTER_API}/runGetMethod?address=${LOTTERY_CORE_ADDRESS}&method=get_info${API_KEY ? `&api_key=${API_KEY}` : ""}`
    );
    const data = await response.json();
    if (!data.ok) throw new Error("Ответ TON API некорректен");
    const [round_id, fee_percent, vault_address] = data.result.stack.map((x: any) => x[1]);
    return { round_id, fee_percent, vault_address };
  } catch (error) {
    console.error("Ошибка при вызове get_info:", error);
    return { round_id: 0, fee_percent: 0, vault_address: "" };
  }
}

