'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { updateWalletNetwork } from '@/lib/actions/wallet';

interface NetworkToggleProps {
  userId: string;
  initialNetwork: 'testnet' | 'mainnet';
  onNetworkChange: (network: 'testnet' | 'mainnet') => void;
}

export function NetworkToggle({
  userId,
  initialNetwork,
  onNetworkChange,
}: NetworkToggleProps) {
  const [isMainnet, setIsMainnet] = useState(initialNetwork === 'mainnet');
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle() {
    setIsUpdating(true);
    const newNetwork = isMainnet ? 'testnet' : 'mainnet';
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
        className="data-[state=unchecked]:bg-white data-[state=checked]:bg-white text-red-800 ring-green-400"
      />
      <span className="text-sm font-medium">
        {isMainnet ? 'Mainnet' : 'Testnet'}
      </span>
    </div>
  );
}
