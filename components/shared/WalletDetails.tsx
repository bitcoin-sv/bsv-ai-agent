import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WalletDetailsProps {
  address: string;
  publicKey: string;
  seedPhrase?: string;
  privateKey?: string;
}

export function WalletDetails({
  address,
  publicKey,
  seedPhrase,
  privateKey,
}: WalletDetailsProps) {
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Address:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(address, 'Address')}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <code className="block w-full p-2 bg-muted rounded text-xs break-all">
          {address}
        </code>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Public Key:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(publicKey, 'Public Key')}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <code className="block w-full p-2 bg-muted rounded text-xs break-all">
          {publicKey}
        </code>
      </div>

      {privateKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Private Key (Save this safely!):
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(privateKey, 'Seed Phrase')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <code className="block w-full p-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded text-xs break-all border border-red-200 dark:border-red-800">
            {privateKey}
          </code>
        </div>
      )}
      {seedPhrase && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Seed Phrase (Save this safely!):
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(seedPhrase, 'Seed Phrase')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <code className="block w-full p-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded text-xs break-all border border-red-200 dark:border-red-800">
            {seedPhrase}
          </code>
        </div>
      )}
    </div>
  );
}
