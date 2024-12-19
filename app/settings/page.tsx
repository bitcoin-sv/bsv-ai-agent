'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from '@/lib/actions/user';
import type { User } from '@prisma/client';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  //This will be replaced when the issue #2 is completed
  const userId = '7c3bb2a7-6759-415b-a3b8-9fea642c9c20';

  const [email, setEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  async function deleteAccount() {
    if (user) {
      try {
        setLoading(true);
        const deletedUser = await deleteUser(user.id);
        if (deletedUser) {
          toast.success('Account Deleted', {
            description: 'Account deleted successfully',
          });
        } else {
          toast.error('Account Deletion Error', {
            description: 'Could not delete account',
          });
        }
        setLoading(false);
      } catch (err) {
        const errorMessage = `Account Deletion failed: ${err instanceof Error ? err.message : String(err)}`;
        toast.error('Account Deletion Error', {
          description: errorMessage,
        });
        setLoading(false);
      }
    } else {
      toast.error('Account Deletion Error', {
        description: 'No existing user',
      });
    }
  }

  async function changeAccountPassword() {
    if (!user) {
      toast.error('Account Error', {
        description: 'No existing user',
      });
      return;
    }
    if (!newPassword || !oldPassword || !confirmNewPassword) {
      toast.error('Validation Error', {
        description: 'All fields are required',
      });
      return;
    }
    if (oldPassword.length < 3 || newPassword.length < 3) {
      toast.error('Validation Error', {
        description: 'All password fields should be greater than 3 characters',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Validation Error', {
        description: 'Passwords do not match',
      });
      return;
    }
    try {
      setLoading(true);
      const data = {
        currentPassword: oldPassword,
        newPassword,
      };
      const updatedUser = await changePassword(user.id, data);
      if (!updatedUser) {
        toast.error('Password Update Error', {
          description: 'Password update failed',
        });
      } else {
        toast.success('Password Changed', {
          description: 'Password updated successfully',
        });
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = `Account Update failed: ${err instanceof Error ? err.message : String(err)}`;
      toast.error('Account Update Error', {
        description: errorMessage,
      });
      setLoading(false);
    }
  }

  async function updateAccountDetails() {
    if (!user) {
      toast.error('Account Update Error', {
        description: 'No existing user',
      });
      return;
    }
    try {
      if (!validateEmail(email)) {
        toast.error('Validation Error', {
          description: 'Email is invalid',
        });
        return;
      }
      const data = {
        email,
      };
      setLoading(true);
      const updatedUser = await updateUser(user?.id, data);
      if (user) {
        setUser(updatedUser);
        toast.error('Account Updated', {
          description: 'Account updated successfully',
        });
      } else {
        toast.error('Account Update Error', {
          description: 'Account update failed',
        });
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = `Account Update failed: ${err instanceof Error ? err.message : String(err)}`;
      toast.error('Account Update Error', {
        description: errorMessage,
      });
      setLoading(false);
    }
  }
  function validateEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  useEffect(() => {
    async function getUser() {
      try {
        const user = await getUserById(userId);
        setUser(user);
        setEmail(user?.email ?? '');
      } catch (err) {
        toast.error('User loading error', {
          description: 'Could not get user',
        });
        setLoading(false);
      }
    }
    getUser();
  }, []);
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
          <CardTitle className="text-2xl text-white">Update Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white transition-colors"
            onClick={updateAccountDetails}
          >
            Update
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
          <CardTitle className="text-2xl text-white">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white transition-colors"
            onClick={changeAccountPassword}
          >
            Update
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-900">
          <CardTitle className="text-2xl text-white">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="mb-4 dark:text-white transition-colors">
            <span className="font-bold">Warning:</span> Deleting your account is
            irreversible. All data will be permanently lost, and cannot be
            recovered once deleted
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700 text-white transition-colors"
            onClick={deleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
