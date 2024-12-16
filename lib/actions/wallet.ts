'use server';

import { PrismaClient, type Wallet as PrismaWallet } from '@prisma/client'; // Import the Wallet type
import {
  generateWallet,
  recreateWalletFromSeedPhrase,
} from '../bsvWallet/bsv-wallet';

const prisma = new PrismaClient();

interface Wallet extends PrismaWallet {
  network: 'testnet' | 'mainnet'; // Ensure the network property is correctly typed
  transactions: {
    id: string;
    amount: number;
    type: string;
    status: string;
    txHash: string;
    createdAt: Date;
  }[];
}

export async function createUserWallet(userId: string) {
  const { walletDetails, secureInfo } = generateWallet('testnet');

  await prisma.wallet.upsert({
    where: { userId },
    update: {
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: walletDetails.network,
    },
    create: {
      userId,
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: walletDetails.network,
    },
  });

  return secureInfo;
}

export async function updateWalletNetwork(
  userId: string,
  network: 'testnet' | 'mainnet'
) {
  const { walletDetails } = generateWallet(network);

  await prisma.wallet.update({
    where: { userId },
    data: {
      network,
      address: walletDetails.address,
    },
  });

  return walletDetails;
}

export async function recoverUserWallet(
  userId: string,
  seedPhrase: string,
  network: 'testnet' | 'mainnet' = 'testnet'
) {
  const { walletDetails, secureInfo } = recreateWalletFromSeedPhrase(
    seedPhrase,
    network
  );

  await prisma.wallet.upsert({
    where: { userId },
    update: {
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: walletDetails.network,
    },
    create: {
      userId,
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: walletDetails.network,
    },
  });

  return secureInfo;
}

export async function getUserWallet(userId: string): Promise<Wallet | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return wallet as Wallet; // Cast the wallet to the custom type
}

export async function getUsers() {
  return prisma.user.findFirst();
}

export async function registerUser(email: string, password: string) {
  const user = await prisma.user.create({
    data: {
      email,
      password: password,
    },
  });

  const { walletDetails, secureInfo } = generateWallet('testnet'); // Use the Network enum

  await prisma.wallet.create({
    data: {
      userId: user.id,
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: 'testnet',
    },
  });

  return { userId: user.id, ...secureInfo };
}
