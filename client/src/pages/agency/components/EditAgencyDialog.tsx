import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateAgency } from '../api/agency.api';
import type { IAgency, AgencyType, AgentCommissionType, CurrencyCode } from '../interfaces';
import { Loader2 } from 'lucide-react';

interface EditAgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency: IAgency;
  onSuccess: () => void;
}

const EditAgencyDialog: React.FC<EditAgencyDialogProps> = ({
  open,
  onOpenChange,
  agency,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IAgency>(agency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateAgency(agency.id, formData);
      if (response.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update agency:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agency</DialogTitle>
          <DialogDescription>Update agency information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Agency Name */}
            <div className="grid gap-2">
              <Label htmlFor="agencyName">Agency Name *</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                required
              />
            </div>

            {/* Agency Type */}
            <div className="grid gap-2">
              <Label htmlFor="agencyType">Agency Type *</Label>
              <Select
                value={formData.agencyType}
                onValueChange={(value: AgencyType) => setFormData({ ...formData, agencyType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel_agency">Travel Agency</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email and Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="agencyEmail">Email *</Label>
                <Input
                  id="agencyEmail"
                  type="email"
                  value={formData.agencyEmail}
                  onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNo">Contact Number *</Label>
                <Input
                  id="contactNo"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Tax No and IATA Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="taxNo">Tax Number *</Label>
                <Input
                  id="taxNo"
                  value={formData.taxNo}
                  onChange={(e) => setFormData({ ...formData, taxNo: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iataCode">IATA Code *</Label>
                <Input
                  id="iataCode"
                  value={formData.iataCode}
                  onChange={(e) => setFormData({ ...formData, iataCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Commission Type */}
            <div className="grid gap-2">
              <Label htmlFor="commissionType">Commission Type *</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(value: AgentCommissionType) =>
                  setFormData({ ...formData, commissionType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Value and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="commissionValue">
                  Commission Value * {formData.commissionType === 'percentage' ? '(%)' : ''}
                </Label>
                <Input
                  id="commissionValue"
                  type="number"
                  step="0.01"
                  value={formData.commissionValue}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionValue: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              {formData.commissionType === 'fixed' && (
                <div className="grid gap-2">
                  <Label htmlFor="commissionCurrency">Currency</Label>
                  <Select
                    value={formData.commissionCurrency || 'USD'}
                    onValueChange={(value: CurrencyCode) =>
                      setFormData({ ...formData, commissionCurrency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Agency
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgencyDialog;
