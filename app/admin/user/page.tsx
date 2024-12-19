import { getUsers } from '@/lib/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersTable } from '@/components/shared/admin/users-table';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600">
          <CardTitle className="text-2xl text-white">User Management</CardTitle>
          <CardDescription className="text-white/90">
            Manage all users across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
