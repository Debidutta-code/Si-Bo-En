import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createAgenticProperty, getAvailablePropertiesForAgencies } from '../api/agentic-property.api';
import type { ICAgenticProperty, IProperty } from '../interfaces';
import { Loader2 } from 'lucide-react';
import Loader from '@/components/Loader/Loader';
import { useTranslation } from 'react-i18next';

interface AssignPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  onSuccess: () => void;
}

const AssignPropertyDialog: React.FC<AssignPropertyDialogProps> = ({
  open,
  onOpenChange,
  agencyId,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<IProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAvailableProperties();
    }
  }, [open, agencyId]);

  const fetchAvailableProperties = async () => {
    setFetchingProperties(true);
    try {
      const response = await getAvailablePropertiesForAgencies(agencyId);
      if (response.success) {
        setAvailableProperties(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch available properties:', error);
    } finally {
      setFetchingProperties(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;

    setLoading(true);
    try {
      const selectedProperty = availableProperties.find(p => p.id === selectedPropertyId);
      if (!selectedProperty) return;

      const data: ICAgenticProperty = {
        agencyId,
        propertyId: selectedPropertyId,
        propertyCode: selectedProperty.propertyCode,
        propertyName: selectedProperty.propertyName,
        isActive,
      };

      const response = await createAgenticProperty(data);
      if (response.success) {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to assign property:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPropertyId('');
    setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('AssignPropertyDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('AssignPropertyDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {fetchingProperties ? (
          <div className="py-8">
            <Loader text={t('AssignPropertyDialog.loader.loadingProperties')} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Property Selection */}
              <div className="grid gap-2">
                <Label htmlFor="property">{t('AssignPropertyDialog.form.selectProperty')} *</Label>
                {availableProperties.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('AssignPropertyDialog.form.noAvailableProperties')}</p>
                ) : (
                  <Select
                    value={selectedPropertyId}
                    onValueChange={setSelectedPropertyId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('AssignPropertyDialog.form.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.propertyName} ({property.propertyCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('AssignPropertyDialog.form.setAsActive')}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('AssignPropertyDialog.footer.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedPropertyId || availableProperties.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('AssignPropertyDialog.footer.assigning') : t('AssignPropertyDialog.footer.assignProperty')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignPropertyDialog;
