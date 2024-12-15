'use client';
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { NetworkToggle } from './NetworkToggle';

interface Transaction {
  id: string;
  amount: number;
  type: 'send' | 'receive';
  status: string;
  txHash: string;
  createdAt: Date;
}

interface WalletDashboardProps {
  initialWallet: {
    id: string;
    userId: string;
    address: string;
    publicKey: string;
    network: 'testnet' | 'mainnet';
    transactions: {
      id: string;
      amount: number;
      type: string;
      status: string;
      txHash: string;
      createdAt: Date;
    }[];
  };
}

export function WalletDashboard({ initialWallet }: WalletDashboardProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [copiedField, setCopiedField] = useState<
    'address' | 'publicKey' | null
  >(null);

  function handleNetworkChange(newNetwork: 'testnet' | 'mainnet') {
    setWallet({ ...wallet, network: newNetwork });
  }

  const copyToClipboard = (text: string, field: 'address' | 'publicKey') => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard', {
          description:
            field === 'address' ? 'Wallet address copied' : 'Public key copied',
          duration: 2000,
        });

        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        toast.error('Failed to copy', {
          description: 'Unable to copy to clipboard',
        });
      });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900 py-4 px-6">
        <CardTitle className="flex justify-between items-center text-white">
          <span className="text-xl font-bold tracking-wide">
            BSV Wallet Dashboard
          </span>
          <NetworkToggle
            userId={wallet.userId}
            initialNetwork={wallet.network}
            onNetworkChange={handleNetworkChange}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm relative">
            <div className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Public Address
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800 dark:text-gray-200 break-all pr-2">
                {wallet.address}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                onClick={() => copyToClipboard(wallet.address, 'address')}
              >
                {copiedField === 'address' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm relative">
            <div className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Public Key
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800 dark:text-gray-200 break-all pr-2">
                {wallet.publicKey}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                onClick={() => copyToClipboard(wallet.publicKey, 'publicKey')}
              >
                {copiedField === 'publicKey' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Transaction History
          </h3>

          {wallet.transactions.length > 0 ? (
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-100 dark:divide-gray-600">
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        tx.type === 'receive'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'receive' ? '+' : '-'} {tx.amount.toFixed(8)}{' '}
                      BSV
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                    {tx.txHash}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              No transactions yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
