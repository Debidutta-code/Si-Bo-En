// services/inventory.service.ts

import {
  getInventoryAnalysis,
  getAllRoomTypesWithRatePlans
} from "../api/api";
import type { InventoryAnalysisFilters } from "../interfaces/inventory.interfaces";

export async function fetchInventoryAnalysisService(
  propertyId: string,
  filters: InventoryAnalysisFilters
) {
  // Validation
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  if (!filters.startDate || !filters.endDate) {
    return {
      success: false,
      message: "Start date and end date are required"
    };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(filters.startDate) || !dateRegex.test(filters.endDate)) {
    return {
      success: false,
      message: "Dates must be in YYYY-MM-DD format"
    };
  }

  const result = await getInventoryAnalysis(propertyId, filters);
  return result;
}

export async function fetchRoomTypesWithRatePlansService(propertyId: string) {
  if (!propertyId) {
    return {
      success: false,
      message: "Property ID is required"
    };
  }

  const result = await getAllRoomTypesWithRatePlans(propertyId);
  return result;
}