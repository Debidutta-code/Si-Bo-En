"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Pagination } from "@/components/ui/pagination";
import {
  fetchReservations,
  fetchArrivals,
  fetchDepartures,
  fetchProperties,
  cancelReservation,
} from "./api";
import type {
  IReservation,
  IReservationFilters,
  IPaginationMeta,
  IProperty,
} from "./types/index";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import { ReservationFilters } from "./components";
import Loader from "@/components/Loader/Loader";
import { downloadReport, noShowReservation } from "./api/reservation.api";
import ReservationsTable from "./components/ReservationsTable";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta>({
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    resultsPerPage: 10,
  });
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [filters, setFilters] = useState<IReservationFilters>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    page: 1,
    limit: 10,
    bookingStatus: "all",
    reservationType: "all",
    bookingSource: "all",
    deviceType: "all",
  });

  // Fetch properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Fetch reservations when filters change
  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadProperties = async () => {
    try {
      const response = await fetchProperties();
      if (response.success) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      let response;
      const apiFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        dateFilterType: filters.dateFilterType,
        propertyId: filters.propertyId,
        propertyCode: filters.propertyCode,
        bookingStatus:
          filters.bookingStatus !== "all" ? filters.bookingStatus : undefined,
        bookingSource:
          filters.bookingSource !== "all" ? filters.bookingSource : undefined,
        deviceType:
          filters.deviceType !== "all" ? filters.deviceType : undefined,
        bookingCode: filters.bookingCode,
        guestName: filters.guestName,
        promoCode: filters.promoCode,
        countryCode: filters.countryCode,
        page: filters.page,
        limit: filters.limit,
      };

      // Call appropriate API based on reservation type
      switch (filters.reservationType) {
        case "arrivals":
          response = await fetchArrivals(apiFilters);
          break;
        case "departures":
          response = await fetchDepartures(apiFilters);
          break;
        default:
          response = await fetchReservations(apiFilters);
      }

      if (response.success) {
        setReservations(response.data);
        setPagination(response.meta);
      } else {
        toast.error(response.message || "Failed to load reservations");
        setReservations([]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load reservations");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback(
    (newFilters: Partial<IReservationFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        // Reset to page 1 if filters change (except page itself)
        page: "page" in newFilters ? newFilters.page! : 1,
      }));
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleClearFilters = () => {
    setFilters({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      page: 1,
      limit: 10,
      bookingStatus: "all",
      reservationType: "all",
      bookingSource: "all",
      deviceType: "all",
    });
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await cancelReservation(reservationId);
      if (response.success) {
        toast.success("Reservation cancelled successfully");
        loadReservations();
      } else {
        toast.error(response.message || "Failed to cancel reservation");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel reservation");
    }
  };
  const handleNoShowReservation = async (reservationId: string) => {
    try {
      const response = await noShowReservation(reservationId);
      if (response.success) {
        toast.success("Reservation marked as no-show successfully");
        loadReservations();
      } else {
        toast.error(
          response.message || "Failed to mark reservation as no-show",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark reservation as no-show");
    }
  };

  const getReservationTypeLabel = () => {
    switch (filters.reservationType) {
      case "arrivals":
        return "Arrivals";
      case "departures":
        return "Departures";
      default:
        return "All Reservations";
    }
  };
  // Add download function for Excel only
  const handleDownloadReservationsExcel = async () => {
    if (!filters.propertyId) {
      toast.error("Please select a property to download report");
      return;
    }

    setDownloadingReport(true);
    try {
      // Determine report type based on current filter
      let reportType = "reservation"; // Default

      if (filters.reservationType === "arrivals") {
        reportType = "arrival";
      } else if (filters.reservationType === "departures") {
        reportType = "departure";
      }

      const response = await downloadReport(
        filters.propertyId,
        reportType,
        filters.startDate,
        filters.endDate,
      );

      if (!response.success) {
        toast.error(response.message || "Failed to download Excel report");
      }
    } catch (error) {
      toast.error("Failed to download Excel report");
    } finally {
      setDownloadingReport(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          </div>
          <p className="text-gray-600">
            View and manage your property reservations
          </p>
        </div>

        {/* Filters */}
        <ReservationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          properties={properties}
          onClearFilters={handleClearFilters}
          onDownloadReservationsExcel={handleDownloadReservationsExcel}
          isDownloading={downloadingReport}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {getReservationTypeLabel()}
            </h2>
            {pagination.totalResults > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {pagination.totalResults} result
                {pagination.totalResults !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader text="Loading reservations..." />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No reservations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more results
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Reservations Table */}
            <ReservationsTable
              reservations={reservations}
              onCancel={handleCancelReservation}
              onNoShow={handleNoShowReservation}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={pagination.resultsPerPage}
                totalItems={pagination.totalResults}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
