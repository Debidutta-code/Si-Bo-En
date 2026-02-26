import React, { useState, useEffect } from "react";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import Loader from "@/components/Loader/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateDeviceSpecificPromotion,
  DeviceSpecificPromotionWithRatePlan,
  DeviceType,
  DiscountType,
  CurrencyCode,
} from "../interfaces";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import type { ILoader } from "@/pages/dashboard/interface";

interface DeviceSpecificPromotionFormProps {
  ratePlans: RatePlan[];
  propertyId: string;
  onSubmit: (payload: CreateDeviceSpecificPromotion) => Promise<void>;
  onCancel: () => void;
  editData?: DeviceSpecificPromotionWithRatePlan | null;
  isLoading: ILoader;
}

const defaultPromotion = (
  propertyId: string,
): CreateDeviceSpecificPromotion => ({
  propertyId,
  promotionType: "device_specific",
  ratePlanId: "",
  ratePlanCode: "",
  promotionName: "",
  deviceType: ["mobile" as DeviceType],
  discountType: "percentage" as DiscountType,
  discountValue: 10,
  currencyCode: "USD" as CurrencyCode,
  validFrom: "",
  validTo: null,
  monApplicable: true,
  tueApplicable: true,
  wedApplicable: true,
  thuApplicable: true,
  friApplicable: true,
  satApplicable: true,
  sunApplicable: true,
  isActive: true,
  isAutoApplied: false,
});

const DeviceSpecificPromotionForm: React.FC<
  DeviceSpecificPromotionFormProps
> = ({ ratePlans, propertyId, onSubmit, onCancel, editData, isLoading }) => {
  const [devicePromotion, setDevicePromotion] =
    useState<CreateDeviceSpecificPromotion>(defaultPromotion(propertyId));
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [ratePlanType, setRatePlanType] = useState<"b2b" | "b2c">("b2c");

  // Helper to get applicableDays as an object for the UI
  const applicableDays = {
    monday: devicePromotion.monApplicable,
    tuesday: devicePromotion.tueApplicable,
    wednesday: devicePromotion.wedApplicable,
    thursday: devicePromotion.thuApplicable,
    friday: devicePromotion.friApplicable,
    saturday: devicePromotion.satApplicable,
    sunday: devicePromotion.sunApplicable,
  };

  const dayToField: Record<string, keyof CreateDeviceSpecificPromotion> = {
    monday: "monApplicable",
    tuesday: "tueApplicable",
    wednesday: "wedApplicable",
    thursday: "thuApplicable",
    friday: "friApplicable",
    saturday: "satApplicable",
    sunday: "sunApplicable",
  };

  useEffect(() => {
    if (editData) {
      setDevicePromotion({
        propertyId,
        promotionType: "device_specific",
        ratePlanId: editData.ratePlanId,
        ratePlanCode: editData.ratePlanCode,
        promotionName: editData.promotionName,
        deviceType: editData.deviceType,
        discountType: editData.discountType,
        discountValue: editData.discountValue,
        currencyCode: editData.currencyCode || ("USD" as CurrencyCode),
        validFrom: editData.validFrom
          ? new Date(editData.validFrom).toISOString().split("T")[0]
          : "",
        validTo: editData.validTo
          ? new Date(editData.validTo).toISOString().split("T")[0]
          : null,
        monApplicable: editData.applicableDays.monday,
        tueApplicable: editData.applicableDays.tuesday,
        wedApplicable: editData.applicableDays.wednesday,
        thuApplicable: editData.applicableDays.thursday,
        friApplicable: editData.applicableDays.friday,
        satApplicable: editData.applicableDays.saturday,
        sunApplicable: editData.applicableDays.sunday,
        isActive: editData.isActive,
        isAutoApplied: editData.isAutoApplied,
      });
      setHasEndDate(!!editData.validTo);
      if (editData.ratePlan.b2bAvailable) {
        setRatePlanType("b2b");
      } else if (editData.ratePlan.b2cAvailable) {
        setRatePlanType("b2c");
      }
    }
  }, [editData]);

  // Filter rate plans based on selected type
  const filteredRatePlans = ratePlans.filter((rp) => {
    if (editData?.ratePlanId === rp.id) return true;
    if (ratePlanType === "b2b") return rp.b2bAvailable;
    if (ratePlanType === "b2c") return rp.b2cAvailable;
    return false;
  });

  const handleRatePlanChange = (value: string) => {
    const plan = ratePlans.find((rp) => rp.id === value);
    setDevicePromotion({
      ...devicePromotion,
      ratePlanId: value,
      ratePlanCode: plan?.ratePlanCode || "",
    });
  };

  const handleDeviceToggle = (device: DeviceType) => {
    
    const prev = devicePromotion.deviceType;
    if (prev.includes(device)) {
      if (prev.length === 1) return;
      setDevicePromotion({
        ...devicePromotion,
        deviceType: prev.filter((d) => d !== device),
      });
    } else {
      setDevicePromotion({ ...devicePromotion, deviceType: [...prev, device] });
    }
  };

  const handleDayToggle = (day: string) => {
    const field = dayToField[day];
    if (!field) return;
    setDevicePromotion({
      ...devicePromotion,
      [field]: !applicableDays[day as keyof typeof applicableDays],
    });
  };

  const handleSelectAllDays = () => {
    const allSelected = Object.values(applicableDays).every((v) => v);
    setDevicePromotion({
      ...devicePromotion,
      monApplicable: !allSelected,
      tueApplicable: !allSelected,
      wedApplicable: !allSelected,
      thuApplicable: !allSelected,
      friApplicable: !allSelected,
      satApplicable: !allSelected,
      sunApplicable: !allSelected,
    });
  };

  const getActiveDaysSummary = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const activeDays = Object.entries(applicableDays)
      .filter(([_, isActive]) => isActive)
      .map(([day]) => days.find((d) => d.toLowerCase() === day));
    return activeDays.join(", ");
  };

  const getDeviceIcons = (device: DeviceType) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      case "desktop":
        return <Monitor className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateDeviceSpecificPromotion = {
      ...devicePromotion,
      currencyCode:
        devicePromotion.discountType === "flat"
          ? devicePromotion.currencyCode
          : undefined,
      validTo: hasEndDate ? devicePromotion.validTo || null : null,
    };

    await onSubmit(payload);
  };

  const getDiscountDisplayText = () => {
    if (devicePromotion.discountType === "percentage") {
      return `${devicePromotion.discountValue}% OFF`;
    } else {
      return `${devicePromotion.currencyCode} ${devicePromotion.discountValue} OFF`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm relative">
      {isLoading.isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader text="Processing..." />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {editData ? "Edit" : "Create"} Device-Specific Promotion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Target specific devices with customized promotions (mobile, tablet,
            or desktop users)
          </p>
        </div>

        {/* Device Selection */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Device Type Selection *
          </h4>
          <p className="text-xs text-muted-foreground">
            Select which devices this promotion will be available on
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(["mobile", "tablet", "desktop"] as DeviceType[]).map((device) => (
              <button
                key={device}
                type="button"
                onClick={() => handleDeviceToggle(device)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  devicePromotion.deviceType.includes(device)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                {getDeviceIcons(device)}
                <span className="text-sm font-medium mt-2 capitalize">
                  {device}
                </span>
                {devicePromotion.deviceType.includes(device) && (
                  <span className="text-xs mt-1">Selected</span>
                )}
              </button>
            ))}
          </div>

          {devicePromotion.deviceType.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Active on:{" "}
                <span className="font-medium">
                  {devicePromotion.deviceType
                    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                    .join(", ")}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Rate Plan Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Room types and rate plans
          </h4>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Which rate plan can be added to this promotion? *
            </label>
            {editData ? (
              <div className="px-4 py-2 bg-muted/30 border border-border rounded-md">
                <div className="text-sm font-medium text-foreground">
                  {editData.ratePlan?.ratePlanName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editData.ratePlan?.ratePlanCode}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={ratePlanType === "b2c"}
                      onChange={() => {
                        setRatePlanType("b2c");
                        setDevicePromotion({
                          ...devicePromotion,
                          ratePlanId: "",
                          ratePlanCode: "",
                        });
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      B2C rate plan
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={ratePlanType === "b2b"}
                      onChange={() => {
                        setRatePlanType("b2b");
                        setDevicePromotion({
                          ...devicePromotion,
                          ratePlanId: "",
                          ratePlanCode: "",
                        });
                      }}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      B2B rate plan
                    </span>
                  </label>
                </div>
                <Select
                  value={devicePromotion.ratePlanId}
                  onValueChange={handleRatePlanChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a rate plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRatePlans.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No available {ratePlanType.toUpperCase()} rate plans
                      </div>
                    ) : (
                      filteredRatePlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.ratePlanName} ({plan.ratePlanCode})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Discount Configuration
          </h4>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount Type *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={devicePromotion.discountType === "percentage"}
                  onChange={() =>
                    setDevicePromotion({
                      ...devicePromotion,
                      discountType: "percentage" as DiscountType,
                    })
                  }
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Percentage (%)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={devicePromotion.discountType === "flat"}
                  onChange={() =>
                    setDevicePromotion({
                      ...devicePromotion,
                      discountType: "flat" as DiscountType,
                    })
                  }
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Flat Amount</span>
              </label>
            </div>
          </div>

          {/* Discount Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={devicePromotion.discountValue}
                  onChange={(e) =>
                    setDevicePromotion({
                      ...devicePromotion,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max={
                    devicePromotion.discountType === "percentage"
                      ? "100"
                      : undefined
                  }
                  step={
                    devicePromotion.discountType === "percentage" ? "1" : "0.01"
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {devicePromotion.discountType === "percentage"
                    ? "%"
                    : devicePromotion.currencyCode}
                </span>
              </div>
            </div>

            {/* Currency Selection (only for flat discount) */}
            {devicePromotion.discountType === "flat" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Currency *
                </label>
                <Select
                  value={devicePromotion.currencyCode || "USD"}
                  onValueChange={(value) =>
                    setDevicePromotion({
                      ...devicePromotion,
                      currencyCode: value as CurrencyCode,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              Preview
            </p>
            <p className="text-lg text-blue-700 dark:text-blue-300 mt-1 font-semibold">
              {getDiscountDisplayText()}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Promotion Validity Period *
            </label>

            <div className="space-y-3">
              {/* Start Date */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={devicePromotion.validFrom}
                  onChange={(e) =>
                    setDevicePromotion({
                      ...devicePromotion,
                      validFrom: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>

              {/* End Date Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked)
                      setDevicePromotion({ ...devicePromotion, validTo: null });
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label
                  htmlFor="hasEndDate"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Set end date (optional)
                </label>
              </div>

              {hasEndDate && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={devicePromotion.validTo || ""}
                    onChange={(e) =>
                      setDevicePromotion({
                        ...devicePromotion,
                        validTo: e.target.value,
                      })
                    }
                    min={devicePromotion.validFrom}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                Which days would you like to include? *
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {Object.values(applicableDays).every((v) => v)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(applicableDays).map(([day, isChecked]) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">
                    {day}
                  </span>
                </label>
              ))}
            </div>

            {Object.values(applicableDays).some((v) => v) && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Promotion will be active on:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mt-1">
                  {getDiscountDisplayText()}: Valid from{" "}
                  {devicePromotion.validFrom || "start date"}
                  {hasEndDate && devicePromotion.validTo
                    ? ` to ${devicePromotion.validTo}`
                    : " onwards"}
                  , including {getActiveDaysSummary()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Promotion name *
          </label>
          <p className="text-xs text-muted-foreground">
            What do you want to name this promotion?
          </p>
          <p className="text-xs text-muted-foreground italic">
            This is just for you - users won't be able to see it
          </p>
          <input
            type="text"
            value={devicePromotion.promotionName}
            onChange={(e) =>
              setDevicePromotion({
                ...devicePromotion,
                promotionName: e.target.value,
              })
            }
            placeholder={`${getDiscountDisplayText()} - ${devicePromotion.deviceType.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join("/")} - ${devicePromotion.validFrom || "Start Date"}`}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
        </div>

        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isAutoApplied"
            checked={devicePromotion.isAutoApplied}
            onChange={(e) =>
              setDevicePromotion({
                ...devicePromotion,
                isAutoApplied: e.target.checked,
              })
            }
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isAutoApplied"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            Auto Apply
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {devicePromotion.isAutoApplied
                ? "This promotion is currently auto applied to the reservation"
                : "This promotion is currently not auto applied"}
            </span>
          </label>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg border border-border">
          <input
            type="checkbox"
            id="isActive"
            checked={devicePromotion.isActive}
            onChange={(e) =>
              setDevicePromotion({
                ...devicePromotion,
                isActive: e.target.checked,
              })
            }
            className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-foreground cursor-pointer flex-1"
          >
            Active Status
            <span className="block text-xs text-muted-foreground font-normal mt-0.5">
              {devicePromotion.isActive
                ? "This promotion is currently active"
                : "This promotion is currently inactive"}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            disabled={isLoading.isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={
              isLoading.isLoading ||
              !devicePromotion.ratePlanId ||
              !devicePromotion.promotionName ||
              !devicePromotion.validFrom ||
              devicePromotion.deviceType.length === 0 ||
              !Object.values(applicableDays).some((v) => v)
            }
          >
            {editData ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeviceSpecificPromotionForm;
