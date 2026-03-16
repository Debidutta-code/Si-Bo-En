

export interface IUserRolesAndAccess {
  role: "super_admin" | "group_manager" | "brand_manager" | "hotel_manager" | "staff" | "revenue_manager"|"custom_admin" ;
  level: number;
  isActive: boolean;

  // --- Hotel Management ---
  canCreateHotel: boolean;
  canUpdateHotel: boolean;
  canDeleteHotel: boolean;
  canViewHotel: boolean;

  // --- Payment ---
  canUpdatePaymentDetails: boolean;

  // --- Rate Plan Management ---
  canCreateRatePlan: boolean;
  canViewRatePlan: boolean;
  canUpdateRatePlan: boolean;
  canDeleteRatePlan: boolean;

  // --- Inventory & Availability ---
  canAddInventory: boolean;
  canCreateRoomAvailability: boolean;
  canMapRatePlan: boolean;
  canUpdateRoomPrice: boolean;

  // --- Booking ---
  canSeeBookingDetails: boolean;
  canUpdateBookingStatus: boolean;

  // --- Analytics ---
  canViewAnalytics: boolean;

  // --- Members Management ---
  canCreateMembers: boolean;
  canViewMembers: boolean;
  canUpdateMembers: boolean;
  canDeleteMembers: boolean;

  // --- User Management (Level-based) ---
  canCreateLevel0User: boolean;
  canCreateLevel1User: boolean;
  canCreateLevel2User: boolean;
  canCreateLevel3User: boolean;

  canUpdateLevel0User: boolean;
  canUpdateLevel1User: boolean;
  canUpdateLevel2User: boolean;
  canUpdateLevel3User: boolean;

  canDeleteLevel0User: boolean;
  canDeleteLevel1User: boolean;
  canDeleteLevel2User: boolean;
  canDeleteLevel3User: boolean;

  // --- Logs ---
  canViewLogs: boolean;

  // --- Role & Access Management ---
  canCreateNewRole: boolean;
  canViewAccess: boolean;
  canModifyAccess: boolean;
  canDeleteRole: boolean;

  // --- Policy Management ---
  canCreatePolicy: boolean;
  canUpdatePolicy: boolean;
  canDeletePolicy: boolean;

  canCDCategory: boolean;
  canCDPropertyType: boolean;
  canCDDestinationType: boolean;
  canCDAmenity: boolean;
  canSeeDraftedProperties: boolean;
}