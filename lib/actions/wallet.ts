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
  });
}
