// features/index.ts

// Export all utility functions
export * from "../utils/inventoryUtils";

// Export pricing handlers
export {
  handlePriceInputChange,
  handleAdditionalChargeChange,
  applyPriceToRow,
  applyAdditionalChargeToRow,
  savePriceChanges,
} from "./pricingHandlers";

// Export occupancy handlers
export {
  toggleOccupancyExpansion,
  addGuestTier,
  removeGuestTier,
  addAdditionalCharge,
  removeAdditionalCharge,
} from "./occupancyHandlers";

// Export availability and LOS handlers
export {
  handleAvailabilityInputChange,
  applyAvailabilityToRow,
  saveAvailabilityChanges,
  handleLOSInputChange,
  applyLOSToRow,
  saveLOSChanges,
} from "./availabilityAndLosHandlers";

// Export restriction handlers

// Export unsaved changes handlers
export {
  checkUnsavedChanges,
  handleSaveAndContinue,
  handleDiscardAndContinue,
} from "./unsavedChangesHandler";