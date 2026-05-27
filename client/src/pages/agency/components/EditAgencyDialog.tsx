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
import type { IAgency, AgencyType, AgentCommissionType } from '../interfaces';
import { Loader2 } from 'lucide-react';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { currencies } from '@/components/currency-code/cuurency';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
          <DialogTitle>{t('EditAgencyDialog.title')}</DialogTitle>
          <DialogDescription>{t('EditAgencyDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Agency Name */}
            <div className="grid gap-2">
              <Label htmlFor="agencyName">{t('EditAgencyDialog.form.agencyName')} *</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                required
              />
            </div>

            {/* Agency Type */}
            <div className="grid gap-2">
              <Label htmlFor="agencyType">{t('EditAgencyDialog.form.agencyType')} *</Label>
              <Select
                value={formData.agencyType}
                onValueChange={(value: AgencyType) => setFormData({ ...formData, agencyType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel_agency">{t('EditAgencyDialog.form.agencyTypeOptions.travelAgency')}</SelectItem>
                  <SelectItem value="corporate">{t('EditAgencyDialog.form.agencyTypeOptions.corporate')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email and Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="agencyEmail">{t('EditAgencyDialog.form.email')} *</Label>
                <Input
                  id="agencyEmail"
                  type="email"
                  value={formData.agencyEmail}
                  onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNo">{t('EditAgencyDialog.form.contactNumber')} *</Label>
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
                <Label htmlFor="taxNo">{t('EditAgencyDialog.form.taxNumber')} *</Label>
                <Input
                  id="taxNo"
                  value={formData.taxNo}
                  onChange={(e) => setFormData({ ...formData, taxNo: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iataCode">{t('EditAgencyDialog.form.iataCode')} *</Label>
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
              <Label htmlFor="commissionType">{t('EditAgencyDialog.form.commissionType')} *</Label>
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
                  <SelectItem value="percentage">{t('EditAgencyDialog.form.commissionTypeOptions.percentage')}</SelectItem>
                  <SelectItem value="fixed">{t('EditAgencyDialog.form.commissionTypeOptions.fixed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Value and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="commissionValue">
                  {formData.commissionType === 'percentage'
                    ? t('EditAgencyDialog.form.commissionValuePercent')
                    : `${t('EditAgencyDialog.form.commissionValue')} *`}
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
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">{t('EditAgencyDialog.form.currencyCode')}</Label>
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
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">{t('EditAgencyDialog.form.address')} *</Label>
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
              {t('EditAgencyDialog.footer.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('EditAgencyDialog.footer.updating') : t('EditAgencyDialog.footer.updateAgency')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgencyDialog;
