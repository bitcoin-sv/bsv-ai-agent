import { PrivateKey } from '@bsv/sdk';
import { Network } from '@/prisma/generated/client';
import * as bip39 from 'bip39';

export interface WalletDetails {
  address: string;
  publicKey: string;
  network: Network;
}

export interface SecureWalletInfo {
  seedPhrase: string;
  privateKeyWif: string;
}

// Generate a wallet using the specified network (default is TESTNET)
export function generateWallet(network: Network = Network.testnet): {
  walletDetails: WalletDetails;
  secureInfo: SecureWalletInfo;
} {
  const seedPhrase = generateSeedPhrase();
  const privateKey = generatePrivateKey(seedPhrase);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey
    .toAddress(network === Network.testnet ? [0x6f] : [0x00]) // Use the Network enum
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

// Generate a random seed phrase using bip39
function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

// Generate a private key from the given seed phrase
function generatePrivateKey(seedPhrase: string): PrivateKey {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const entropy = seed.slice(0, 32);
  const entropyHex = entropy.toString('hex');
  return PrivateKey.fromString(entropyHex);
}

// Recreate a wallet from a seed phrase and network type (default is TESTNET)
export function recreateWalletFromSeedPhrase(
  seedPhrase: string,
  network: Network = Network.testnet // Default to TESTNET using the Network enum
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
    .toAddress(network === Network.testnet ? [0x6f] : [0x00]) // Use the Network enum
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
