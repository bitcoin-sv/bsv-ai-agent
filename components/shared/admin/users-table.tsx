'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { deleteUser, makeUserAdmin, getAllUsers } from '@/lib/actions/admin';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  imageUrl: string;
  theme: string;
  updatedAt: Date;
  userId?: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'promote' | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Verify admin status on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      const response = await getAllUsers();
      if (response.error) {
        setError(response.error);
      }
    };
    verifyAdmin();
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setLoading(selectedUser.id);
      const response = await deleteUser(selectedUser.id);

      if (response.error) {
        toast.error('Error', {
          description: response.error,
        });
        return;
      }

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      toast.success('Success', {
        description: 'User deleted successfully',
      });
    } finally {
      setLoading(null);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) return;

    try {
      setLoading(selectedUser.id);
      const response = await makeUserAdmin(selectedUser.id);

      if (response.error) {
        toast.error('Error', {
          description: response.error,
        });
        return;
      }

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: 'admin' } : u
        )
      );
      setIsDeleteDialogOpen(false);
      toast.success('Success', {
        description: 'User promoted to admin successfully',
      });
    } finally {
      setLoading(null);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-mono">{user.userId}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role.toLowerCase() === 'admin'
                        ? 'default'
                        : 'secondary'
                    }
                    className="flex w-fit items-center gap-1"
                  >
                    {user.role.toLowerCase() === 'admin' ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role.toLowerCase() !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('promote');
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('delete');
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'delete'
                ? 'Are you absolutely sure?'
                : 'Promote to Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'delete'
                ? 'This action cannot be undone. This will permanently delete the user account and remove all associated data.'
                : 'This will grant administrative privileges to this user. They will have full access to manage users and system settings.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedUser(null);
                setActionType(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actionType === 'delete' ? handleDelete : handleMakeAdmin}
              className={
                actionType === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {actionType === 'delete' ? 'Delete' : 'Promote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
