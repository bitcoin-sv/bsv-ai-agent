'use server';

import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient();

interface PasswordChangeType {
  currentPassword: string;
  newPassword: string;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });
  return user;
}

export async function updateUser(userId: string, data: Pick<User, 'email'>) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
    },
  });
  return updatedUser;
}

export async function changePassword(userId: string, data: PasswordChangeType) {
  const user = await prisma.user.findUnique({
    where: { id: userId, password: data.currentPassword },
  });
  if (!user) {
    return user;
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: data.newPassword,
    },
  });
  return updatedUser;
}

export async function deleteUser(userId: string) {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });
  return deletedUser;
}
