'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { updateWalletNetwork } from '@/lib/actions/wallet';
import type { Network } from '@prisma/client';

interface NetworkToggleProps {
  userId: string;
  initialNetwork: Network;
  onNetworkChange: (network: Network) => void;
}

export function NetworkToggle({
  userId,
  initialNetwork,
  onNetworkChange,
}: NetworkToggleProps) {
  const [isMainnet, setIsMainnet] = useState(initialNetwork === 'MAINNET');
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle() {
    setIsUpdating(true);
    const newNetwork = isMainnet ? 'TESTNET' : 'MAINNET';
    try {
      await updateWalletNetwork(userId, newNetwork);
      setIsMainnet(!isMainnet);
      onNetworkChange(newNetwork);
    } catch (error) {
      console.error('Failed to update network:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isMainnet}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      <span className="text-sm font-medium">
        {isMainnet ? 'Mainnet' : 'Testnet'}
      </span>
    </div>
  );
}
