'use server';

import {
  PrismaClient,
  type Wallet as PrismaWallet,
  Network,
} from '@/prisma/generated/client';
// import { hash } from 'crypto'
import {
  generateRandomKeyPair,
  fromSeedPhrase,
} from '../bsvWallet/key-management';
// import { hash } from 'bcrypt'

const prisma = new PrismaClient();

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  txHash: string;
  createdAt: Date;
}

interface Wallet extends PrismaWallet {
  network: 'testnet' | 'mainnet';
  transactions: Transaction[];
}

interface WalletResponse {
  seedPhrase: string;
  privateKeyWif: string;
}

interface SecureWalletInfo {
  seedPhrase: string;
  privateKeyWif: string;
}

export async function createUserWallet(
  userId: string
): Promise<WalletResponse> {
  try {
    const keyPair = generateRandomKeyPair();

    if (!keyPair.seedPhrase) {
      throw new Error('Failed to generate seed phrase');
    }

    await prisma.wallet.upsert({
      where: { userId },
      update: {
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: Network.testnet,
      },
      create: {
        userId,
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: Network.testnet,
      },
    });

    return {
      seedPhrase: keyPair.seedPhrase,
      privateKeyWif: keyPair.privateKey.wif,
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error(
      `Failed to create wallet: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function updateWalletNetwork(
  userId: string,
  network: 'testnet' | 'mainnet'
): Promise<{ address: string; network: Network }> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        network: network === 'testnet' ? Network.testnet : Network.mainnet,
      },
    });

    return {
      address: updatedWallet.address,
      network: updatedWallet.network,
    };
  } catch (error) {
    console.error('Error updating wallet network:', error);
    throw new Error(
      `Failed to update wallet network: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function recoverUserWallet(
  userId: string,
  seedPhrase: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<WalletResponse> {
  try {
    const keyPair = fromSeedPhrase(seedPhrase);

    if (!keyPair.seedPhrase) {
      throw new Error('Failed to recover seed phrase');
    }

    await prisma.wallet.upsert({
      where: { userId },
      update: {
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: network === 'testnet' ? Network.testnet : Network.mainnet,
      },
      create: {
        userId,
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: network === 'testnet' ? Network.testnet : Network.mainnet,
      },
    });

    return {
      seedPhrase: keyPair.seedPhrase,
      privateKeyWif: keyPair.privateKey.wif,
    };
  } catch (error) {
    console.error('Error recovering wallet:', error);
    throw new Error(
      `Failed to recover wallet: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function getUserWallet(userId: string): Promise<Wallet | null> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!wallet) return null;

    return {
      ...wallet,
      network: wallet.network.toLowerCase() as 'testnet' | 'mainnet',
    };
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw new Error(
      `Failed to fetch wallet: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function getUsers() {
  try {
    return await prisma.user.findFirst();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(
      `Failed to fetch users: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ userId: string } & SecureWalletInfo> {
  try {
    // const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: 'hashedPassword',
      },
    });

    const keyPair = generateRandomKeyPair();

    if (!keyPair.seedPhrase) {
      throw new Error('Failed to generate seed phrase');
    }

    await prisma.wallet.create({
      data: {
        userId: user.id,
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: Network.testnet,
      },
    });

    return {
      userId: user.id,
      seedPhrase: keyPair.seedPhrase,
      privateKeyWif: keyPair.privateKey.wif,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error(
      `Failed to register user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
