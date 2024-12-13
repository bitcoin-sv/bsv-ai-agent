import { PrivateKey } from '@bsv/sdk';
import * as bip39 from 'bip39';

export interface WalletDetails {
  address: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
}

export interface SecureWalletInfo {
  seedPhrase: string;
  privateKeyWif: string;
}

export function generateWallet(network: 'testnet' | 'mainnet' = 'testnet'): {
  walletDetails: WalletDetails;
  secureInfo: SecureWalletInfo;
} {
  const seedPhrase = generateSeedPhrase();
  const privateKey = generatePrivateKey(seedPhrase);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey
    .toAddress(network === 'testnet' ? [0x6f] : [0x00])
    .toString();

  return {
    walletDetails: {
      address,
      publicKey: publicKey.toString(),
      network,
    },
    secureInfo: {
      seedPhrase,
      privateKeyWif: privateKey.toWif(),
    },
  };
}

function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

function generatePrivateKey(seedPhrase: string): PrivateKey {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const entropy = seed.slice(0, 32);
  const entropyHex = entropy.toString('hex');
  return PrivateKey.fromString(entropyHex);
}

export function recreateWalletFromSeedPhrase(
  seedPhrase: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): {
  walletDetails: WalletDetails;
  secureInfo: SecureWalletInfo;
} {
  if (!bip39.validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }

  const privateKey = generatePrivateKey(seedPhrase);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey
    .toAddress(network === 'testnet' ? [0x6f] : [0x00])
    .toString();

  return {
    walletDetails: {
      address,
      publicKey: publicKey.toString(),
      network,
    },
    secureInfo: {
      seedPhrase,
      privateKeyWif: privateKey.toWif(),
    },
  };
}
