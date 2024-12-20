'use client';

import { useState, useEffect } from 'react';
import { Loader2, Coins, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { WalletDetails } from '@/lib/bsvWallet/bsv-wallet';
import {
  getAddressBalance,
  requestTestnetCoins,
  waitForTransaction,
} from '@/lib/bsvWallet/testnet-faucet';
import { toast } from 'sonner';

interface TestnetFaucetProps {
  wallet: WalletDetails;
}

export function TestnetFaucet({ wallet }: TestnetFaucetProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const newBalance = await getAddressBalance(wallet.address);
      setBalance(newBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Error', {
        description: 'Failed to fetch wallet balance',
      });
    }
  };

  const handleRequestCoins = async () => {
    setIsRequesting(true);
    try {
      const response = await requestTestnetCoins(wallet.address);

      toast.success('Request Sent', {
        description: 'Waiting for transaction confirmation...',
      });

      const confirmed = await waitForTransaction(response.txid);
      if (confirmed) {
        await fetchBalance();
        toast.success('Success', {
          description: 'Testnet coins received successfully!',
        });
      } else {
        toast.warning('Warning', {
          description: 'Transaction not confirmed after multiple attempts',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to request testnet coins',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-800 dark:to-orange-900">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-white" />
          <CardTitle className="text-2xl text-white">Testnet Faucet</CardTitle>
        </div>
        <CardDescription className="text-white/90">
          Request testnet BSV for development and testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="bg-muted/50 dark:bg-muted/10 rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Current Balance
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl">
              {balance === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `${balance.toLocaleString()} satoshis`
              )}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchBalance}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span className="sr-only">Refresh balance</span>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleRequestCoins}
          disabled={isRequesting}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
          size="lg"
        >
          {isRequesting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Requesting Coins...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-5 w-5" />
              Request Testnet Coins
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Testnet coins are for testing purposes only and have no real value.
        </p>
      </CardContent>
    </Card>
  );
}
