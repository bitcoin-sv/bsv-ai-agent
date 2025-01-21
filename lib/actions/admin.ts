'use server';

import type { Prisma } from '@/prisma/generated/client';
import { revalidatePath } from 'next/cache';
import { fetchUser, prisma } from '../prisma';
import { clerkClient } from '@clerk/nextjs/server';

export type User = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  imageUrl: string;
  theme: string;
  updatedAt: Date;
  userId?: string;
};

export type ActionResponse<T = undefined> = {
  data?: T;
  error?: string;
};

export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    const requester = await fetchUser();
    if (!requester) {
      return { error: 'Unauthorized: Please log in to continue' };
    }

    const dbRequester = await prisma.user.findUnique({
      where: { userId: requester.userId },
      select: { role: true },
    });

    if (dbRequester?.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { userId: true },
    });

    if (!userToDelete?.userId) {
      return { error: 'User not found' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { id: userId },
      });

      const client = await clerkClient();
      try {
        await client.users.deleteUser(userToDelete.userId);
      } catch (clerkError) {
        throw new Error(`Failed to delete user from Clerk: ${clerkError}`);
      }
    });

    revalidatePath('/admin/users');
    return { data: undefined };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Failed to delete user' };
  }
}

export async function getAllUsers(): Promise<ActionResponse<User[]>> {
  const user = await fetchUser();
  if (!user) {
    return { error: 'Unauthorized: Please log in to continue' };
  }

  const dbUser = await prisma.user.findUnique({
    where: { userId: user.userId },
    select: { role: true },
  });

  if (dbUser?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' };
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        userId: true,
        imageUrl: true,
        theme: true,
        updatedAt: true,
      },
    });

    return { data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Failed to fetch users' };
  }
}

export async function makeUserAdmin(
  userId: string
): Promise<ActionResponse<User>> {
  try {
    const requester = await fetchUser();
    if (!requester) {
      return { error: 'Unauthorized: Please log in to continue' };
    }

    const dbRequester = await prisma.user.findUnique({
      where: { userId: requester.userId },
      select: { role: true },
    });

    if (dbRequester?.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { error: 'User not found' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' },
    });

    revalidatePath('/admin/users');
    return { data: updatedUser };
  } catch (error) {
    console.error('Error making user admin:', error);
    return { error: 'Failed to update user role' };
  }
}
