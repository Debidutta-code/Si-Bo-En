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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { IAgencyApplication } from '../interfaces';
import { Loader2, XCircle } from 'lucide-react';

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: IAgencyApplication;
  onConfirm: (rejectionReason: string) => Promise<void>;
}

const RejectApplicationDialog: React.FC<RejectApplicationDialogProps> = ({
  open,
  onOpenChange,
  application,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onConfirm(rejectionReason);
      onOpenChange(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject application:', error);
      setError('Failed to reject application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRejectionReason('');
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Reject Application</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Application #{application.applicationNoForThisUser}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reject the application for{' '}
            <span className="font-semibold">{application.agencyName}</span> by{' '}
            <span className="font-semibold">{application.applicantName}</span>?
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">
              Reason for Rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              placeholder="Please provide a detailed reason for rejecting this application..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError('');
              }}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> The applicant will be notified of this rejection. 
              Please ensure the reason is clear and professional.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !rejectionReason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Application
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectApplicationDialog;
