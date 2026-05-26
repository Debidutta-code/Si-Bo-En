export interface HotelFilterQuery {
    page?: string;
    limit?: string;
    search?: string;
    city?: string;
    country?: string;
    amenities?: string; // Comma-separated amenity IDs
    propertyType?: string; // Comma-separated property types
    propertyCategory?: string; // Comma-separated property categories
}
export interface IProperties {
    id: string;
    propertyCode: string;
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    description: string;
    image: string[];
    propertyAddress: {
        city: string;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
    } | null;
    propertyType: string | null;
    amenities: {
        id: string;
        name: string;
        icon: string;
    }[];
}
export interface IRepoRes {
    properties: IRepoProperty[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
}
export interface IRepoProperty {
    id: string;
    propertyCode: string;
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    description: string;
    image: string[];
    propertyAddress: {
        city: string;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
    } | null;
    propertyType: { masterPropertyType?: { propertyTypeName: string; } | undefined; }|null
    propertyAmenities: {
        amenity: {
            id: string; amenityName: string; icon: string | null; 
        }
    }[];
}