import { type NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(url);
  }
  const prismaUser = await prisma.user.findUnique({
    where: { userId: user.id },
  });
  if (prismaUser) {
    return NextResponse.redirect(url);
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
  } catch (error) {
    console.error(error);
  }
  return NextResponse.redirect(url);
}

export const dynamic = 'force-dynamic';
