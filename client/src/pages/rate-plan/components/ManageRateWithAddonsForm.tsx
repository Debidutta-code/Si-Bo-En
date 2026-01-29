import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import {
  addAddonToRatePlanService,
  removeAddonFromRatePlanService,
  getAddonsByRatePlanCodeService,
} from "../services";
import { fetchAddOnsService } from "@/pages/add-on/services";
import type { IAddon } from "@/pages/add-on/interface";
import Loader from "@/components/Loader/Loader";

interface ManageAddonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ratePlanCode: string;
  ratePlanName: string;
  propertyId: string;
}

export default function ManageRateWithAddonsForm({
  open,
  onOpenChange,
  ratePlanCode,
  ratePlanName,
  propertyId,
}: ManageAddonsDialogProps) {
  const [allAddons, setAllAddons] = useState<IAddon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, ratePlanCode, propertyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all available addons for the property
      const addonsResponse = await fetchAddOnsService(propertyId);
      
      if (addonsResponse.success) {
        setAllAddons(addonsResponse.data || []);
      } else {
        toast.error(addonsResponse.message || "Failed to fetch addons");
      }

      // Fetch already assigned addons for this rate plan
      const assignedAddonsResponse = await getAddonsByRatePlanCodeService(ratePlanCode);
      
      if (assignedAddonsResponse.success) {
        const assignedIds = new Set<string>(
          (assignedAddonsResponse.data || []).map((addon: IAddon) => addon.id)
        );
        setSelectedAddonIds(assignedIds);
      }
    } catch (error) {
      toast.error("Failed to fetch addon data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get the original assigned addons
      const assignedAddonsResponse = await getAddonsByRatePlanCodeService(ratePlanCode);
      const originalIds = new Set<string>(
        assignedAddonsResponse.success 
          ? (assignedAddonsResponse.data || []).map((addon: IAddon) => addon.id)
          : []
      );

      // Find addons to add (in selectedAddonIds but not in originalIds)
      const toAdd = Array.from(selectedAddonIds).filter((id) => !originalIds.has(id));

      // Find addons to remove (in originalIds but not in selectedAddonIds)
      const toRemove = Array.from(originalIds).filter((id) => !selectedAddonIds.has(id));

      let successCount = 0;
      let errorCount = 0;

      // Add new addons
      for (const addonId of toAdd) {
        const response = await addAddonToRatePlanService(ratePlanCode, addonId);
        if (response.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to add addon ${addonId}:`, response.message);
        }
      }

      // Remove unselected addons
      for (const addonId of toRemove) {
        const response = await removeAddonFromRatePlanService(ratePlanCode, addonId);
        if (response.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to remove addon ${addonId}:`, response.message);
        }
      }

      if (errorCount === 0) {
        toast.success("Addons updated successfully");
        onOpenChange(false);
      } else if (successCount > 0) {
        toast.success(`Updated ${successCount} addon(s), ${errorCount} failed`);
      } else {
        toast.error("Failed to update addons");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Addons</DialogTitle>
          <DialogDescription>
            Select addons to associate with <span className="font-semibold">{ratePlanName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              {allAddons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No addons available for this property.
                  <br />
                  Create addons first to assign them to rate plans.
                </div>
              ) : (
                <div className="space-y-3">
                  {allAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedAddonIds.has(addon.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleToggleAddon(addon.id)}
                    >
                      <Checkbox
                        checked={selectedAddonIds.has(addon.id)}
                        onCheckedChange={() => handleToggleAddon(addon.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{addon.name}</h4>
                          {addon.isActive ? (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-xs text-gray-600 mb-2">
                            {addon.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">Code:</span>
                          <span>{addon.code}</span>
                        </div>
                      </div>
                      {selectedAddonIds.has(addon.id) && (
                        <div className="text-primary">
                          <Plus className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedAddonIds.size} addon(s) selected
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || allAddons.length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}