import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface WalletDetailsProps {
  address: string;
  publicKey: string;
  seedPhrase: string;
}

export const WalletDetails: React.FC<WalletDetailsProps> = ({
  address,
  publicKey,
  seedPhrase,
}) => {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard', {
          description: `${label} copied successfully`,
        });
      })
      .catch(() => {
        toast.error('Failed to copy', {
          description: 'Unable to copy to clipboard',
        });
      });
  };

  const maskText = (text: string) => {
    return text
      .split(' ')
      .map(() => '•')
      .join(' ');
  };

  const renderCopyableField = (label: string, value: string) => (
    <div className="flex items-center space-x-2 break-all">
      <strong className="min-w-[100px]">{label}:</strong>
      <span className="flex-grow truncate">{value}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(value, label)}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
        <CardTitle className="text-2xl text-white">Wallet Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 border dark:border-gray-700">
          {renderCopyableField('Address', address)}
          {renderCopyableField('Public Key', publicKey)}

          <div className="flex items-center space-x-2">
            <strong className="min-w-[100px]">Seed Phrase:</strong>
            <span className="flex-grow">
              {isSeedPhraseVisible ? seedPhrase : maskText(seedPhrase)}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSeedPhraseVisible(!isSeedPhraseVisible)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isSeedPhraseVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(seedPhrase, 'Seed Phrase')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
