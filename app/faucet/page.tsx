'use client';

import { useEffect, useState } from 'react';
import { TestnetFaucet } from '@/components/shared/testnet-faucet';
import { getUserWallet } from '@/lib/actions/wallet';
import type { WalletDetails } from '@/lib/bsvWallet/bsv-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchUser } from '@/lib/prisma';
import { getUserId } from '@/lib/actions/user';

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      try {
        setLoading(true);
        setError(null);
        const userId = await getUserId();
        const fetchedWallet = await getUserWallet(userId);

        if (!fetchedWallet) {
          throw new Error('Failed to fetch wallet');
        }

        setWallet({
          address: fetchedWallet.address,
          publicKey: fetchedWallet.publicKey,
          network: fetchedWallet.network,
        });
      } catch (err) {
        console.error('Error fetching wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Wallet Found</AlertTitle>
          <AlertDescription>
            Please create a wallet to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
            <CardTitle className="text-2xl text-white">Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Address
              </div>
              <code className="block w-full p-2 bg-muted rounded text-xs break-all">
                {wallet.address}
              </code>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Public Key
              </div>
              <code className="block w-full p-2 bg-muted rounded text-xs break-all">
                {wallet.publicKey}
              </code>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Network
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    wallet.network === 'testnet'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <span className="capitalize">{wallet.network}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <TestnetFaucet wallet={wallet} />
      </div>
    </div>
  );
}
