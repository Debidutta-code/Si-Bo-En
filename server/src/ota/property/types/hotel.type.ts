export interface HotelFilterQuery {
    page?: string;
    limit?: string;
    search?: string;
    city?: string;
    country?: string;
    starRating?: string;
    amenities?: string; // Comma-separated amenity IDs
    propertyType?: string; // Comma-separated property types
    propertyCategory?: string; // Comma-separated property categories
}
