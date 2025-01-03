import { type NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateRandomKeyPair } from '@/lib/bsvWallet/key-management';
import { Network } from '@/prisma/generated/client';

export async function GET(request: NextRequest) {
  const homeUrl = request.nextUrl.clone();
  homeUrl.pathname = '/';

  const successUrl = request.nextUrl.clone();
  successUrl.pathname = '/wallet/onboarding';

  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(homeUrl);
  }

  const prismaUser = await prisma.user.findUnique({
    where: { userId: user.id },
  });
  if (prismaUser) {
    return NextResponse.redirect(homeUrl);
  }

  try {
    await prisma.user.create({
      data: {
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        password: 'defaultPassword',
        role: 'user',
      },
    });

    const keyPair = generateRandomKeyPair();

    if (!keyPair.seedPhrase) {
      throw new Error('Failed to generate seed phrase');
    }

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: Network.testnet,
      },
      create: {
        userId: user.id,
        address: keyPair.publicKey.address,
        publicKey: keyPair.publicKey.hex,
        network: Network.testnet,
      },
    });

    const response = NextResponse.redirect(successUrl);

    response.cookies.set({
      name: 'SecureWalletData',
      value: encodeURIComponent(JSON.stringify(keyPair)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
    });

    return response;
  } catch (error) {
    console.error({ Errop: error });
    homeUrl.searchParams.set('error', 'Failed to create account');
    return NextResponse.redirect(homeUrl);
  }
}

export const dynamic = 'force-dynamic';
