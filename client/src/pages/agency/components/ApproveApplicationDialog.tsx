import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { IAgencyApplication } from '../interfaces';
import { Loader2, CheckCircle } from 'lucide-react';

interface ApproveApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: IAgencyApplication;
  onConfirm: () => Promise<void>;
}

const ApproveApplicationDialog: React.FC<ApproveApplicationDialogProps> = ({
  open,
  onOpenChange,
  application,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to approve application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <AlertDialogTitle>Approve Application</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Application #{application.applicationNoForThisUser}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve this application for{' '}
            <span className="font-semibold">{application.agencyName}</span>?
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">This will automatically:</p>
            <ul className="mt-2 space-y-1 text-sm text-green-700 list-disc list-inside">
              <li>Create the agency: <strong>{application.agencyName}</strong></li>
              <li>Create the first agent with applicant credentials</li>
              <li>Link the agent to the agency</li>
              <li>Mark the application as approved</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve Application
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApproveApplicationDialog;
