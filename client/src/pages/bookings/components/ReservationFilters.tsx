"use client";

import {
  Calendar,
  Filter,
  Building2,
  X,
  Search,
  Globe,
  Smartphone,
} from "lucide-react";
import type { IReservationFilters, IPropertyListItem } from "../types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "../utils/country.utils";

// Change the interface - remove PDF handler
interface ReservationFiltersProps {
  filters: IReservationFilters;
  onFilterChange: (filters: Partial<IReservationFilters>) => void;
  properties: IPropertyListItem[];
  onClearFilters: () => void;
}

export default function ReservationFilters({
  filters,
  onFilterChange,
  properties,
  onClearFilters,
}: ReservationFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Local state for filters before applying
  const [localFilters, setLocalFilters] =
    useState<IReservationFilters>(filters);

  // Track if advanced filters have changed
  const [advancedFiltersChanged, setAdvancedFiltersChanged] = useState(false);

  // Update local filters when parent filters change (e.g., from clear filters)
  useEffect(() => {
    setLocalFilters(filters);
    setAdvancedFiltersChanged(false);
  }, [filters]);

  const handleLocalFilterChange = (
    newFilters: Partial<IReservationFilters>,
    isAdvanced: boolean = false,
  ) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
    if (isAdvanced) {
      setAdvancedFiltersChanged(true);
    }
  };

  // Auto-apply for basic filters
  const handleBasicFilterChange = (
    newFilters: Partial<IReservationFilters>,
  ) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFilterChange({ ...updatedFilters, page: 1 });
  };

  const handleApplyFilters = () => {
    onFilterChange({ ...localFilters, page: 1 });
    setAdvancedFiltersChanged(false);
  };

  const handleLocalClearFilters = () => {
    const clearedFilters = {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      dateFilterType: "checkin" as const,
      page: 1,
      limit: 10,
      bookingStatus: "all" as const,
      reservationType: "all" as const,
      bookingSource: "all" as const,
      deviceType: "all" as const,
    };
    setLocalFilters(clearedFilters);
    setAdvancedFiltersChanged(false);
    onClearFilters();
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    handleBasicFilterChange({ [field]: value });
  };

  const handlePropertyChange = (propertyId: string) => {
    if (propertyId === "all") {
      handleBasicFilterChange({
        propertyId: undefined,
        propertyCode: undefined,
      });
    } else {
      const selectedProperty = properties.find((p) => p.id === propertyId);
      handleBasicFilterChange({
        propertyId: selectedProperty?.id,
        propertyCode: selectedProperty?.code,
      });
    }
  };

  const handleReservationTypeChange = (
    type: IReservationFilters["reservationType"],
  ) => {
    handleBasicFilterChange({ reservationType: type });
  };

  const handleStatusChange = (status: IReservationFilters["bookingStatus"]) => {
    handleBasicFilterChange({ bookingStatus: status });
  };

  const handleDateFilterTypeChange = (
    dateFilterType: "checkin" | "booking" | "modification",
  ) => {
    handleBasicFilterChange({ dateFilterType });
  };

  const handleBookingSourceChange = (
    source: IReservationFilters["bookingSource"],
  ) => {
    handleLocalFilterChange({ bookingSource: source }, true);
  };

  const handleDeviceTypeChange = (
    deviceType: IReservationFilters["deviceType"],
  ) => {
    handleLocalFilterChange({ deviceType: deviceType }, true);
  };

  const getDateFilterLabel = () => {
    switch (localFilters.dateFilterType) {
      case "booking":
        return "Booking Date";
      case "modification":
        return "Modification Date";
      default:
        return "Check-in Date";
    }
  };

  const hasActiveFilters =
    localFilters.propertyId ||
    localFilters.bookingStatus !== "all" ||
    localFilters.bookingSource !== "all" ||
    localFilters.deviceType !== "all" ||
    localFilters.bookingCode ||
    localFilters.guestName ||
    localFilters.promoCode ||
    localFilters.countryCode;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-primary hover:text-primary/90 transition-colors"
          >
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleLocalClearFilters}
              className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters - Auto Apply */}
      <div className="space-y-4">
        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Filter Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Filter Type
            </label>
            <Select
              value={localFilters.dateFilterType || "checkin"}
              onValueChange={handleDateFilterTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkin">Check-in Date</SelectItem>
                <SelectItem value="booking">Booking Date</SelectItem>
                {/* <SelectItem value="modification">Modification Date</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getDateFilterLabel()} From
            </label>
            <input
              type="date"
              value={localFilters.startDate || ""}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getDateFilterLabel()} To
            </label>
            <input
              type="date"
              value={localFilters.endDate || ""}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              min={localFilters.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Property Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Property
            </label>
            <select
              value={localFilters.propertyId || "all"}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={localFilters.bookingStatus || "all"}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="modified">Modified</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Require Apply Button */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">
              Advanced Filters
            </h4>
            {advancedFiltersChanged && (
              <span className="text-xs text-amber-600 font-medium">
                Click "Apply Filters" to search
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Booking Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Source
              </label>
              <select
                value={localFilters.bookingSource || "all"}
                onChange={(e) =>
                  handleBookingSourceChange(e.target.value as any)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="direct">Direct</option>
                <option value="google">Google</option>
                <option value="trip_adviser">TripAdvisor</option>
                <option value="trivago">Trivago</option>
                <option value="social_media">Social Media</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Device Type
              </label>
              <select
                value={localFilters.deviceType || "all"}
                onChange={(e) => handleDeviceTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Devices</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>

            {/* Booking Code Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Booking Code
              </label>
              <input
                type="text"
                placeholder="Search by booking code"
                value={localFilters.bookingCode || ""}
                onChange={(e) =>
                  handleLocalFilterChange(
                    { bookingCode: e.target.value.toUpperCase() || undefined },
                    true,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Guest Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Guest Name
              </label>
              <input
                type="text"
                placeholder="Search by guest name"
                value={localFilters.guestName || ""}
                onChange={(e) =>
                  handleLocalFilterChange(
                    { guestName: e.target.value || undefined },
                    true,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code
              </label>
              <input
                type="text"
                placeholder="Search by promo code"
                value={localFilters.promoCode || ""}
                onChange={(e) =>
                  handleLocalFilterChange(
                    { promoCode: e.target.value.toUpperCase() || undefined },
                    true,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Country Code (Source Market) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Source Market
              </label>
              <Select
                value={localFilters.countryCode || "all"}
                onValueChange={(value) =>
                  handleLocalFilterChange(
                    { countryCode: value === "all" ? undefined : value },
                    true,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.name}</span>
                        <span className="text-gray-500">({country.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

     <div className="mt-4 border-t pt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Reservation Type
  </label>

  <div className="flex flex-col md:flex-row md:items-center gap-3">
    {/* Reservation Type Buttons */}
    <div className="flex flex-wrap gap-2">
      {[
        { value: "all", label: "All Reservations" },
        { value: "arrivals", label: "Arrivals" },
        { value: "departures", label: "Departures" },
      ].map((type) => (
        <button
          key={type.value}
          onClick={() => handleReservationTypeChange(type.value as any)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            localFilters.reservationType === type.value
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>

  </div>
</div>


      {/* Apply Filters Button - Only for Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleLocalClearFilters}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={!advancedFiltersChanged}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
