'use client';

import { useState } from 'react';
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
import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  createUserWallet,
  recoverUserWallet,
  getUserWallet,
} from '@/lib/actions/wallet';
import type { Wallet } from '@/types/wallet';
import { toast } from 'sonner';
import { WalletDetails } from '@/components/shared/WalletDetails';
import { getUserId } from '@/lib/actions/user';

export default function WalletPage() {
  const [walletDetails, setWalletDetails] = useState<Wallet | null>(null);
  const [recoveredWallet, setRecoveredWallet] = useState<Wallet | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [recoveryInput, setRecoveryInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'seed' | null>(null);
  const [error, setError] = useState<string>('');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const generateNewWallet = async () => {
    try {
      setLoading(true);
      const userId = await getUserId();

      const secureInfo = await createUserWallet(userId);
      const wallet = await getUserWallet(userId);

      if (!wallet) {
        throw new Error('Failed to create wallet');
      }

      setWalletDetails(wallet);
      setSeedPhrase(secureInfo.seedPhrase);
      setPrivateKey(secureInfo.privateKeyWif);
      setRecoveredWallet(null);
      setError('');

      toast.success('Success', {
        description: 'New wallet generated successfully',
      });
    } catch (err) {
      const errorMessage = `Wallet generation failed: ${
        err instanceof Error ? err.message : String(err)
      }`;
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const recoverWallet = async () => {
    setError('');
    try {
      setLoading(true);
      if (!recoveryMethod || !recoveryInput) {
        throw new Error(
          'Please choose a recovery method and enter a seed phrase'
        );
      }

      const userId = await getUserId();
      const secureInfo = await recoverUserWallet(
        userId,
        recoveryInput,
        network
      );
      const wallet = await getUserWallet(userId);

      if (!wallet) {
        throw new Error('Failed to recover wallet');
      }

      setRecoveredWallet(wallet);
      setError('');

      toast.success('Success', {
        description: 'Wallet recovered successfully',
      });
    } catch (err) {
      const errorMessage = `Recovery failed: ${
        err instanceof Error ? err.message : String(err)
      }`;
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
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
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            {loading ? 'Generating' : 'Generate New'} Wallet
          </Button>

          {walletDetails && (
            <WalletDetails
              address={walletDetails.address}
              publicKey={walletDetails.publicKey}
              seedPhrase={seedPhrase}
              privateKey={privateKey}
            />
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-900">
          <CardTitle className="text-2xl text-white">Wallet Recovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Select onValueChange={(value) => setRecoveryMethod(value as 'seed')}>
            <SelectTrigger className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select Recovery Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seed">Seed Phrase</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Enter Seed Phrase"
            value={recoveryInput}
            onChange={(e) => setRecoveryInput(e.target.value)}
            className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          />

          <Button
            onClick={recoverWallet}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700 text-white transition-colors"
            disabled={!recoveryMethod || !recoveryInput || loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            {loading ? 'Recovering' : 'Recover'} Wallet
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
              <WalletDetails
                address={recoveredWallet.address}
                publicKey={recoveredWallet.publicKey}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
