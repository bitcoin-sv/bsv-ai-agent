'use server';

import { revalidatePath } from 'next/cache';
import { mockUsers } from '../mock-data';

export type User = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  isActive: boolean;
};

let users = [...mockUsers];

export async function getUsers(): Promise<User[]> {
  return users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function toggleUserStatus(userId: string) {
  try {
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      isActive: !users[userIndex].isActive,
    };

    revalidatePath('/admin/users');
    return users[userIndex];
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error('Failed to update user status');
  }
}

export async function deleteUser(userId: string) {
  try {
    users = users.filter((user) => user.id !== userId);
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}
