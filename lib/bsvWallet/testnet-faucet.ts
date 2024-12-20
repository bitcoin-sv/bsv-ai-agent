const WHATSONCHAIN_API_URL = 'https://api.whatsonchain.com/v1/bsv/test';
const WITNESSONCHAIN_API_URL = 'https://witnessonchain.com/v1';

export interface FaucetResponse {
  code: number;
  message: string;
  raw: string;
  txid: string;
}

export interface BalanceResponse {
  confirmed: number;
  unconfirmed: number;
}

export async function requestTestnetCoins(
  address: string
): Promise<FaucetResponse> {
  try {
    const response = await fetch(`${WITNESSONCHAIN_API_URL}/faucet/tbsv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        channel: 'bsv-ai-wallet',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting testnet coins:', error);
    throw error;
  }
}

export async function getAddressBalance(address: string): Promise<number> {
  try {
    const response = await fetch(
      `${WHATSONCHAIN_API_URL}/address/${address}/balance`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BalanceResponse = await response.json();
    return data.confirmed + data.unconfirmed;
  } catch (error) {
    console.error('Error fetching address balance:', error);
    throw error;
  }
}

export async function waitForTransaction(
  txid: string,
  maxAttempts = 10,
  interval = 5000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${WHATSONCHAIN_API_URL}/tx/hash/${txid}`);

      if (response.ok) {
        const data = await response.json();
        if (data?.txid) {
          return true;
        }
      } else if (response.status !== 404) {
        console.error('Error checking transaction:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking transaction:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}
