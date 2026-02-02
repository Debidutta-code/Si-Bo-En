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
import { Loader2, ImageIcon } from "lucide-react";
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
  onSuccess?: () => void;
}

export default function ManageRateWithAddonsForm({
  open,
  onOpenChange,
  ratePlanCode,
  ratePlanName,
  propertyId,
  onSuccess,
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
          onSuccess?.();  
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
          onSuccess?.();  
        } else {
          errorCount++;
          console.error(`Failed to remove addon ${addonId}:`, response.message);
        }
      }

      if (errorCount === 0) {
        toast.success("Addons updated successfully");
        onOpenChange(false);
        onSuccess?.();  
      } else if (successCount > 0) {
        toast.success(`Updated ${successCount} addon(s), ${errorCount} failed`);
        onSuccess?.();  
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
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Manage Addons</DialogTitle>
          <DialogDescription>
            Select addons to associate with <span className="font-semibold">{ratePlanName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12 px-6">
            <Loader />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-y-auto px-6">
              {allAddons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No addons available for this property.
                  <br />
                  Create addons first to assign them to rate plans.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-4">
                  {allAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className={`relative flex flex-col rounded-lg border transition-all cursor-pointer overflow-hidden ${
                        selectedAddonIds.has(addon.id)
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleToggleAddon(addon.id)}
                    >
                      {/* Image Section */}
                      <div className="relative h-32 bg-gray-100 overflow-hidden">
                        {addon.images && addon.images.length > 0 ? (
                          <img
                            src={addon.images[0]}
                            alt={addon.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {/* Checkbox overlay */}
                        <div className="absolute top-2 left-2">
                          <Checkbox
                            checked={selectedAddonIds.has(addon.id)}
                            onCheckedChange={() => handleToggleAddon(addon.id)}
                            className="bg-white shadow-md"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-3 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-1 flex-1">
                            {addon.name}
                          </h4>
                          {addon.isActive ? (
                            <Badge variant="default" className="text-xs shrink-0">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        
                        {addon.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {addon.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">Code:</span>
                          <span className="font-mono">{addon.code}</span>
                        </div>
                        
                        {addon.postingRhythm && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="font-medium">Rhythm:</span>
                            <span className="capitalize">
                              {addon.postingRhythm.replace(/_/g, " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer with buttons */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
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