'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IUser } from '../../pages/members/types/types';
import type { Dispatch, SetStateAction } from 'react';

interface DeleteConfirmationDialogProps {
  user: IUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  setUserToDelete: Dispatch<SetStateAction<IUser | null>>
}

export default function DeleteConfirmationDialog({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
}: DeleteConfirmationDialogProps) {
  if (!user) {
    return;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete {user.firstName} {user.lastName} ({user.email}). This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            onClick={() => {
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}