-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager');

-- CreateEnum
CREATE TYPE "geoRestrictionType" AS ENUM ('percentage', 'fixed', 'restricted');

-- CreateEnum
CREATE TYPE "geoRestrictionTypeAction" AS ENUM ('increase', 'decrease');

-- CreateEnum
CREATE TYPE "ReservationAddonType" AS ENUM ('included', 'selected');

-- CreateEnum
CREATE TYPE "CreationType" AS ENUM ('group', 'property', 'brand', 'super', 'regional');

-- CreateEnum
CREATE TYPE "RoomView" AS ENUM ('city', 'sea', 'garden', 'mountain', 'others');

-- CreateEnum
CREATE TYPE "RoomUnit" AS ENUM ('sqm', 'sqft');

-- CreateEnum
CREATE TYPE "SmokingPolicy" AS ENUM ('smoking', 'non_smoking', 'designated_area');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('INR', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'AED', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF', 'CLP', 'CNH', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWG', 'ZWL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('confirmed', 'cancelled', 'pending');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('deposit', 'guarantee', 'cancellation');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('mobile', 'tablet', 'desktop');

-- CreateEnum
CREATE TYPE "ReservationDeviceType" AS ENUM ('mobile', 'tablet', 'desktop');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'flat');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'expired', 'modified', 'no_show', 'checked_in', 'checked_out');

-- CreateEnum
CREATE TYPE "AmenityType" AS ENUM ('room', 'property');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "commissionType" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "AgencyType" AS ENUM ('travel_agency', 'corporate');

-- CreateEnum
CREATE TYPE "AgentCommissionType" AS ENUM ('percentage', 'fixed');

-- CreateEnum
CREATE TYPE "TaxApplicableOn" AS ENUM ('room_rate', 'total_amount');

-- CreateEnum
CREATE TYPE "AgencyApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PostingRhythm" AS ENUM ('per_night', 'per_person_per_night', 'per_person_per_stay', 'per_stay', 'per_person_per_room', 'per_room', 'per_room_per_night');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('pay_at_hotel', 'net_banking', 'upi', 'payment_gateway');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('direct', 'google', 'trip_adviser', 'trivago', 'social_media', 'agency');

-- CreateEnum
CREATE TYPE "FolioStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "GuestType" AS ENUM ('adult', 'child', 'infant');

-- CreateEnum
CREATE TYPE "userIdentityCardType" AS ENUM ('passport', 'drivers_license', 'national_id', 'adhar_card', 'pan_card', 'others');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "LoyaltyProgramLevel" AS ENUM ('basic', 'advance');

-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('en');

-- CreateEnum
CREATE TYPE "IntegrationTypes" AS ENUM ('channel_manager', 'pms');

-- CreateEnum
CREATE TYPE "ReservationPromotionType" AS ENUM ('early_bird', 'mlos', 'device_specific', 'offer_for_tonight', 'normal');

-- CreateEnum
CREATE TYPE "CommissionOrDiscount" AS ENUM ('commission', 'tax');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('early_bird', 'offer_for_tonight', 'device_specific');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "Platforms" AS ENUM ('web', 'mobile', 'desktop');

-- CreateEnum
CREATE TYPE "AddOnType" AS ENUM ('included', 'selected');

-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('increase', 'decrease', 'payLater');

-- CreateEnum
CREATE TYPE "PromotionApplyType" AS ENUM ('user_applied', 'auto_applied');

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "propertyCode" TEXT NOT NULL,
    "ratePlanName" TEXT NOT NULL,
    "ratePlanCode" TEXT NOT NULL,
    "roomTypeCode" TEXT NOT NULL,
    "roomTypeName" TEXT NOT NULL,
    "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'INR',
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "is_sale_stopped" BOOLEAN NOT NULL DEFAULT false,
    "mon_applicable" BOOLEAN NOT NULL DEFAULT true,
    "tue_applicable" BOOLEAN NOT NULL DEFAULT true,
    "wed_applicable" BOOLEAN NOT NULL DEFAULT true,
    "thu_applicable" BOOLEAN NOT NULL DEFAULT true,
    "fri_applicable" BOOLEAN NOT NULL DEFAULT true,
    "sat_applicable" BOOLEAN NOT NULL DEFAULT true,
    "sun_applicable" BOOLEAN NOT NULL DEFAULT true,
    "is_closed_to_arrival" BOOLEAN NOT NULL DEFAULT false,
    "is_closed_to_departure" BOOLEAN NOT NULL DEFAULT false,
    "restriction_notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_base_by_guests" (
    "id" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "age_qualifying_code" TEXT NOT NULL DEFAULT '10',
    "amount_before_tax" DOUBLE PRECISION NOT NULL,
    "number_of_guests" INTEGER NOT NULL,

    CONSTRAINT "charge_base_by_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_additional_guests" (
    "id" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "age_qualifying_code" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "charge_additional_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "room_type_code" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "availability" INTEGER NOT NULL,
    "rate_plans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "description" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_plans" (
    "id" TEXT NOT NULL,
    "rate_plan_name" TEXT NOT NULL,
    "rate_plan_code" TEXT NOT NULL,
    "device_type" "DeviceType"[],
    "property_id" TEXT NOT NULL,
    "deposit_policy_id" TEXT,
    "cancellation_policy_id" TEXT,
    "guarantee_policy_id" TEXT,
    "tax_group_id" TEXT,
    "room_only_visible" BOOLEAN NOT NULL DEFAULT true,
    "b2b_available" BOOLEAN NOT NULL DEFAULT false,
    "b2c_available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_tickets" (
    "id" TEXT NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "guest_id" TEXT,
    "ota_guest_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_controls" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "can_create_hotel" BOOLEAN NOT NULL DEFAULT false,
    "can_update_hotel" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_hotel" BOOLEAN NOT NULL DEFAULT false,
    "can_view_hotel" BOOLEAN NOT NULL DEFAULT true,
    "can_update_payment_details" BOOLEAN NOT NULL DEFAULT false,
    "can_create_rate_plan" BOOLEAN NOT NULL DEFAULT false,
    "can_view_rate_plan" BOOLEAN NOT NULL DEFAULT false,
    "can_update_rate_plan" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_rate_plan" BOOLEAN NOT NULL DEFAULT false,
    "can_add_inventory" BOOLEAN NOT NULL DEFAULT false,
    "can_create_room_availability" BOOLEAN NOT NULL DEFAULT false,
    "can_map_rate_plan" BOOLEAN NOT NULL DEFAULT false,
    "can_update_room_price" BOOLEAN NOT NULL DEFAULT false,
    "can_see_booking_details" BOOLEAN NOT NULL DEFAULT false,
    "can_update_booking_status" BOOLEAN NOT NULL DEFAULT false,
    "can_view_analytics" BOOLEAN NOT NULL DEFAULT false,
    "can_create_members" BOOLEAN NOT NULL DEFAULT false,
    "can_view_members" BOOLEAN NOT NULL DEFAULT false,
    "can_update_members" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_members" BOOLEAN NOT NULL DEFAULT false,
    "can_create_level0_user" BOOLEAN NOT NULL DEFAULT false,
    "can_create_level1_user" BOOLEAN NOT NULL DEFAULT false,
    "can_create_level2_user" BOOLEAN NOT NULL DEFAULT false,
    "can_create_level3_user" BOOLEAN NOT NULL DEFAULT false,
    "can_update_level0_user" BOOLEAN NOT NULL DEFAULT false,
    "can_update_level1_user" BOOLEAN NOT NULL DEFAULT false,
    "can_update_level2_user" BOOLEAN NOT NULL DEFAULT false,
    "can_update_level3_user" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_level0_user" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_level1_user" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_level2_user" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_level3_user" BOOLEAN NOT NULL DEFAULT false,
    "can_view_logs" BOOLEAN NOT NULL DEFAULT false,
    "can_create_new_role" BOOLEAN NOT NULL DEFAULT false,
    "can_view_access" BOOLEAN NOT NULL DEFAULT false,
    "can_modify_access" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_role" BOOLEAN NOT NULL DEFAULT false,
    "can_create_policy" BOOLEAN NOT NULL DEFAULT false,
    "can_update_policy" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_policy" BOOLEAN NOT NULL DEFAULT false,
    "can_cd_category" BOOLEAN NOT NULL DEFAULT false,
    "can_cd_property_type" BOOLEAN NOT NULL DEFAULT false,
    "can_cd_destination_type" BOOLEAN NOT NULL DEFAULT false,
    "can_cd_amenity" BOOLEAN NOT NULL DEFAULT false,
    "can_see_drafted_properties" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creations" (
    "id" TEXT NOT NULL,
    "type" "CreationType" NOT NULL,
    "name" TEXT NOT NULL,
    "images" TEXT[],
    "super_id" TEXT,
    "group_id" TEXT,
    "brand_id" TEXT,
    "regional_id" TEXT,
    "property_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'staff',
    "user_level" INTEGER NOT NULL DEFAULT 0,
    "is_drafted" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "creation_id" TEXT,
    "level0_creation_id" TEXT,
    "level1_creation_id" TEXT,
    "level2_creation_id" TEXT,
    "level3_creation_id" TEXT,
    "level4_creation_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "variantId" TEXT,
    "rate_plan_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postingRhythm" "PostingRhythm" NOT NULL DEFAULT 'per_stay',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildAddon" (
    "id" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "discount_applicable" BOOLEAN NOT NULL DEFAULT false,
    "discount_type" "DiscountType" DEFAULT 'percentage',
    "discount_amount" DOUBLE PRECISION DEFAULT 0,
    "currency_code" "CurrencyCode" DEFAULT 'INR',

    CONSTRAINT "ChildAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonAvailability" (
    "id" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currencyCode" VARCHAR(5) NOT NULL DEFAULT 'INR',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddonAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAddon" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "specialInstructions" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ReservationAddonType" NOT NULL DEFAULT 'included',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "property_id" TEXT,

    CONSTRAINT "AddonCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_plan_with_addon" (
    "id" TEXT NOT NULL,
    "rate_plan_id" TEXT NOT NULL,
    "addon_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_plan_with_addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonSubCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "property_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddonSubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonVariant" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "property_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddonVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency" (
    "id" TEXT NOT NULL,
    "agency_name" TEXT NOT NULL,
    "agency_type" "AgencyType" NOT NULL DEFAULT 'travel_agency',
    "agency_email" TEXT NOT NULL,
    "contact_no" TEXT NOT NULL,
    "tax_no" TEXT NOT NULL,
    "commission_type" "AgentCommissionType" NOT NULL DEFAULT 'percentage',
    "commission_value" INTEGER NOT NULL,
    "commission_currency" "CurrencyCode" DEFAULT 'INR',
    "iata_code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_commissions" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "commission_type" "AgentCommissionType" NOT NULL,
    "commission_value" DOUBLE PRECISION NOT NULL,
    "commission_amount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agency_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_applications" (
    "id" TEXT NOT NULL,
    "application_no_for_this_user" INTEGER NOT NULL DEFAULT 1,
    "status" "AgencyApplicationStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "applicant_email" TEXT NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_phone" TEXT NOT NULL,
    "applicant_password" TEXT NOT NULL,
    "agency_name" TEXT NOT NULL,
    "agency_type" "AgencyType" NOT NULL DEFAULT 'travel_agency',
    "agency_email" TEXT NOT NULL,
    "contact_no" TEXT NOT NULL,
    "tax_no" TEXT NOT NULL,
    "commission_type" "AgentCommissionType" NOT NULL DEFAULT 'percentage',
    "commission_value" INTEGER NOT NULL,
    "commission_currency" "CurrencyCode" DEFAULT 'INR',
    "iata_code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentic_property" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agentic_property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentic_room" (
    "id" TEXT NOT NULL,
    "agentic_property_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agentic_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL,
    "agent_email" TEXT NOT NULL,
    "agent_phone" TEXT NOT NULL,
    "agent_password" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_commission" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "commission_type" "commissionType" NOT NULL DEFAULT 'percentage',
    "commission_value" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_integrations" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "master_integration_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_integration_secrets" (
    "id" TEXT NOT NULL,
    "property_integration_id" TEXT NOT NULL,
    "required_field_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_integration_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_payment_integrations" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "payment_integration_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "outlet_id" TEXT NOT NULL,
    "same_day_refund" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "property_payment_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_program_configs" (
    "id" TEXT NOT NULL,
    "creation_id" TEXT NOT NULL,
    "loyalty_discount_type" "DiscountType" NOT NULL DEFAULT 'percentage',
    "discount_value" INTEGER NOT NULL,
    "currency_code" "CurrencyCode" DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_program_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_levels" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "discount_percentage" DOUBLE PRECISION NOT NULL,
    "no_of_reservations" INTEGER NOT NULL DEFAULT 1,
    "creation_loyalty_config_id" TEXT NOT NULL,

    CONSTRAINT "loyalty_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_loyalty_programs" (
    "id" TEXT NOT NULL,
    "loyalty_program_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "logo" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "basic_loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advance_loyalty_programs" (
    "id" TEXT NOT NULL,
    "loyalty_program_id" TEXT NOT NULL,
    "active_in_corporate_web" BOOLEAN NOT NULL DEFAULT true,
    "default_login_mode" BOOLEAN NOT NULL DEFAULT false,
    "external_registration_url" TEXT,
    "room_limit_by_booking" INTEGER NOT NULL DEFAULT 1,
    "block_user_field_from_form" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advance_loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_conditions" (
    "id" TEXT NOT NULL,
    "loyalty_program_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" "Languages" NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_special_conditions" (
    "id" TEXT NOT NULL,
    "loyalty_program_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sub_title" TEXT,
    "language" "Languages" NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_special_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgramFieldConfig" (
    "id" TEXT NOT NULL,
    "loyaltyProgramId" TEXT NOT NULL,
    "masterRegistrationFieldId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "visibleInRegistration" BOOLEAN NOT NULL DEFAULT true,
    "visibleInCustomerForm" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyProgramFieldConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyality_guests" (
    "id" TEXT NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_id" TEXT,
    "password" TEXT NOT NULL DEFAULT ' ',
    "ota_guest_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyality_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creation_guests" (
    "id" TEXT NOT NULL,
    "loyality_guest_id" TEXT NOT NULL,
    "meta_data" JSONB NOT NULL,
    "guest_level" INTEGER NOT NULL DEFAULT 1,
    "creation_loyalty_config_id" TEXT NOT NULL,
    "no_of_bookings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "creation_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_loyalty_configs" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "creation_loyalty_config_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "loyality_config_logo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "property_loyalty_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_loyality_guests" (
    "id" TEXT NOT NULL,
    "property_loyality_id" TEXT NOT NULL,
    "loyality_guest_id" TEXT NOT NULL,

    CONSTRAINT "property_loyality_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ota_guest" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT,
    "meta_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ota_guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_reviews" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "ota_customer_id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_wishlist" (
    "id" TEXT NOT NULL,
    "ota_guest_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_wishlist" (
    "id" TEXT NOT NULL,
    "wishlist_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'AED',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'pay_at_hotel',
    "propertyPaymentIntegrationId" TEXT,
    "payment_intent_id" TEXT,
    "property_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "property_id" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL DEFAULT 'AED',
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "min_booking_amount" DOUBLE PRECISION,
    "max_discount_amount" DOUBLE PRECISION,
    "is_applicable_for_mobile_app" BOOLEAN NOT NULL DEFAULT false,
    "is_applicable_for_desktop" BOOLEAN NOT NULL DEFAULT false,
    "is_applicable_for_tablet" BOOLEAN NOT NULL DEFAULT false,
    "usage_limit" INTEGER,
    "applicable_room_types" JSONB[],
    "applicable_rate_plans" JSONB[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customizable_deals" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'percentage',
    "discount_value" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" DEFAULT 'AED',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_applied" BOOLEAN NOT NULL DEFAULT false,
    "room_type" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "rate_plan_id" TEXT NOT NULL,
    "rate_plan_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customizable_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customizable_deals_applicable_addons" (
    "id" TEXT NOT NULL,
    "customizable_deal_id" TEXT NOT NULL,
    "add_on_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customizable_deals_applicable_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_rate_plan" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "room_id" TEXT,
    "room_type" TEXT,
    "rate_plan_id" TEXT NOT NULL,
    "rate_plan_code" TEXT NOT NULL,
    "restriction_type" "geoRestrictionType" NOT NULL DEFAULT 'percentage',
    "restriction_type_action" "geoRestrictionTypeAction" DEFAULT 'increase',
    "restriction_value" DOUBLE PRECISION,
    "currency_code" "CurrencyCode" DEFAULT 'AED',
    "country_code" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geo_rate_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_rule" (
    "id" TEXT NOT NULL,
    "promotion_name" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "advance_booking_days" INTEGER DEFAULT 0,
    "promotion_type" "PromotionType" NOT NULL,
    "room_id" TEXT,
    "room_type" TEXT,
    "device_type" "DeviceType"[] DEFAULT ARRAY[]::"DeviceType"[],
    "rate_plan_id" TEXT NOT NULL,
    "rate_plan_code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'percentage',
    "discount_value" DOUBLE PRECISION,
    "currency_code" "CurrencyCode" DEFAULT 'AED',
    "mon_applicable" BOOLEAN NOT NULL DEFAULT true,
    "tue_applicable" BOOLEAN NOT NULL DEFAULT true,
    "wed_applicable" BOOLEAN NOT NULL DEFAULT true,
    "thu_applicable" BOOLEAN NOT NULL DEFAULT true,
    "fri_applicable" BOOLEAN NOT NULL DEFAULT true,
    "sat_applicable" BOOLEAN NOT NULL DEFAULT true,
    "sun_applicable" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_offsets" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "rate_plan_code" TEXT NOT NULL,
    "rate_plan_id" TEXT NOT NULL,
    "rate_plan_name" TEXT NOT NULL,
    "minimum_advance_booking_offset" INTEGER,
    "maximum_advance_booking_offset" INTEGER,
    "minimum_amend_booking_offset" INTEGER,
    "maximum_amend_booking_offset" INTEGER,
    "minimum_cancel_booking_offset" INTEGER,
    "maximum_cancel_booking_offset" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_offsets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_plan_rules" (
    "id" TEXT NOT NULL,
    "rate_plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "min_los" INTEGER NOT NULL DEFAULT 0,
    "max_los" INTEGER,
    "is_auto_applied" BOOLEAN NOT NULL DEFAULT false,
    "discount_type" "DiscountType",
    "currency_code" "CurrencyCode" NOT NULL DEFAULT 'AED',
    "discount_value" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_plan_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_dates" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "spa_module_id" TEXT NOT NULL,

    CONSTRAINT "spa_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_slots" (
    "id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "spa_date_id" TEXT NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "reservation_id" TEXT,
    "user_name" TEXT,

    CONSTRAINT "spa_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_bookings" (
    "id" TEXT NOT NULL,
    "spa_booking_id" TEXT NOT NULL,
    "spa_id" TEXT NOT NULL,
    "spa_slot_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slot_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "conditions" JSONB NOT NULL,
    "is_inclusive" BOOLEAN NOT NULL,
    "images" TEXT[],
    "service_time" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "sub_category_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "discount_value" DOUBLE PRECISION,
    "currency_code" "CurrencyCode" DEFAULT 'AED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "spa_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT NOT NULL,
    "user_contact_number" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency_code" TEXT DEFAULT 'AED',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spa_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_assigned_spa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "spa_id" TEXT NOT NULL,

    CONSTRAINT "user_assigned_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "TaxType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "applicable_on" "TaxApplicableOn" NOT NULL,
    "description" TEXT,
    "is_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "currency_code" "CurrencyCode" NOT NULL DEFAULT 'AED',
    "property_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "property_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_group_rules" (
    "id" TEXT NOT NULL,
    "tax_group_id" TEXT NOT NULL,
    "tax_rule_id" TEXT NOT NULL,

    CONSTRAINT "tax_group_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourist_taxes" (
    "id" TEXT NOT NULL,
    "name" TEXT DEFAULT 'Tourist Tax',
    "room_id" TEXT NOT NULL,
    "discount_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'flat',
    "currency_code" "CurrencyCode" DEFAULT 'AED',

    CONSTRAINT "tourist_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "user_type" "GuestType" NOT NULL DEFAULT 'adult',
    "property_id" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zip_code" TEXT,
    "user_identity_card" "userIdentityCardType" DEFAULT 'adhar_card',
    "identity_card_number" TEXT,
    "identity_card_image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_a_loyality_guest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_guests" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "type" "GuestType" NOT NULL DEFAULT 'adult',
    "date_of_birth" TIMESTAMP(3),
    "age" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_integrations" (
    "id" TEXT NOT NULL,
    "type" "IntegrationTypes" NOT NULL DEFAULT 'channel_manager',
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "required_fields_for_master_integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "master_integration_id" TEXT NOT NULL,

    CONSTRAINT "required_fields_for_master_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_integration_url_fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "master_integration_id" TEXT NOT NULL,

    CONSTRAINT "master_integration_url_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_loyalty_registration_fields" (
    "id" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,

    CONSTRAINT "master_loyalty_registration_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_property_categories" (
    "id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_property_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_property_types" (
    "id" TEXT NOT NULL,
    "property_type_name" TEXT NOT NULL,
    "property_type_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_property_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_amenities" (
    "id" TEXT NOT NULL,
    "amenity_name" TEXT NOT NULL,
    "amenity_type" "AmenityType" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterRoomView" (
    "id" TEXT NOT NULL,
    "view_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "meta_data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterRoomView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_payment_integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "master_payment_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "spa_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_sub_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "spa_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_on_brake_down" (
    "id" TEXT NOT NULL,
    "daily_price_breakdown_id" TEXT,
    "pricing_breakdown_id" TEXT,
    "addon_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AddOnType" NOT NULL,

    CONSTRAINT "add_on_brake_down_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_price_breakdown" (
    "id" TEXT NOT NULL,
    "pricing_breakdown_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "guest_distribution" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "base_charges_amount" DOUBLE PRECISION NOT NULL,
    "additional_charges_amount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL,

    CONSTRAINT "daily_price_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_breakdown" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "amount_before_tax" DOUBLE PRECISION NOT NULL,
    "taxed_amount" DOUBLE PRECISION NOT NULL,
    "total_addon_amount" DOUBLE PRECISION NOT NULL,
    "total_promotion_amount" DOUBLE PRECISION NOT NULL,
    "current_chargeable_amount" DOUBLE PRECISION NOT NULL,
    "latterpayable_amount" DOUBLE PRECISION NOT NULL,
    "promo_code_discount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL,
    "loyality_discount" DOUBLE PRECISION NOT NULL,
    "total_spa_tax" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "pricing_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_breakdown" (
    "id" TEXT NOT NULL,
    "pricing_breakdown_id" TEXT NOT NULL,
    "promotion_type" "ReservationPromotionType" NOT NULL DEFAULT 'normal',
    "name" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode",
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "restriction_type" "RestrictionType" NOT NULL,
    "type" "PromotionApplyType" NOT NULL,

    CONSTRAINT "promotion_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_promocode" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "CurrencyCode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_promocode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_pricing" (
    "id" TEXT NOT NULL,
    "pricing_id" TEXT NOT NULL,
    "spa_slot_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "spa_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_breakdown" (
    "id" TEXT NOT NULL,
    "pricing_breakdown_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxed_amount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL,

    CONSTRAINT "tax_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_details" (
    "id" TEXT NOT NULL,
    "pay_at_hotel" BOOLEAN NOT NULL DEFAULT true,
    "payment_gateway" BOOLEAN NOT NULL DEFAULT false,
    "property_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_addresses" (
    "id" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "property_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyEmails" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "PropertyEmails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_configs" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "pms_integration_active" BOOLEAN NOT NULL DEFAULT true,
    "channel_manager_integration_active" BOOLEAN NOT NULL DEFAULT true,
    "self_ari_active" BOOLEAN NOT NULL DEFAULT true,
    "is_b2b_available" BOOLEAN NOT NULL DEFAULT true,
    "is_b2c_available" BOOLEAN NOT NULL DEFAULT true,
    "show_video" BOOLEAN NOT NULL DEFAULT true,
    "commission" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "base_currency" "CurrencyCode" NOT NULL DEFAULT 'INR',
    "reservation_reset_minutes" INTEGER NOT NULL DEFAULT 570,
    "is_available_for_booking" BOOLEAN NOT NULL DEFAULT true,
    "is_available_for_ota" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_engine_configurations" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL,
    "secondary_color" TEXT NOT NULL,
    "tertiary_color" TEXT NOT NULL,
    "button_text_color" TEXT NOT NULL,
    "banner_image" TEXT,
    "logo" TEXT NOT NULL,
    "website_url" TEXT,

    CONSTRAINT "booking_engine_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_categories" (
    "id" TEXT NOT NULL,
    "master_category_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "property_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_types" (
    "id" TEXT NOT NULL,
    "master_property_type_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "property_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_amenity_selections" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "property_amenity_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_amenity_selections" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "room_amenity_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_videos" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "property_email" TEXT NOT NULL,
    "property_contact" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT[],
    "star_rating" DOUBLE PRECISION,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "creation_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_code" TEXT NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "room_name" TEXT DEFAULT '-',
    "room_type_code" TEXT NOT NULL DEFAULT '-',
    "rate_plan_code" TEXT NOT NULL,
    "rate_plan_name" TEXT DEFAULT '-',
    "booking_code" TEXT NOT NULL,
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_in_date" DATE,
    "check_out_date" DATE,
    "reservation_start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservation_end_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country_code" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "device_types" "DeviceType" NOT NULL,
    "platforms" "Platforms" NOT NULL DEFAULT 'web',
    "primary_guest_id" TEXT NOT NULL,
    "guests" JSONB NOT NULL,
    "booking_user_email" TEXT NOT NULL,
    "booking_user_phone" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency_code" "CurrencyCode" NOT NULL DEFAULT 'AED',
    "final_price" JSONB,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extra_amount_to_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refund_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'pay_at_hotel',
    "payment_images" JSONB,
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "cancellation_reason" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'direct',
    "is_promo_used" BOOLEAN NOT NULL DEFAULT false,
    "promo_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "agency_id" TEXT,
    "ota_guest_id" TEXT,
    "pricing_breakdown_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MRoomView" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "master_room_view_id" TEXT NOT NULL,

    CONSTRAINT "MRoomView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_videos" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "total_room" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "room_view" "RoomView" NOT NULL DEFAULT 'others',
    "room_size" DOUBLE PRECISION NOT NULL,
    "room_unit" "RoomUnit" NOT NULL DEFAULT 'sqft',
    "smoking_policy" "SmokingPolicy" NOT NULL DEFAULT 'non_smoking',
    "max_occupancy" INTEGER NOT NULL,
    "max_number_of_adults" INTEGER NOT NULL,
    "max_number_of_children" INTEGER NOT NULL,
    "number_of_bedrooms" INTEGER NOT NULL DEFAULT 1,
    "number_of_beds" INTEGER NOT NULL DEFAULT 1,
    "number_of_living_room" INTEGER NOT NULL DEFAULT 0,
    "extra_bed" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "360_view_link" TEXT,
    "image" TEXT[],
    "available" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "property_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charges_propertyCode_roomTypeCode_ratePlanCode_date_key" ON "charges"("propertyCode", "roomTypeCode", "ratePlanCode", "date");

-- CreateIndex
CREATE INDEX "charge_base_by_guests_chargeId_idx" ON "charge_base_by_guests"("chargeId");

-- CreateIndex
CREATE INDEX "charge_additional_guests_chargeId_idx" ON "charge_additional_guests"("chargeId");

-- CreateIndex
CREATE INDEX "inventories_property_code_idx" ON "inventories"("property_code");

-- CreateIndex
CREATE INDEX "inventories_room_type_code_idx" ON "inventories"("room_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_property_code_room_type_code_date_key" ON "inventories"("property_code", "room_type_code", "date");

-- CreateIndex
CREATE INDEX "policies_type_idx" ON "policies"("type");

-- CreateIndex
CREATE INDEX "policies_property_id_idx" ON "policies"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "rate_plans_rate_plan_code_key" ON "rate_plans"("rate_plan_code");

-- CreateIndex
CREATE INDEX "rate_plans_property_id_idx" ON "rate_plans"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_tickets_ticket_no_key" ON "problem_tickets"("ticket_no");

-- CreateIndex
CREATE INDEX "problem_tickets_property_id_idx" ON "problem_tickets"("property_id");

-- CreateIndex
CREATE INDEX "problem_tickets_status_idx" ON "problem_tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "access_controls_role_key" ON "access_controls"("role");

-- CreateIndex
CREATE UNIQUE INDEX "creations_property_id_key" ON "creations"("property_id");

-- CreateIndex
CREATE INDEX "creations_type_idx" ON "creations"("type");

-- CreateIndex
CREATE INDEX "creations_created_by_id_idx" ON "creations"("created_by_id");

-- CreateIndex
CREATE INDEX "creations_super_id_idx" ON "creations"("super_id");

-- CreateIndex
CREATE INDEX "creations_group_id_idx" ON "creations"("group_id");

-- CreateIndex
CREATE INDEX "creations_brand_id_idx" ON "creations"("brand_id");

-- CreateIndex
CREATE INDEX "creations_property_id_idx" ON "creations"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_by_id_idx" ON "users"("created_by_id");

-- CreateIndex
CREATE INDEX "users_creation_id_idx" ON "users"("creation_id");

-- CreateIndex
CREATE INDEX "users_level0_creation_id_idx" ON "users"("level0_creation_id");

-- CreateIndex
CREATE INDEX "users_level1_creation_id_idx" ON "users"("level1_creation_id");

-- CreateIndex
CREATE INDEX "users_level2_creation_id_idx" ON "users"("level2_creation_id");

-- CreateIndex
CREATE INDEX "users_level3_creation_id_idx" ON "users"("level3_creation_id");

-- CreateIndex
CREATE INDEX "users_level4_creation_id_idx" ON "users"("level4_creation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Addon_code_key" ON "Addon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AddonAvailability_addonId_date_key" ON "AddonAvailability"("addonId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AddonCategory_code_key" ON "AddonCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "rate_plan_with_addon_rate_plan_id_addon_id_key" ON "rate_plan_with_addon"("rate_plan_id", "addon_id");

-- CreateIndex
CREATE UNIQUE INDEX "AddonSubCategory_code_key" ON "AddonSubCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AddonVariant_code_key" ON "AddonVariant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "agency_agency_name_key" ON "agency"("agency_name");

-- CreateIndex
CREATE UNIQUE INDEX "agency_agency_email_key" ON "agency"("agency_email");

-- CreateIndex
CREATE UNIQUE INDEX "agency_tax_no_key" ON "agency"("tax_no");

-- CreateIndex
CREATE UNIQUE INDEX "agency_commissions_reservation_id_key" ON "agency_commissions"("reservation_id");

-- CreateIndex
CREATE INDEX "agency_commissions_agency_id_idx" ON "agency_commissions"("agency_id");

-- CreateIndex
CREATE INDEX "agency_commissions_agent_id_idx" ON "agency_commissions"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_applications_applicant_email_key" ON "agent_applications"("applicant_email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_applications_agency_name_key" ON "agent_applications"("agency_name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_applications_agency_email_key" ON "agent_applications"("agency_email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_applications_tax_no_key" ON "agent_applications"("tax_no");

-- CreateIndex
CREATE INDEX "agentic_property_agency_id_idx" ON "agentic_property"("agency_id");

-- CreateIndex
CREATE INDEX "agentic_property_property_id_idx" ON "agentic_property"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "agentic_property_agency_id_property_id_key" ON "agentic_property"("agency_id", "property_id");

-- CreateIndex
CREATE INDEX "agentic_room_agentic_property_id_idx" ON "agentic_room"("agentic_property_id");

-- CreateIndex
CREATE INDEX "agentic_room_room_id_idx" ON "agentic_room"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "agentic_room_agentic_property_id_room_id_key" ON "agentic_room"("agentic_property_id", "room_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_email_key" ON "agents"("agent_email");

-- CreateIndex
CREATE INDEX "agents_agency_id_idx" ON "agents"("agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_commission_property_id_key" ON "property_commission"("property_id");

-- CreateIndex
CREATE INDEX "property_integrations_property_id_idx" ON "property_integrations"("property_id");

-- CreateIndex
CREATE INDEX "property_integrations_master_integration_id_idx" ON "property_integrations"("master_integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_integrations_property_id_master_integration_id_key" ON "property_integrations"("property_id", "master_integration_id");

-- CreateIndex
CREATE INDEX "property_integration_secrets_property_integration_id_idx" ON "property_integration_secrets"("property_integration_id");

-- CreateIndex
CREATE INDEX "property_integration_secrets_required_field_id_idx" ON "property_integration_secrets"("required_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_integration_secrets_property_integration_id_requir_key" ON "property_integration_secrets"("property_integration_id", "required_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_payment_integrations_id_outlet_id_key" ON "property_payment_integrations"("id", "outlet_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_payment_integrations_property_id_payment_integrati_key" ON "property_payment_integrations"("property_id", "payment_integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_program_configs_creation_id_key" ON "loyalty_program_configs"("creation_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_levels_creation_loyalty_config_id_level_key" ON "loyalty_levels"("creation_loyalty_config_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "basic_loyalty_programs_loyalty_program_id_key" ON "basic_loyalty_programs"("loyalty_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "advance_loyalty_programs_loyalty_program_id_key" ON "advance_loyalty_programs"("loyalty_program_id");

-- CreateIndex
CREATE INDEX "loyalty_conditions_loyalty_program_id_idx" ON "loyalty_conditions"("loyalty_program_id");

-- CreateIndex
CREATE INDEX "loyalty_special_conditions_loyalty_program_id_idx" ON "loyalty_special_conditions"("loyalty_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgramFieldConfig_loyaltyProgramId_fieldName_key" ON "LoyaltyProgramFieldConfig"("loyaltyProgramId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "loyality_guests_guest_email_key" ON "loyality_guests"("guest_email");

-- CreateIndex
CREATE UNIQUE INDEX "loyality_guests_ota_guest_id_key" ON "loyality_guests"("ota_guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "creation_guests_creation_loyalty_config_id_loyality_guest_i_key" ON "creation_guests"("creation_loyalty_config_id", "loyality_guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_loyalty_configs_property_id_key" ON "property_loyalty_configs"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_loyalty_configs_property_code_key" ON "property_loyalty_configs"("property_code");

-- CreateIndex
CREATE UNIQUE INDEX "property_loyality_guests_property_loyality_id_loyality_gues_key" ON "property_loyality_guests"("property_loyality_id", "loyality_guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "ota_guest_email_key" ON "ota_guest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_reviews_reservation_id_key" ON "customer_reviews"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_wishlist_ota_guest_id_property_id_key" ON "customer_wishlist"("ota_guest_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_wishlist_wishlist_id_room_id_key" ON "room_wishlist"("wishlist_id", "room_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_property_id_code_idx" ON "promo_codes"("property_id", "code");

-- CreateIndex
CREATE INDEX "promo_codes_id_code_idx" ON "promo_codes"("id", "code");

-- CreateIndex
CREATE INDEX "promo_codes_property_id_name_idx" ON "promo_codes"("property_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "customizable_deals_applicable_addons_customizable_deal_id_a_key" ON "customizable_deals_applicable_addons"("customizable_deal_id", "add_on_id");

-- CreateIndex
CREATE INDEX "geo_rate_plan_property_id_room_id_rate_plan_id_idx" ON "geo_rate_plan"("property_id", "room_id", "rate_plan_id");

-- CreateIndex
CREATE INDEX "promotion_rule_property_id_room_id_rate_plan_id_idx" ON "promotion_rule"("property_id", "room_id", "rate_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_offsets_rate_plan_id_date_key" ON "booking_offsets"("rate_plan_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "rate_plan_rules_rate_plan_id_key" ON "rate_plan_rules"("rate_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "spa_dates_spa_module_id_date_key" ON "spa_dates"("spa_module_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "slot_bookings_spa_slot_id_key" ON "slot_bookings"("spa_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "spa_module_name_property_id_key" ON "spa_module"("name", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "spa_module_item_code_property_id_key" ON "spa_module"("item_code", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_assigned_spa_user_id_spa_id_key" ON "user_assigned_spa"("user_id", "spa_id");

-- CreateIndex
CREATE INDEX "tax_rules_property_id_idx" ON "tax_rules"("property_id");

-- CreateIndex
CREATE INDEX "tax_groups_property_id_idx" ON "tax_groups"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_group_rules_tax_group_id_tax_rule_id_key" ON "tax_group_rules"("tax_group_id", "tax_rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "tourist_taxes_room_id_key" ON "tourist_taxes"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "guests_property_id_email_key" ON "guests"("property_id", "email");

-- CreateIndex
CREATE INDEX "reservation_guests_reservation_id_idx" ON "reservation_guests"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_integrations_name_type_key" ON "master_integrations"("name", "type");

-- CreateIndex
CREATE INDEX "required_fields_for_master_integration_master_integration_i_idx" ON "required_fields_for_master_integration"("master_integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "required_fields_for_master_integration_master_integration_i_key" ON "required_fields_for_master_integration"("master_integration_id", "name");

-- CreateIndex
CREATE INDEX "master_integration_url_fields_master_integration_id_idx" ON "master_integration_url_fields"("master_integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_integration_url_fields_master_integration_id_name_key" ON "master_integration_url_fields"("master_integration_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "master_property_categories_category_name_key" ON "master_property_categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "master_property_types_property_type_name_key" ON "master_property_types"("property_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "master_amenities_amenity_name_key" ON "master_amenities"("amenity_name");

-- CreateIndex
CREATE UNIQUE INDEX "master_payment_integrations_name_key" ON "master_payment_integrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spa_category_name_key" ON "spa_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spa_sub_category_category_id_name_key" ON "spa_sub_category"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_breakdown_reservation_id_key" ON "pricing_breakdown"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "spa_pricing_spa_slot_id_key" ON "spa_pricing"("spa_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_property_id_key" ON "bank_details"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_addresses_property_id_key" ON "property_addresses"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyEmails_property_id_email_key" ON "PropertyEmails"("property_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "property_configs_property_id_key" ON "property_configs"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_engine_configurations_property_id_key" ON "booking_engine_configurations"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_categories_property_id_key" ON "property_categories"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_types_property_id_key" ON "property_types"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_amenity_selections_property_id_amenity_id_key" ON "property_amenity_selections"("property_id", "amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_amenity_selections_room_id_amenity_id_key" ON "room_amenity_selections"("room_id", "amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_videos_propertyId_key" ON "property_videos"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "properties_property_code_key" ON "properties"("property_code");

-- CreateIndex
CREATE UNIQUE INDEX "properties_creation_id_key" ON "properties"("creation_id");

-- CreateIndex
CREATE INDEX "properties_created_by_id_idx" ON "properties"("created_by_id");

-- CreateIndex
CREATE INDEX "properties_creation_id_idx" ON "properties"("creation_id");

-- CreateIndex
CREATE INDEX "properties_property_code_idx" ON "properties"("property_code");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_booking_code_key" ON "reservations"("booking_code");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_pricing_breakdown_id_key" ON "reservations"("pricing_breakdown_id");

-- CreateIndex
CREATE INDEX "reservations_property_code_idx" ON "reservations"("property_code");

-- CreateIndex
CREATE INDEX "reservations_property_id_idx" ON "reservations"("property_id");

-- CreateIndex
CREATE INDEX "reservations_room_type_code_idx" ON "reservations"("room_type_code");

-- CreateIndex
CREATE INDEX "reservations_rate_plan_code_idx" ON "reservations"("rate_plan_code");

-- CreateIndex
CREATE INDEX "reservations_booking_status_idx" ON "reservations"("booking_status");

-- CreateIndex
CREATE INDEX "reservations_source_idx" ON "reservations"("source");

-- CreateIndex
CREATE INDEX "reservations_primary_guest_id_idx" ON "reservations"("primary_guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "MRoomView_room_id_key" ON "MRoomView"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_videos_roomId_key" ON "room_videos"("roomId");

-- CreateIndex
CREATE INDEX "rooms_property_id_idx" ON "rooms"("property_id");

-- CreateIndex
CREATE INDEX "rooms_room_type_idx" ON "rooms"("room_type");

-- CreateIndex
CREATE INDEX "rooms_available_idx" ON "rooms"("available");

-- CreateIndex
CREATE INDEX "rooms_is_deleted_idx" ON "rooms"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_property_id_room_type_key" ON "rooms"("property_id", "room_type");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_property_id_room_name_key" ON "rooms"("property_id", "room_name");

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_ratePlanCode_fkey" FOREIGN KEY ("ratePlanCode") REFERENCES "rate_plans"("rate_plan_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_base_by_guests" ADD CONSTRAINT "charge_base_by_guests_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_additional_guests" ADD CONSTRAINT "charge_additional_guests_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_deposit_policy_id_fkey" FOREIGN KEY ("deposit_policy_id") REFERENCES "policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_cancellation_policy_id_fkey" FOREIGN KEY ("cancellation_policy_id") REFERENCES "policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_guarantee_policy_id_fkey" FOREIGN KEY ("guarantee_policy_id") REFERENCES "policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_tax_group_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "tax_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tickets" ADD CONSTRAINT "problem_tickets_ota_guest_id_fkey" FOREIGN KEY ("ota_guest_id") REFERENCES "ota_guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_super_id_fkey" FOREIGN KEY ("super_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_regional_id_fkey" FOREIGN KEY ("regional_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level0_creation_id_fkey" FOREIGN KEY ("level0_creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level1_creation_id_fkey" FOREIGN KEY ("level1_creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level2_creation_id_fkey" FOREIGN KEY ("level2_creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level3_creation_id_fkey" FOREIGN KEY ("level3_creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level4_creation_id_fkey" FOREIGN KEY ("level4_creation_id") REFERENCES "creations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addon" ADD CONSTRAINT "Addon_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addon" ADD CONSTRAINT "Addon_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "AddonSubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addon" ADD CONSTRAINT "Addon_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AddonCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addon" ADD CONSTRAINT "Addon_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "AddonVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildAddon" ADD CONSTRAINT "ChildAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonAvailability" ADD CONSTRAINT "AddonAvailability_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonCategory" ADD CONSTRAINT "AddonCategory_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plan_with_addon" ADD CONSTRAINT "rate_plan_with_addon_rate_plan_id_fkey" FOREIGN KEY ("rate_plan_id") REFERENCES "rate_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plan_with_addon" ADD CONSTRAINT "rate_plan_with_addon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonSubCategory" ADD CONSTRAINT "AddonSubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AddonCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonSubCategory" ADD CONSTRAINT "AddonSubCategory_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonVariant" ADD CONSTRAINT "AddonVariant_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonVariant" ADD CONSTRAINT "AddonVariant_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "AddonSubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_commissions" ADD CONSTRAINT "agency_commissions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_commissions" ADD CONSTRAINT "agency_commissions_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_commissions" ADD CONSTRAINT "agency_commissions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentic_property" ADD CONSTRAINT "agentic_property_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentic_property" ADD CONSTRAINT "agentic_property_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentic_room" ADD CONSTRAINT "agentic_room_agentic_property_id_fkey" FOREIGN KEY ("agentic_property_id") REFERENCES "agentic_property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentic_room" ADD CONSTRAINT "agentic_room_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_commission" ADD CONSTRAINT "property_commission_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_integrations" ADD CONSTRAINT "property_integrations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_integrations" ADD CONSTRAINT "property_integrations_master_integration_id_fkey" FOREIGN KEY ("master_integration_id") REFERENCES "master_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_integration_secrets" ADD CONSTRAINT "property_integration_secrets_property_integration_id_fkey" FOREIGN KEY ("property_integration_id") REFERENCES "property_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_integration_secrets" ADD CONSTRAINT "property_integration_secrets_required_field_id_fkey" FOREIGN KEY ("required_field_id") REFERENCES "required_fields_for_master_integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_payment_integrations" ADD CONSTRAINT "property_payment_integrations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_payment_integrations" ADD CONSTRAINT "property_payment_integrations_payment_integration_id_fkey" FOREIGN KEY ("payment_integration_id") REFERENCES "master_payment_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_program_configs" ADD CONSTRAINT "loyalty_program_configs_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_levels" ADD CONSTRAINT "loyalty_levels_creation_loyalty_config_id_fkey" FOREIGN KEY ("creation_loyalty_config_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_loyalty_programs" ADD CONSTRAINT "basic_loyalty_programs_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advance_loyalty_programs" ADD CONSTRAINT "advance_loyalty_programs_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_conditions" ADD CONSTRAINT "loyalty_conditions_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_special_conditions" ADD CONSTRAINT "loyalty_special_conditions_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgramFieldConfig" ADD CONSTRAINT "LoyaltyProgramFieldConfig_loyaltyProgramId_fkey" FOREIGN KEY ("loyaltyProgramId") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyProgramFieldConfig" ADD CONSTRAINT "LoyaltyProgramFieldConfig_masterRegistrationFieldId_fkey" FOREIGN KEY ("masterRegistrationFieldId") REFERENCES "master_loyalty_registration_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyality_guests" ADD CONSTRAINT "loyality_guests_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyality_guests" ADD CONSTRAINT "loyality_guests_ota_guest_id_fkey" FOREIGN KEY ("ota_guest_id") REFERENCES "ota_guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_guests" ADD CONSTRAINT "creation_guests_loyality_guest_id_fkey" FOREIGN KEY ("loyality_guest_id") REFERENCES "loyality_guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_guests" ADD CONSTRAINT "creation_guests_creation_loyalty_config_id_fkey" FOREIGN KEY ("creation_loyalty_config_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_loyalty_configs" ADD CONSTRAINT "property_loyalty_configs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_loyalty_configs" ADD CONSTRAINT "property_loyalty_configs_creation_loyalty_config_id_fkey" FOREIGN KEY ("creation_loyalty_config_id") REFERENCES "loyalty_program_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_loyality_guests" ADD CONSTRAINT "property_loyality_guests_property_loyality_id_fkey" FOREIGN KEY ("property_loyality_id") REFERENCES "property_loyalty_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_loyality_guests" ADD CONSTRAINT "property_loyality_guests_loyality_guest_id_fkey" FOREIGN KEY ("loyality_guest_id") REFERENCES "loyality_guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_ota_customer_id_fkey" FOREIGN KEY ("ota_customer_id") REFERENCES "ota_guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_wishlist" ADD CONSTRAINT "customer_wishlist_ota_guest_id_fkey" FOREIGN KEY ("ota_guest_id") REFERENCES "ota_guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_wishlist" ADD CONSTRAINT "customer_wishlist_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_wishlist" ADD CONSTRAINT "room_wishlist_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "customer_wishlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_wishlist" ADD CONSTRAINT "room_wishlist_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_propertyPaymentIntegrationId_fkey" FOREIGN KEY ("propertyPaymentIntegrationId") REFERENCES "property_payment_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizable_deals" ADD CONSTRAINT "customizable_deals_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizable_deals" ADD CONSTRAINT "customizable_deals_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizable_deals" ADD CONSTRAINT "customizable_deals_rate_plan_id_fkey" FOREIGN KEY ("rate_plan_id") REFERENCES "rate_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizable_deals_applicable_addons" ADD CONSTRAINT "customizable_deals_applicable_addons_customizable_deal_id_fkey" FOREIGN KEY ("customizable_deal_id") REFERENCES "customizable_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizable_deals_applicable_addons" ADD CONSTRAINT "customizable_deals_applicable_addons_add_on_id_fkey" FOREIGN KEY ("add_on_id") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_rate_plan" ADD CONSTRAINT "geo_rate_plan_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_rate_plan" ADD CONSTRAINT "geo_rate_plan_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_rate_plan" ADD CONSTRAINT "geo_rate_plan_rate_plan_id_fkey" FOREIGN KEY ("rate_plan_id") REFERENCES "rate_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rule" ADD CONSTRAINT "promotion_rule_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rule" ADD CONSTRAINT "promotion_rule_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rule" ADD CONSTRAINT "promotion_rule_rate_plan_id_fkey" FOREIGN KEY ("rate_plan_id") REFERENCES "rate_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_offsets" ADD CONSTRAINT "booking_offsets_rate_plan_code_fkey" FOREIGN KEY ("rate_plan_code") REFERENCES "rate_plans"("rate_plan_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_offsets" ADD CONSTRAINT "booking_offsets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plan_rules" ADD CONSTRAINT "rate_plan_rules_rate_plan_id_fkey" FOREIGN KEY ("rate_plan_id") REFERENCES "rate_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_dates" ADD CONSTRAINT "spa_dates_spa_module_id_fkey" FOREIGN KEY ("spa_module_id") REFERENCES "spa_module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_slots" ADD CONSTRAINT "spa_slots_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_slots" ADD CONSTRAINT "spa_slots_spa_date_id_fkey" FOREIGN KEY ("spa_date_id") REFERENCES "spa_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_spa_booking_id_fkey" FOREIGN KEY ("spa_booking_id") REFERENCES "spa_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_spa_id_fkey" FOREIGN KEY ("spa_id") REFERENCES "spa_module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_spa_slot_id_fkey" FOREIGN KEY ("spa_slot_id") REFERENCES "spa_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_module" ADD CONSTRAINT "spa_module_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_module" ADD CONSTRAINT "spa_module_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "spa_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_module" ADD CONSTRAINT "spa_module_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "spa_sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_module" ADD CONSTRAINT "spa_module_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assigned_spa" ADD CONSTRAINT "user_assigned_spa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assigned_spa" ADD CONSTRAINT "user_assigned_spa_spa_id_fkey" FOREIGN KEY ("spa_id") REFERENCES "spa_module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_groups" ADD CONSTRAINT "tax_groups_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_group_rules" ADD CONSTRAINT "tax_group_rules_tax_group_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "tax_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_group_rules" ADD CONSTRAINT "tax_group_rules_tax_rule_id_fkey" FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourist_taxes" ADD CONSTRAINT "tourist_taxes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_guests" ADD CONSTRAINT "reservation_guests_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "required_fields_for_master_integration" ADD CONSTRAINT "required_fields_for_master_integration_master_integration__fkey" FOREIGN KEY ("master_integration_id") REFERENCES "master_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_integration_url_fields" ADD CONSTRAINT "master_integration_url_fields_master_integration_id_fkey" FOREIGN KEY ("master_integration_id") REFERENCES "master_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_sub_category" ADD CONSTRAINT "spa_sub_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "spa_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "add_on_brake_down" ADD CONSTRAINT "add_on_brake_down_daily_price_breakdown_id_fkey" FOREIGN KEY ("daily_price_breakdown_id") REFERENCES "daily_price_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "add_on_brake_down" ADD CONSTRAINT "add_on_brake_down_pricing_breakdown_id_fkey" FOREIGN KEY ("pricing_breakdown_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_price_breakdown" ADD CONSTRAINT "daily_price_breakdown_pricing_breakdown_id_fkey" FOREIGN KEY ("pricing_breakdown_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_breakdown" ADD CONSTRAINT "promotion_breakdown_pricing_breakdown_id_fkey" FOREIGN KEY ("pricing_breakdown_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_promocode" ADD CONSTRAINT "reservation_promocode_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_promocode" ADD CONSTRAINT "reservation_promocode_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_pricing" ADD CONSTRAINT "spa_pricing_pricing_id_fkey" FOREIGN KEY ("pricing_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spa_pricing" ADD CONSTRAINT "spa_pricing_spa_slot_id_fkey" FOREIGN KEY ("spa_slot_id") REFERENCES "spa_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_breakdown" ADD CONSTRAINT "tax_breakdown_pricing_breakdown_id_fkey" FOREIGN KEY ("pricing_breakdown_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_addresses" ADD CONSTRAINT "property_addresses_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEmails" ADD CONSTRAINT "PropertyEmails_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_configs" ADD CONSTRAINT "property_configs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_engine_configurations" ADD CONSTRAINT "booking_engine_configurations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_categories" ADD CONSTRAINT "property_categories_master_category_id_fkey" FOREIGN KEY ("master_category_id") REFERENCES "master_property_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_categories" ADD CONSTRAINT "property_categories_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_types" ADD CONSTRAINT "property_types_master_property_type_id_fkey" FOREIGN KEY ("master_property_type_id") REFERENCES "master_property_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_types" ADD CONSTRAINT "property_types_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_amenity_selections" ADD CONSTRAINT "property_amenity_selections_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_amenity_selections" ADD CONSTRAINT "property_amenity_selections_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "master_amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenity_selections" ADD CONSTRAINT "room_amenity_selections_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenity_selections" ADD CONSTRAINT "room_amenity_selections_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "master_amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_videos" ADD CONSTRAINT "property_videos_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_primary_guest_id_fkey" FOREIGN KEY ("primary_guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_ota_guest_id_fkey" FOREIGN KEY ("ota_guest_id") REFERENCES "ota_guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pricing_breakdown_id_fkey" FOREIGN KEY ("pricing_breakdown_id") REFERENCES "pricing_breakdown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MRoomView" ADD CONSTRAINT "MRoomView_master_room_view_id_fkey" FOREIGN KEY ("master_room_view_id") REFERENCES "MasterRoomView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MRoomView" ADD CONSTRAINT "MRoomView_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_videos" ADD CONSTRAINT "room_videos_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
