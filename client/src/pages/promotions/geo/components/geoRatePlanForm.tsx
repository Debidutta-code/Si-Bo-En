import type { RoomTypes } from '@/pages/inventory/types';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateGeoRatePlan, GeoRatePlan, GeoRestrictionType, GeoRestrictionTypeAction, IGeoRatePlanUORC } from '../interfaces';
import { countries, searchCountries } from '@/pages/bookings/utils/country.utils';
import Loader from '@/components/Loader/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ILoader } from '@/pages/dashboard/interface';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { Label } from '@/components/ui/label';
import { currencies } from '@/components/currency-code/cuurency';

interface GeoRatePlanFormProps {
  propertyId: string;
  roomTypes: RoomTypes[];
  ratePlans: RatePlan[];
  onSubmit: (payload: CreateGeoRatePlan) => Promise<void>;
  onCancel: () => void;
  editData?: GeoRatePlan | null;
  isLoading: ILoader;
}

const GeoRatePlanForm: React.FC<GeoRatePlanFormProps> = ({
  propertyId,
  roomTypes,
  ratePlans,
  onSubmit,
  onCancel,
  editData,
  isLoading
}) => {
  const { t } = useTranslation();
  // console.log("Qsie", editData)
  const [geoRatePlan, setGeoRatePlan] = useState<IGeoRatePlanUORC>({
    selectedRooms: [],
    selectedRatePlans: [],
    restrictionType: "percentage",
    restrictionTypeAction: "increase",
    restrictionValue: null,
    currencyCode: "USD",
    countryCode: [],
    isActive: true,
  });
  const [countrySearch, setCountrySearch] = useState('');

  // Helper to update a single field
  const updateField = <K extends keyof IGeoRatePlanUORC>(key: K, value: IGeoRatePlanUORC[K]) => {
    setGeoRatePlan(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (editData) {
      setGeoRatePlan(prev => ({
        ...prev,
        selectedRooms: editData.roomId ? [editData.roomId] : [],
        selectedRatePlans: [editData.ratePlanId],
        restrictionType: editData.restrictionType,
        restrictionTypeAction: editData.restrictionTypeAction ?? "increase",
        restrictionValue: editData.restrictionValue ?? null,
        currencyCode: editData.currencyCode ?? "USD",
        countryCode: editData.countryCode,
        isActive: editData.isActive,
      }));
    }
  }, [editData]);

  const filteredCountries = countrySearch ? searchCountries(countrySearch) : countries;

  const handleCountryToggle = (code: string) => {
    updateField(
      'countryCode',
      geoRatePlan.countryCode.includes(code)
        ? geoRatePlan.countryCode.filter(c => c !== code)
        : [...geoRatePlan.countryCode, code]
    );
  };

  const handleSelectAllRatePlans = () => {
    updateField(
      'selectedRatePlans',
      geoRatePlan.selectedRatePlans.length === ratePlans.length
        ? []
        : ratePlans.map(plan => plan.id)
    );
  };

  const handleSelectAllCountries = () => {
    updateField(
      'countryCode',
      geoRatePlan.countryCode.length === filteredCountries.length
        ? []
        : filteredCountries.map(country => country.code)
    );
  };

  const handleSelectAllRooms = () => {
    updateField(
      'selectedRooms',
      geoRatePlan.selectedRooms.length === roomTypes.length
        ? []
        : roomTypes.map(room => room.id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { selectedRooms, selectedRatePlans, restrictionType, restrictionTypeAction, restrictionValue, currencyCode, countryCode, isActive } = geoRatePlan;

    const roomsPayload = selectedRooms.map(roomId => {
      const room = roomTypes.find(r => r.id === roomId);
      return { id: roomId, type: room?.roomType || '' };
    });

    const ratePlansPayload = selectedRatePlans.map(ratePlanId => {
      const plan = ratePlans.find(p => p.id === ratePlanId);
      return { id: ratePlanId, code: plan?.ratePlanCode || '' };
    });

    const payload: CreateGeoRatePlan = {
      propertyId,
      rooms: roomsPayload,
      ratePlans: ratePlansPayload,
      restrictionType,
      restrictionTypeAction: restrictionType === "restricted" ? null : restrictionTypeAction,
      restrictionValue: restrictionType === "restricted" ? null : restrictionValue,
      currencyCode: restrictionType === "fixed" ? currencyCode : null,
      countryCode,
      isActive,
    };

    await onSubmit(payload);
  };

  const { selectedRooms, selectedRatePlans, restrictionType, restrictionTypeAction, restrictionValue, currencyCode, countryCode, isActive } = geoRatePlan;

  const showRestrictionValue = restrictionType !== "restricted";
  const showCurrencyCode = restrictionType === "fixed";
  const showRestrictionAction = restrictionType !== "restricted";
  if (isLoading.isLoading) {

    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50 rounded-lg">
      <Loader text={isLoading.message} />
    </div>
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">


      {/* Room Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{t("GeoRatePlanForm.roomSelection")}</label>
          <button type="button" onClick={handleSelectAllRooms} className="text-xs text-primary hover:underline">
            {selectedRooms.length === roomTypes.length ? t("GeoRatePlanForm.deselectAll") : t("GeoRatePlanForm.selectAll")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-border rounded-md p-3">
          {roomTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-2">{t("GeoRatePlanForm.noRoomsAvailable")}</p>
          ) : (
            roomTypes.map((room) => (
              <label key={room.id} className="flex items-start gap-2 cursor-pointer hover:bg-accent rounded p-1.5">
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(room.id)}
                  onChange={() =>
                    updateField(
                      'selectedRooms',
                      selectedRooms.includes(room.id)
                        ? selectedRooms.filter(id => id !== room.id)
                        : [...selectedRooms, room.id]
                    )
                  }
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{room._translations ? room._translations.roomName : room.roomName}</p>
                  <p className="text-xs text-muted-foreground">({room._translations ? room._translations.roomType : room.roomType})</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Rate Plans Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{t("GeoRatePlanForm.ratePlansLabel")}</label>
          <button type="button" onClick={handleSelectAllRatePlans} className="text-xs text-primary hover:underline">
            {selectedRatePlans.length === ratePlans.length ? t("GeoRatePlanForm.deselectAll") : t("GeoRatePlanForm.selectAll")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-border rounded-md p-3">
          {ratePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-2">{t("GeoRatePlanForm.noRatePlansAvailable")}</p>
          ) : (
            ratePlans.map((plan) => (
              <label key={plan.id} className="flex items-start gap-2 cursor-pointer hover:bg-accent rounded p-1.5">
                <input
                  type="checkbox"
                  checked={selectedRatePlans.includes(plan.id)}
                  onChange={() =>
                    updateField(
                      'selectedRatePlans',
                      selectedRatePlans.includes(plan.id)
                        ? selectedRatePlans.filter(id => id !== plan.id)
                        : [...selectedRatePlans, plan.id]
                    )
                  }
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{plan._translations ? plan._translations.ratePlanName : plan.ratePlanName}</p>
                  <p className="text-xs text-muted-foreground">({ plan.ratePlanCode})</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="space-y-4 p-4 bg-accent/30 rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-foreground">{t("GeoRatePlanForm.pricingConfiguration")}</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{t("GeoRatePlanForm.restrictionType")}</label>
          <Select
            value={restrictionType}
            onValueChange={(value) => {
              updateField('restrictionType', value as GeoRestrictionType);
              if (value === "restricted") updateField('restrictionValue', null);
            }}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">{t("GeoRatePlanForm.percentageAdjustment")}</SelectItem>
              <SelectItem value="fixed">{t("GeoRatePlanForm.fixedAmountAdjustment")}</SelectItem>
              <SelectItem value="restricted">{t("GeoRatePlanForm.blockAccess")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showRestrictionAction && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("GeoRatePlanForm.priceAction")}</label>
            <Select
              value={restrictionTypeAction ?? "increase"}
              onValueChange={(value) => updateField('restrictionTypeAction', value as GeoRestrictionTypeAction)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">{t("GeoRatePlanForm.increasePrice")}</SelectItem>
                <SelectItem value="decrease">{t("GeoRatePlanForm.decreasePrice")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showRestrictionValue && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {restrictionType === "percentage" ? t("GeoRatePlanForm.percentageValue") : t("GeoRatePlanForm.amountValue")}
            </label>
            <div className="relative">
              <input
                type="number"
                value={restrictionValue ?? ''}
                onChange={(e) => updateField('restrictionValue', e.target.value ? parseFloat(e.target.value) : null)}
                min="0"
                max={restrictionType === "percentage" ? "100" : undefined}
                step="0.01"
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-8"
                placeholder={restrictionType === "percentage" ? "e.g., 10" : "e.g., 50"}
                required
              />
              {restrictionType === "percentage" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              )}
            </div>
          </div>
        )}

        {showCurrencyCode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="currencyCode">{t("GeoRatePlanForm.currencyCode")}</Label>
              <Select
              value={currencyCode ?? "AED"}
                onValueChange={(value) => updateField('currencyCode', value as CurrencyCode)}
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
        {restrictionType === "restricted" && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <span className="text-destructive text-sm">{t("GeoRatePlanForm.countriesBlockedWarning")}</span>
          </div>
        )}
      </div>

      {/* Country Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            {t("GeoRatePlanForm.targetCountries")}
            {countryCode.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">{t("GeoRatePlanForm.selectedCountries", { count: countryCode.length })}</span>
            )}
          </label>
          <button type="button" onClick={handleSelectAllCountries} className="text-xs text-primary hover:underline">
            {countryCode.length === filteredCountries.length ? t("GeoRatePlanForm.deselectAll") : t("GeoRatePlanForm.selectAll")}
          </button>
        </div>
        <input
          type="text"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          placeholder={t("GeoRatePlanForm.searchCountries")}
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-border rounded-md p-3">
          {filteredCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-2">{t("GeoRatePlanForm.noCountriesFound")}</p>
          ) : (
            filteredCountries.map((country) => (
              <label key={country.code} className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded p-1">
                <input
                  type="checkbox"
                  checked={countryCode.includes(country.code)}
                  onChange={() => handleCountryToggle(country.code)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">{country.name} ({country.code})</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
          className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
        />
        <div>
          <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">{t("GeoRatePlanForm.activeStatus")}</label>
          <p className="text-xs text-muted-foreground">
            {isActive ? t("GeoRatePlanForm.ratePlanActive") : t("GeoRatePlanForm.ratePlanInactive")}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-border rounded-md text-foreground hover:bg-accent transition-colors text-sm font-medium">
          {t("GeoRatePlanForm.cancel")}
        </button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
          {editData ? t("GeoRatePlanForm.update") : t("GeoRatePlanForm.create")} {t("GeoRatePlanForm.geoRatePlan")}
        </button>
      </div>
    </form>
  );
};

export default GeoRatePlanForm;