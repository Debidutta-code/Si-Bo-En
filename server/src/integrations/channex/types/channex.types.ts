// src/integrations/channex/types/channex.types.ts

export interface ChannexDynamicConfig {
    apiKey: string;
    propertyId: string;
    webhookSecret?: string;
    baseUrl: string;
}

export interface ChannexAvailabilityValue {
    property_id: string;
    room_type_id: string;
    date?: string; // YYYY-MM-DD
    date_from?: string; // YYYY-MM-DD
    date_to?: string; // YYYY-MM-DD
    availability: number;
}

export interface ChannexAvailabilityPayload {
    values: ChannexAvailabilityValue[];
}

export interface ChannexRestrictionValue {
    property_id: string;
    rate_plan_id: string;
    date?: string; // YYYY-MM-DD
    date_from?: string; // YYYY-MM-DD
    date_to?: string; // YYYY-MM-DD
    rate?: number | string;
    min_stay?: number;
    max_stay?: number;
    closed_to_arrival?: boolean;
    closed_to_departure?: boolean;
    stop_sell?: boolean;
}

export interface ChannexRestrictionsPayload {
    values: ChannexRestrictionValue[];
}

export interface ChannexBookingCustomer {
    name?: string;
    first_name?: string;
    last_name?: string;
    surname?: string;
    email?: string;
    mail?: string;
    phone?: string;
    country?: string;
}

export interface ChannexBookingRoom {
    room_type_id: string;
    rate_plan_id?: string;
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    amount?: string | number;
    occupancy?: {
        adults: number;
        children?: number;
        infants?: number;
    };
}

export interface ChannexBookingPayload {
    booking: {
        property_id: string;
        ota_name?: string;
        ota_reservation_code?: string;
        amount?: string | number;
        currency?: string;
        status?: 'new' | 'modified' | 'cancelled';
        arrival_date?: string;
        departure_date?: string;
        customer: ChannexBookingCustomer;
        rooms: ChannexBookingRoom[];
    };
}

export interface ChannexWebhookPayload {
    event: 'booking' | string;
    payload: {
        booking_id: string;
        property_id: string;
        revision_id: string;
    };
    property_id: string;
    timestamp: string;
}

export interface ChannexBookingRevisionRoom {
    room_type_id: string;
    room_type_code?: string;
    rate_plan_id: string;
    rate_plan_code?: string;
    check_in?: string;
    check_out?: string;
    arrival_date?: string;
    departure_date?: string;
    amount?: string | number;
    occupancy?: {
        adults: number;
        children?: number;
        infants?: number;
    };
}

export interface ChannexBookingRevision {
    id: string;
    property_id: string;
    booking_id: string;
    unique_id: string;
    system_id: string;
    ota_reservation_code: string;
    ota_name: string;
    status: 'new' | 'modified' | 'cancelled';
    arrival_date: string; // YYYY-MM-DD
    departure_date: string; // YYYY-MM-DD
    arrival_hour?: string;
    amount: string;
    currency: string;
    notes?: string;
    rooms: ChannexBookingRevisionRoom[];
    customer: ChannexBookingCustomer;
    occupancy: {
        adults: number;
        children: number;
        infants: number;
    };
}

export interface ChannexBookingRevisionResponse {
    data: {
        type: 'booking_revision';
        id: string;
        attributes: ChannexBookingRevision;
    };
}
