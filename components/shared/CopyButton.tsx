'use client';

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const copyToClipboard = () => {
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

  return (
    <Button
      variant="outline"
      size="sm"
      className="dark:border-gray-600 dark:text-gray-300"
      onClick={copyToClipboard}
    >
      <Copy className="h-4 w-4 mr-2" /> Copy {label}
    </Button>
  );
}
