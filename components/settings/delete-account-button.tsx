'use client';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteUser } from '@/lib/actions/user';

const DeleteAccountButton = () => {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => setOpen(open)}
      aria-labelledby="delete-account-dialog-title"
      aria-describedby="delete-account-dialog-description"
    >
      <DialogTrigger asChild>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete your account?
          </DialogTitle>
          <DialogDescription>
            You won&apos;t be able to recover your account after deletion.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="items-center">
          <Button onClick={() => setOpen(false)} size="sm">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await deleteUser();
              signOut();
            }}
            variant="destructive"
            size="sm"
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountButton;
