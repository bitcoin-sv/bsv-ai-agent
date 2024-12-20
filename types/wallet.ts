export interface Wallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
  seedPhrase?: string;
  privateKey?: string;
}

export interface SecureWalletInfo {
  seedPhrase: string;
  privateKeyWif: string;
}
