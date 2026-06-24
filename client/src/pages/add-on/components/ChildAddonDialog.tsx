import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  Pencil,
  Trash2,
  Plus,
  Percent,
  DollarSign,
  X,
} from "lucide-react";
import Loader from "@/components/Loader/Loader";
import type { IChildAddon, ICChildAddoon, IUpdateChildAddon } from "../interface";
import type { DiscountType } from "@/pages/tax-system/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { currencies } from "@/components/currency-code/cuurency";
import { useTranslation } from "react-i18next";

interface ChildAddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ICChildAddoon) => Promise<void>;
  onUpdate: (id: string, data: IUpdateChildAddon) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  childAddons: IChildAddon[];
  addonId: string | null;
  isLoading: boolean;
}

const initialFormState: Omit<ICChildAddoon, "addonId"> = {
  minAge: 0,
  maxAge: 12,
  discountApplicable: false,
  discountType: null,
  discountAmount: null,
  currencyCode: null,
};

export default function ChildAddonDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  onDelete,
  childAddons,
  addonId,
  isLoading,
}: ChildAddonDialogProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Omit<ICChildAddoon, "addonId">>(initialFormState);
  const [editingChildAddon, setEditingChildAddon] = useState<IChildAddon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingChildAddon(null);
  };

  const handleEdit = (childAddon: IChildAddon) => {
    setEditingChildAddon(childAddon);
    setFormData({
      minAge: childAddon.minAge,
      maxAge: childAddon.maxAge,
      discountApplicable: childAddon.discountApplicable,
      discountType: childAddon.discountType,
      discountAmount: childAddon.discountAmount,
      currencyCode: childAddon.currencyCode,
    });
  };

  const handleCancelEdit = () => resetForm();

  const handleSubmit = async () => {
    if (editingChildAddon) {
      const updateData: IUpdateChildAddon = {
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        discountApplicable: formData.discountApplicable,
        discountType: formData.discountApplicable ? formData.discountType : null,
        discountAmount: formData.discountApplicable ? formData.discountAmount : null,
        currencyCode:
          formData.discountApplicable && formData.discountType === "flat"
            ? formData.currencyCode
            : null,
      };
      await onUpdate(editingChildAddon.id, updateData);
    } else {
      if (!addonId) return;
      const createData: ICChildAddoon = {
        addonId,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        discountApplicable: formData.discountApplicable,
        discountType: formData.discountApplicable ? formData.discountType : null,
        discountAmount: formData.discountApplicable ? formData.discountAmount : null,
        currencyCode:
          formData.discountApplicable && formData.discountType === "flat"
            ? formData.currencyCode
            : null,
      };
      await onSave(createData);
    }
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      await onDelete(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null });
      if (editingChildAddon?.id === deleteConfirm.id) resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = (): boolean => {
    if (formData.minAge < 0) return false;
    if (formData.maxAge <= 0) return false;
    if (formData.minAge >= formData.maxAge) return false;
    if (formData.discountApplicable) {
      if (!formData.discountType) return false;
      if (!formData.discountAmount || formData.discountAmount <= 0) return false;
      if (formData.discountType === "percentage" && formData.discountAmount > 100) return false;
      if (formData.discountType === "flat" && !formData.currencyCode) return false;
    }
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              {t("Addon.childAddonDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("Addon.childAddonDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader text={t("Addon.childAddonDialog.loader.loading")} />
            </div>
          ) : (
            <div className="space-y-6 py-4">

              {/* Existing Child Addons List */}
              {childAddons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {t("Addon.childAddonDialog.list.existingAgeGroups", { count: childAddons.length })}
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {childAddons.map((child) => (
                      <div
                        key={child.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          editingChildAddon?.id === child.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Baby className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t("Addon.childAddonDialog.list.ageRange", {
                                min: child.minAge,
                                max: child.maxAge,
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {child.discountApplicable ? (
                                <Badge variant="default" className="text-xs">
                                  {child.discountType === "percentage" ? (
                                    <>
                                      <Percent className="w-3 h-3 mr-1" />
                                      {child.discountAmount}%
                                    </>
                                  ) : (
                                    <>
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {child.discountAmount} {child.currencyCode}
                                    </>
                                  )}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {t("Addon.childAddonDialog.list.noDiscount")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(child)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => setDeleteConfirm({ open: true, id: child.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {childAddons.length > 0 && <div className="border-t border-gray-200" />}

              {/* Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {editingChildAddon
                      ? t("Addon.childAddonDialog.form.editAgeGroup")
                      : t("Addon.childAddonDialog.form.addAgeGroup")}
                  </h4>
                  {editingChildAddon && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-gray-500"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t("Addon.childAddonDialog.form.cancelEdit")}
                    </Button>
                  )}
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-min-age">{t("Addon.childAddonDialog.form.minAge")}</Label>
                    <Input
                      id="child-min-age"
                      type="number"
                      min={0}
                      placeholder={t("Addon.childAddonDialog.form.minAgePlaceholder")}
                      value={formData.minAge}
                      onChange={(e) =>
                        setFormData({ ...formData, minAge: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-max-age">{t("Addon.childAddonDialog.form.maxAge")}</Label>
                    <Input
                      id="child-max-age"
                      type="number"
                      min={1}
                      placeholder={t("Addon.childAddonDialog.form.maxAgePlaceholder")}
                      value={formData.maxAge}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAge: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {formData.minAge >= formData.maxAge && formData.maxAge > 0 && (
                  <p className="text-xs text-red-500">
                    {t("Addon.childAddonDialog.form.ageValidationError")}
                  </p>
                )}

                {/* Discount Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <Label htmlFor="discount-applicable" className="text-sm font-medium">
                      {t("Addon.childAddonDialog.form.customPricingLabel")}
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("Addon.childAddonDialog.form.customPricingDescription")}
                    </p>
                  </div>
                  <Switch
                    id="discount-applicable"
                    checked={formData.discountApplicable}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        discountApplicable: checked,
                        discountType: checked ? formData.discountType : null,
                        discountAmount: checked ? formData.discountAmount : null,
                        currencyCode: checked ? formData.currencyCode : null,
                      })
                    }
                  />
                </div>

                {/* Discount Fields */}
                {formData.discountApplicable && (
                  <div className="space-y-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="space-y-2">
                      <Label htmlFor="discount-type">{t("Addon.childAddonDialog.form.discountType")}</Label>
                      <Select
                        value={formData.discountType || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            discountType: value as DiscountType,
                            currencyCode: value === "percentage" ? null : formData.currencyCode,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("Addon.childAddonDialog.form.discountTypePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            <span className="flex items-center gap-2">
                              <Percent className="w-3.5 h-3.5" />
                              {t("Addon.childAddonDialog.form.discountTypePercentage")}
                            </span>
                          </SelectItem>
                          <SelectItem value="flat">
                            <span className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5" />
                              {t("Addon.childAddonDialog.form.discountTypeFlat")}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount-amount">
                          {t("Addon.childAddonDialog.form.discountAmount")}
                          {formData.discountType === "percentage" && (
                            <span className="text-gray-400 ml-1">
                              {t("Addon.childAddonDialog.form.discountAmountRange")}
                            </span>
                          )}
                        </Label>
                        <Input
                          id="discount-amount"
                          type="number"
                          min={0}
                          max={formData.discountType === "percentage" ? 100 : undefined}
                          placeholder={t("Addon.childAddonDialog.form.discountAmountPlaceholder")}
                          value={formData.discountAmount ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discountAmount: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>

                      {formData.discountType === "flat" && (
                        <div className="space-y-2">
                          <Label htmlFor="currencyCode">
                            {t("Addon.childAddonDialog.form.currencyCode")}
                          </Label>
                          <Select
                            value={formData.currencyCode || "AED"}
                            onValueChange={(value) =>
                              setFormData({ ...formData, currencyCode: value as CurrencyCode })
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
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("Addon.childAddonDialog.buttons.close")}
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
              {editingChildAddon ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  {t("Addon.childAddonDialog.buttons.update")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("Addon.childAddonDialog.buttons.addAgeGroup")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ open, id: open ? deleteConfirm.id : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Addon.childAddonDialog.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Addon.childAddonDialog.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Addon.childAddonDialog.buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("Addon.childAddonDialog.buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}