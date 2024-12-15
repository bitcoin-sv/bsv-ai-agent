'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  createUserWallet,
  recoverUserWallet,
  getUserWallet,
} from '@/lib/actions/wallet';
import { WalletDetails } from '@/components/shared/WalletDetails';

interface Wallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
}

export default function WalletPage() {
  const [walletDetails, setWalletDetails] = useState<Wallet | null>(null);
  const [recoveredWallet, setRecoveredWallet] = useState<Wallet | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [recoveryInput, setRecoveryInput] = useState<string>('');
  const [recoveryMethod, setRecoveryMethod] = useState<'wif' | 'seed' | null>(
    null
  );
  const [error, setError] = useState<string>('');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard', {
          description: `${label} copied successfully`,
        });
      })
      .catch((err) => {
        toast.error('Failed to copy', {
          description: 'Unable to copy to clipboard',
        });
      });
  };

  const generateNewWallet = async () => {
    try {
      //This will be replaced when the issue #2 is completed
      const userId = '7c3bb2a7-6759-415b-a3b8-9fea642c9c20';

      const secureInfo = await createUserWallet(userId);

      const wallet = await getUserWallet(userId);
      if (!wallet) {
        return toast.error('Error', {
          description: 'An error occured, please try again',
        });
      }

      setWalletDetails({
        id: wallet.id,
        userId: wallet.userId,
        address: wallet.address,
        network: wallet.network,
        publicKey: wallet.publicKey,
      });
      setSeedPhrase(secureInfo.seedPhrase);
      setRecoveredWallet(null);
      setError('');
    } catch (err) {
      const errorMessage = `Wallet generation failed: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      toast.error('Wallet Generation Error', {
        description: errorMessage,
      });
    }
  };

  const recoverWallet = async () => {
    setError('');
    try {
      if (!recoveryMethod || !recoveryInput) {
        throw new Error(
          'Please choose a recovery method and enter a seed phrase'
        );
      }

      //This will be replaced when the issue #2 is completed

      const userId = '7c3bb2a7-6759-415b-a3b8-9fea642c9c20';

      const secureInfo = await recoverUserWallet(
        userId,
        recoveryInput,
        network
      );

      const wallet = await getUserWallet(userId);

      if (!wallet) {
        return toast.error('Error', {
          description: 'An error occured, please try again',
        });
      }
      setRecoveredWallet({
        id: wallet.id,
        userId: wallet.userId,
        address: wallet.address,
        network: wallet.network,
        publicKey: wallet.publicKey,
      });
      setError('');
    } catch (err) {
      const errorMessage = `Recovery failed: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      toast.error('Wallet Recovery Error', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
          <CardTitle className="text-2xl text-white">
            Wallet Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Select
            value={network}
            onValueChange={(value: 'testnet' | 'mainnet') => setNetwork(value)}
          >
            <SelectTrigger className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testnet">Testnet</SelectItem>
              <SelectItem value="mainnet">Mainnet</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={generateNewWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Generate New Wallet
          </Button>

          {walletDetails && (
            <WalletDetails
              address={walletDetails.address}
              publicKey={walletDetails.publicKey}
              seedPhrase={seedPhrase}
            />
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-900">
          <CardTitle className="text-2xl text-white">Wallet Recovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Select
            onValueChange={(value) =>
              setRecoveryMethod(value as 'wif' | 'seed')
            }
          >
            <SelectTrigger className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select Recovery Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seed">Seed Phrase</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder={
              recoveryMethod === 'seed'
                ? 'Enter Seed Phrase'
                : 'Enter WIF Private Key'
            }
            value={recoveryInput}
            onChange={(e) => setRecoveryInput(e.target.value)}
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          />

          <Button
            onClick={recoverWallet}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700 text-white transition-colors"
            disabled={!recoveryMethod || !recoveryInput}
          >
            Recover Wallet
          </Button>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg flex items-center space-x-3 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {recoveredWallet && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Recovered Wallet
              </h3>
              <p className="break-all text-green-700 dark:text-green-400">
                <strong>Address:</strong> {recoveredWallet.address}
              </p>
              <p className="break-all text-green-700 dark:text-green-400">
                <strong>Public Key:</strong> {recoveredWallet.publicKey}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
