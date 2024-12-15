import { WalletDashboard } from '@/components/shared/WalletDashboard';
import { getUsers, getUserWallet } from '@/lib/actions/wallet';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const userId = '7c3bb2a7-6759-415b-a3b8-9fea642c9c20';
  const wallet = await getUserWallet(userId);
  const user = await getUsers();

  if (!wallet) {
    redirect('/wallet/create-wallet');
  }

  const users = await getUsers();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Your BSV Wallet Dashboard
      </h1>
      <WalletDashboard initialWallet={wallet} />
    </div>
  );
}
