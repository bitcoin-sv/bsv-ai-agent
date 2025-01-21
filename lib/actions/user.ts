'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@/prisma/generated/client';
import { fetchUser, prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export const changeUserEmail = async (email: string) => {
  const user = await fetchUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  const client = await clerkClient();
  await client.emailAddresses.createEmailAddress({
    userId: user.userId,
    emailAddress: email,
    primary: true,
    verified: true,
  });
  await prisma.user.update({
    where: { userId: user.userId },
    data: { email },
  });
};

export const updateUser = async (userUpdateInput: Prisma.UserUpdateInput) => {
  const user = await fetchUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return prisma.user.update({
    where: { userId: user.userId },
    data: userUpdateInput,
  });
};

export const deleteUser = async () => {
  const user = await fetchUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  const client = await clerkClient();
  await Promise.all([
    client.users.deleteUser(user.userId),
    prisma.user.delete({
      where: { userId: user.userId },
    }),
  ]);
  redirect('/');
};

export const getUserId = async (): Promise<string> => {
  const user = await fetchUser();
  if (!user?.userId) {
    throw new Error('User ID is undefined or user is not authenticated.');
  }

  return user.userId;
};
