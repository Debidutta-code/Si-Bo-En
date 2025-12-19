'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { IUser } from '../../pages/members/types/types';
import type { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';

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
  setUserToDelete
}: DeleteConfirmationDialogProps) {
  if (!user) {
    toast.error("User Not Found for Delete");
    return;
  }
              setUserToDelete(user);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
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