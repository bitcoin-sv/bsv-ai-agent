import { PrivateKey, Utils } from '@bsv/sdk';
import * as bip39 from 'bip39';

export interface KeyPair {
  privateKey: {
    hex: string;
    wif: string;
    binary: number[];
  };
  publicKey: {
    hex: string;
    address: string;
    der: string;
  };
  seedPhrase?: string;
}

export function generateRandomKeyPair(): KeyPair {
  const seedPhrase = bip39.generateMnemonic(256);
  return fromSeedPhrase(seedPhrase);
}

export function fromSeedPhrase(seedPhrase: string): KeyPair {
  if (!bip39.validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }

  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const seedHex = seed.slice(0, 32).toString('hex');
  const privateKey = PrivateKey.fromString(seedHex, 'hex');

  return {
    ...createKeyPairFromPrivateKey(privateKey),
    seedPhrase,
  };
}

export function fromHex(hex: string): KeyPair {
  const privateKey = PrivateKey.fromHex(hex);
  return createKeyPairFromPrivateKey(privateKey);
}

export function fromWif(wif: string): KeyPair {
  const privateKey = PrivateKey.fromWif(wif);
  return createKeyPairFromPrivateKey(privateKey);
}

export function fromBinary(binary: Uint8Array | number[]): KeyPair {
  const numberArray =
    binary instanceof Uint8Array ? Array.from(binary) : binary;

  const hex = numberArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const privateKey = PrivateKey.fromString(hex, 'hex');
  return createKeyPairFromPrivateKey(privateKey);
}

function createKeyPairFromPrivateKey(privateKey: PrivateKey): KeyPair {
  const publicKey = privateKey.toPublicKey();

  return {
    privateKey: {
      hex: privateKey.toHex(),
      wif: privateKey.toWif(),
      binary: privateKey.toArray(),
    },
    publicKey: {
      hex: publicKey.toString(),
      address: publicKey.toAddress('testnet').toString(),
      der: publicKey.toDER('hex') as string,
    },
  };
}

export function isValidHex(hex: string): boolean {
  try {
    return /^[0-9a-fA-F]{64}$/.test(hex);
  } catch {
    return false;
  }
}

export function isValidWif(wif: string): boolean {
  try {
    PrivateKey.fromWif(wif);
    return true;
  } catch {
    return false;
  }
}

export function isValidSeedPhrase(phrase: string): boolean {
  return bip39.validateMnemonic(phrase);
}
