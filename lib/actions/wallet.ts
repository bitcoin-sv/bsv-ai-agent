'use server';

import { PrismaClient } from '@prisma/client';
import {
  generateWallet,
  recreateWalletFromSeedPhrase,
} from '../bsvWallet/bsv-wallet';

const prisma = new PrismaClient();

export async function createUserWallet(userId: string) {
  const { walletDetails, secureInfo } = generateWallet('testnet');

  await prisma.wallet.create({
    data: {
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

export async function getUserWallet(userId: string) {
  return prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function getUsers() {
  return prisma.user.findFirst();
}

//For testing
export async function simulateTransaction(
  walletId: string,
  amount: number,
  type: 'send' | 'receive'
) {
  return prisma.transaction.create({
    data: {
      walletId,
      amount,
      type,
      status: 'completed',
      txHash: `sim_${Math.random().toString(36).substring(2, 15)}`,
    },
  });
}

//for testing
export async function registerUser(email: string, password: string) {
  const user = await prisma.user.create({
    data: {
      email,
      password: password,
    },
  });

  const { walletDetails, secureInfo } = generateWallet('testnet');

  await prisma.wallet.create({
    data: {
      userId: user.id,
      address: walletDetails.address,
      publicKey: walletDetails.publicKey,
      network: walletDetails.network,
    },
  });

  return { userId: user.id, ...secureInfo };
}
