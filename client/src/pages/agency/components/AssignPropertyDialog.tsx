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
          <DialogTitle>Assign Property to Agency</DialogTitle>
          <DialogDescription>
            Select a property to assign to this agency.
          </DialogDescription>
        </DialogHeader>

        {fetchingProperties ? (
          <div className="py-8">
            <Loader text="Loading available properties..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Property Selection */}
              <div className="grid gap-2">
                <Label htmlFor="property">Select Property *</Label>
                {availableProperties.length === 0 ? (
                  <p className="text-sm text-gray-500">No available properties to assign</p>
                ) : (
                  <Select
                    value={selectedPropertyId}
                    onValueChange={setSelectedPropertyId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
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
                  Set as active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedPropertyId || availableProperties.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Property
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignPropertyDialog;
