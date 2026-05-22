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
import { useTranslation } from 'react-i18next';
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
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  if (!user) {
        toast.error(t("ManageMembers.toast.userNotFound"));

    return;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ManageMembers.deleteConfirm.title")}</DialogTitle>
          <DialogDescription>
            {t("ManageMembers.deleteConfirm.message", { name: `${user.firstName} ${user.lastName}`, email: user.email })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>{t("ManageMembers.cancel")}</DialogClose>
          <Button
            onClick={() => {
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? t("ManageMembers.deleting") : t("ManageMembers.deleteUserBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}