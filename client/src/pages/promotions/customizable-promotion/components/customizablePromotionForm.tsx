import React, { useState, useEffect } from "react";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import type { RoomTypes } from "@/pages/inventory/types";
import Loader from "@/components/Loader/Loader";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type {
  CreateCustomizableDeal,
  CustomizableDeal,
  ICCustomizableDeals,
} from "../interfaces";
import { Tag, CalendarIcon } from "lucide-react";
import type { IAddon } from "@/pages/add-on/interface";
import type { ILoader } from "@/pages/dashboard/interface";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { currencies } from "@/components/currency-code/cuurency";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { useTranslation } from "react-i18next";

interface CustomizableDealFormProps {
  ratePlans: RatePlan[];
  roomTypes: RoomTypes[];
  addons: IAddon[];
  onSubmit: (payload: CreateCustomizableDeal) => Promise<void>;
  onCancel: () => void;
  editData?: CustomizableDeal | null;
  isLoading: ILoader;
}

const CustomizableDealForm: React.FC<CustomizableDealFormProps> = ({
  ratePlans,
  roomTypes,
  addons,
  onSubmit,
  onCancel,
  editData,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [customizableDeal, setCustomizableDeal] = useState<ICCustomizableDeals>({
    discountType: "percentage",
    discountValue: 0,
    currencyCode: "USD",
    startDate: "",
    endDate: "",
    roomId: "",
    ratePlanId: "",
    applicableAddons: [],
    isActive: true,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    if (editData) {
      setCustomizableDeal({
        discountType: editData.discountType,
        discountValue: editData.discountValue,
        currencyCode: editData.currencyCode || "USD",
        startDate: editData.startDate,
        endDate: editData.endDate,
        roomId: editData.roomId,
        ratePlanId: editData.ratePlanId,
        applicableAddons: editData.CustomizableDealsApplicableAddons.map((a) => a.addOnId),
        isActive: editData.isActive,
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (customizableDeal.discountValue <= 0) {
      toast.error(t("CustomizableDeals.validation.invalidDiscountValue"));
      return;
    }
    if (customizableDeal.discountType === "percentage" && customizableDeal.discountValue > 100) {
      toast.error(t("CustomizableDeals.validation.percentageExceeds100"));
      return;
    }
    if (!customizableDeal.roomId) {
      toast.error(t("CustomizableDeals.validation.selectRoom"));
      return;
    }
    if (!customizableDeal.ratePlanId) {
      toast.error(t("CustomizableDeals.validation.selectRatePlan"));
      return;
    }
    if (!customizableDeal.startDate) {
      toast.error(t("CustomizableDeals.validation.selectStartDate"));
      return;
    }
    if (!customizableDeal.endDate) {
      toast.error(t("CustomizableDeals.validation.selectEndDate"));
      return;
    }
    if (new Date(customizableDeal.startDate) >= new Date(customizableDeal.endDate)) {
      toast.error(t("CustomizableDeals.validation.startDateBeforeEndDate"));
      return;
    }

    const payload: CreateCustomizableDeal = {
      discountType: customizableDeal.discountType,
      discountValue: customizableDeal.discountValue,
      currencyCode: customizableDeal.discountType === "flat" ? customizableDeal.currencyCode : undefined,
      startDate: customizableDeal.startDate,
      endDate: customizableDeal.endDate,
      roomId: customizableDeal.roomId,
      ratePlanId: customizableDeal.ratePlanId,
      applicableAddons: customizableDeal.applicableAddons,
      isActive: customizableDeal.isActive,
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (customizableDeal.discountType === "percentage") {
      return `${customizableDeal.discountValue}% OFF`;
    }
    return `${customizableDeal.currencyCode} ${customizableDeal.discountValue} OFF`;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading.isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text={isLoading.message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {editData ? t("CustomizableDeals.editTitle") : t("CustomizableDeals.createTitle")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("CustomizableDeals.form.formDescription")}
          </p>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">{t("CustomizableDeals.form.discountConfiguration")}</h4>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("CustomizableDeals.form.discountType")}
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={customizableDeal.discountType === "percentage"}
                  onChange={() => setCustomizableDeal({ ...customizableDeal, discountType: "percentage" })}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">{t("CustomizableDeals.form.percentageDiscount")}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={customizableDeal.discountType === "flat"}
                  onChange={() => setCustomizableDeal({ ...customizableDeal, discountType: "flat" })}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">{t("CustomizableDeals.form.fixedAmountDiscount")}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("CustomizableDeals.form.discountValue")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customizableDeal.discountValue}
                  onChange={(e) =>
                    setCustomizableDeal({ ...customizableDeal, discountValue: parseFloat(e.target.value) || 0 })
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-16"
                  placeholder={customizableDeal.discountType === "percentage" ? t("CustomizableDeals.form.discountValuePlaceholderPercentage") : t("CustomizableDeals.form.discountValuePlaceholderAmount")}
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {customizableDeal.discountType === "percentage" ? "% off" : customizableDeal.currencyCode}
                </span>
              </div>
              {customizableDeal.discountType === "percentage" && customizableDeal.discountValue > 100 && (
                <p className="text-xs text-destructive mt-1">{t("CustomizableDeals.form.percentageCannotExceed100")}</p>
              )}
            </div>

            {customizableDeal.discountType === "flat" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">{t("CustomizableDeals.form.currencyCode")}</Label>
                  <Select
                    value={customizableDeal.currencyCode}
                    onValueChange={(value) => setCustomizableDeal({ ...customizableDeal, currencyCode: value as CurrencyCode })}
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
              </>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">{t("CustomizableDeals.form.discountPreview")}</p>
            <p className="text-lg text-blue-700 dark:text-blue-300 mt-1 font-semibold">
              {getDiscountDisplayText()}
            </p>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">{t("CustomizableDeals.form.dealPeriod")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("CustomizableDeals.form.startDate")}</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm",
                      !customizableDeal.startDate && "text-muted-foreground"
                    )}
                  >
                    {customizableDeal.startDate
                      ? format(new Date(customizableDeal.startDate), "PPP")
                      : t("CustomizableDeals.form.pickStartDate")}
                    <CalendarIcon className="w-4 h-4 ml-2 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customizableDeal.startDate ? new Date(customizableDeal.startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setCustomizableDeal({ ...customizableDeal, startDate: date.toISOString() });
                        setStartDateOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("CustomizableDeals.form.endDate")}</label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm",
                      !customizableDeal.endDate && "text-muted-foreground"
                    )}
                  >
                    {customizableDeal.endDate
                      ? format(new Date(customizableDeal.endDate), "PPP")
                      : t("CustomizableDeals.form.pickEndDate")}
                    <CalendarIcon className="w-4 h-4 ml-2 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customizableDeal.endDate ? new Date(customizableDeal.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setCustomizableDeal({ ...customizableDeal, endDate: date.toISOString() });
                        setEndDateOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      (customizableDeal.startDate ? date <= new Date(customizableDeal.startDate) : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">{t("CustomizableDeals.form.applicableRoom")}</h4>
          <Select
            value={customizableDeal.roomId}
            onValueChange={(value) => setCustomizableDeal({ ...customizableDeal, roomId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("CustomizableDeals.form.selectRoom")} />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.length === 0 ? (
                <SelectItem value="none" disabled>{t("CustomizableDeals.form.noRoomsAvailable")}</SelectItem>
              ) : (
                roomTypes.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{room._translations?.roomName || room.roomName}</span>
                      <span className="text-xs text-muted-foreground">({room.roomType})</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {customizableDeal.roomId && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t("CustomizableDeals.form.selected")} <span className="font-semibold">
                  {roomTypes.find(r => r.id === customizableDeal.roomId)?._translations?.roomName || roomTypes.find(r => r.id === customizableDeal.roomId)?.roomName}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Rate Plan Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">{t("CustomizableDeals.form.applicableRatePlan")}</h4>
          <Select
            value={customizableDeal.ratePlanId}
            onValueChange={(value) => setCustomizableDeal({ ...customizableDeal, ratePlanId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("CustomizableDeals.form.selectRatePlan")} />
            </SelectTrigger>
            <SelectContent>
              {ratePlans.length === 0 ? (
                <SelectItem value="none" disabled>{t("CustomizableDeals.form.noRatePlansAvailable")}</SelectItem>
              ) : (
                ratePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{plan._translations?.ratePlanName || plan.ratePlanName}</span>
                      <span className="text-xs text-muted-foreground">({plan.ratePlanCode})</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {customizableDeal.ratePlanId && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t("CustomizableDeals.form.selected")} <span className="font-semibold">
                  {(() => { const p = ratePlans.find(r => r.id === customizableDeal.ratePlanId); return p?._translations?.ratePlanName || p?.ratePlanName; })()}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Add-ons Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("CustomizableDeals.form.applicableAddons")}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t("CustomizableDeals.form.optional")}</p>
              </div>
            </div>
            {addons.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const allSelected = customizableDeal.applicableAddons.length === addons.length;
                  setCustomizableDeal({
                    ...customizableDeal,
                    applicableAddons: allSelected ? [] : addons.map((a) => a.id),
                  });
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {customizableDeal.applicableAddons.length === addons.length ? t("CustomizableDeals.form.deselectAll") : t("CustomizableDeals.form.selectAll")}
              </button>
            )}
          </div>

          {addons.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("CustomizableDeals.form.noAddonsAvailable")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-border rounded-lg p-4 bg-background">
              {addons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors border border-transparent hover:border-border"
                >
                  <input
                    type="checkbox"
                    checked={customizableDeal.applicableAddons.includes(addon.id)}
                    onChange={() => {
                      setCustomizableDeal((prev) => ({
                        ...prev,
                        applicableAddons: prev.applicableAddons.includes(addon.id)
                          ? prev.applicableAddons.filter((id) => id !== addon.id)
                          : [...prev.applicableAddons, addon.id],
                      }));
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{addon._translations?.name || addon.name}</div>
                    <div className="text-xs text-muted-foreground">({addon.code})</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {customizableDeal.applicableAddons.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t("CustomizableDeals.form.selectedAddons", { count: customizableDeal.applicableAddons.length })}
              </p>
            </div>
          )}
        </div>

        {/* Auto Apply + Active */}
        <div className="space-y-3">
          

          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
            <input
              type="checkbox"
              id="isActive"
              checked={customizableDeal.isActive}
              onChange={(e) => setCustomizableDeal({ ...customizableDeal, isActive: e.target.checked })}
              className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer flex-1">
              {t("CustomizableDeals.form.active")}
              <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                {customizableDeal.isActive ? t("CustomizableDeals.form.dealActive") : t("CustomizableDeals.form.dealInactive")}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            disabled={isLoading.isLoading}
          >
            {t("CustomizableDeals.form.cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading.isLoading ||
              !customizableDeal.roomId ||
              !customizableDeal.ratePlanId ||
              !customizableDeal.startDate ||
              !customizableDeal.endDate
            }
          >
            {editData ? t("CustomizableDeals.form.updateDeal") : t("CustomizableDeals.form.createDeal")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomizableDealForm;