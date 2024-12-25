import { ClearCookie } from '@/components/shared/clear-cookie';
import { CopyButton } from '@/components/shared/CopyButton';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface WalletData {
  seedPhrase: string;
  privateKey: {
    wif: string;
  };
  publicKey: {
    address: string;
    hex: string;
  };
}

export default async function SuccessPage() {
  const cookieStore = cookies();
  const secureWalletDataCookie = cookieStore.get('SecureWalletData');

  if (!secureWalletDataCookie) {
    redirect('/');
  }

  let walletData: WalletData;
  try {
    walletData = JSON.parse(decodeURIComponent(secureWalletDataCookie.value));
  } catch (error) {
    console.error('Failed to parse SecureWalletData:', error);
    redirect('/');
  }

  return (
    <>
      <ClearCookie />
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
            <CardTitle className="text-2xl text-white">
              Wallet Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4 border dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Address
                  </h3>
                  <CopyButton
                    text={walletData.publicKey.address}
                    label="Address"
                  />
                </div>
                <p className="break-all text-gray-700 dark:text-gray-300">
                  {walletData.publicKey.address}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Public Key
                  </h3>
                  <CopyButton
                    text={walletData.publicKey.hex}
                    label="Public Key"
                  />
                </div>
                <p className="break-all text-gray-700 dark:text-gray-300">
                  {walletData.publicKey.hex}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Seed Phrase
                  </h3>
                  <CopyButton
                    text={walletData.seedPhrase}
                    label="Seed Phrase"
                  />
                </div>
                <p className="break-all text-gray-700 dark:text-gray-300">
                  {walletData.seedPhrase}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Private Key
                  </h3>
                  <CopyButton
                    text={walletData.privateKey.wif}
                    label="Private Key"
                  />
                </div>
                <p className="break-all text-gray-700 dark:text-gray-300">
                  {walletData.privateKey.wif}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ Important: Save these details securely. They will not be
                shown again. Never share your seed phrase or private key with
                anyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
