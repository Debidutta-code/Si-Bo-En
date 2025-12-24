"use client";

import { Calendar, Filter, Building2, X } from "lucide-react";
import type { IReservationFilters, IProperty } from "../types";

interface ReservationFiltersProps {
  filters: IReservationFilters;
  onFilterChange: (filters: Partial<IReservationFilters>) => void;
  properties: IProperty[];
  onClearFilters: () => void;
}

export default function ReservationFilters({
  filters,
  onFilterChange,
  properties,
  onClearFilters
}: ReservationFiltersProps) {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({ [field]: value });
  };

  const handlePropertyChange = (propertyId: string) => {
    if (propertyId === 'all') {
      onFilterChange({ propertyId: undefined, propertyCode: undefined });
    } else {
      const selectedProperty = properties.find(p => p.id === propertyId);
      onFilterChange({
        propertyId: selectedProperty?.id,
        propertyCode: selectedProperty?.code
      });
    }
  };

  const handleReservationTypeChange = (type: IReservationFilters['reservationType']) => {
    onFilterChange({ reservationType: type, page: 1 });
  };

  const handleStatusChange = (status: IReservationFilters['bookingStatus']) => {
    onFilterChange({ bookingStatus: status, page: 1 });
  };

  const hasActiveFilters = filters.propertyId || filters.bookingStatus !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            min={filters.startDate}
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
            value={filters.propertyId || 'all'}
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
            value={filters.bookingStatus || 'all'}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="modified">Modified</option>
          </select>
        </div>
      </div>

      {/* Reservation Type Tabs */}
      <div className="mt-4 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reservation Type
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Reservations' },
            { value: 'arrivals', label: 'Arrivals' },
            { value: 'departures', label: 'Departures' },
            // { value: 'checkins', label: 'Check-Ins' },
            // { value: 'checkouts', label: 'Check-Outs' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleReservationTypeChange(type.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.reservationType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}