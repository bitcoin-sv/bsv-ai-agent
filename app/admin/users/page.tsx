import { getAllUsers } from '@/lib/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersTable } from '@/components/shared/admin/users-table';
import { ShieldAlert } from 'lucide-react';

export default async function AdminUsersPage() {
  const response = await getAllUsers();

  return (
    <div className="container mx-auto py-8">
      <Card className="mt-10">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600">
          <CardTitle className="text-2xl text-white">User Management</CardTitle>
          <CardDescription className="text-white/90">
            Manage all users across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {response.error ? (
            <div className="flex h-[400px] w-full items-center justify-center">
              <div className="text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {response.error}
                </p>
              </div>
            </div>
          ) : (
            <UsersTable users={response.data ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
