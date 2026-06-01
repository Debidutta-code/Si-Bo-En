import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { IAgencyApplication } from '../interfaces';
import { Mail, Phone, Building2, MapPin, DollarSign, Hash } from 'lucide-react';

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: IAgencyApplication;
}

const ApplicationDetailsDialog: React.FC<ApplicationDetailsDialogProps> = ({
  open,
  onOpenChange,
  application,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('ApplicationDetailsDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('ApplicationDetailsDialog.applicationNo', { number: application.applicationNoForThisUser })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <Label className="text-base font-semibold">{t('ApplicationDetailsDialog.sections.status')}</Label>
            <div className="mt-2">
              <Badge 
                variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
                className="text-sm"
              >
                {application.status === 'approved'
                  ? t('ApplicationDetailsDialog.status.approved')
                  : application.status === 'rejected'
                  ? t('ApplicationDetailsDialog.status.rejected')
                  : t('ApplicationDetailsDialog.status.pending')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Applicant Information */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{t('ApplicationDetailsDialog.sections.applicantInformation')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.fullName')}</Label>
                <p className="font-medium mt-1">{application.applicantName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.email')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {application.applicantEmail}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.phoneNumber')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {application.applicantPhone}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Agency Information */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{t('ApplicationDetailsDialog.sections.agencyInformation')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.agencyName')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {application.agencyName}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.agencyType')}</Label>
                <p className="font-medium mt-1">
                  <Badge variant="outline">
                    {application.agencyType === 'travel_agency'
                      ? t('ApplicationDetailsDialog.agencyType.travelAgency')
                      : t('ApplicationDetailsDialog.agencyType.corporate')}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.agencyEmail')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {application.agencyEmail}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.contactNumber')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {application.contactNo}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.taxNumber')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  {application.taxNo}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.iataCode')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  {application.iataCode}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.address')}</Label>
                <p className="font-medium mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  {application.address}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Commission Details */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{t('ApplicationDetailsDialog.sections.commissionDetails')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.commissionType')}</Label>
                <p className="font-medium mt-1">
                  <Badge variant="outline">
                    {application.commissionType === 'percentage'
                      ? t('ApplicationDetailsDialog.commissionType.percentage')
                      : t('ApplicationDetailsDialog.commissionType.fixedAmount')}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('ApplicationDetailsDialog.fields.commissionValue')}</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {application.commissionType === 'percentage'
                    ? `${application.commissionValue}%`
                    : `${application.commissionCurrency || ''} ${application.commissionValue}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsDialog;
