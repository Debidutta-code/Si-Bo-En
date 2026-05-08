import { HotelRepository } from '../repository';
import { HotelFilterQuery } from '../types';

export class HotelService {
    private static formatProperties(properties: any[]) {
        return properties.map((prop: any) => ({
            id: prop.id,
            propertyCode: prop.propertyCode,
            propertyName: prop.propertyName,
            propertyEmail: prop.propertyEmail,
            propertyContact: prop.propertyContact,
            starRating: prop.starRating,
            description: prop.description,
            image: prop.image, // Array of images
            address: prop.propertyAddress ? {
                city: prop.propertyAddress.city,
                state: prop.propertyAddress.state,
                country: prop.propertyAddress.country,
                latitude: prop.propertyAddress.latitude,
                longitude: prop.propertyAddress.longitude,
            } : null,
            propertyType: prop.propertyType?.masterPropertyType?.propertyTypeName || null,
            amenities: prop.propertyAmenities.map((pa: any) => ({
                id: pa.amenity.id,
                name: pa.amenity.amenityName,
                icon: pa.amenity.icon,
            })),
        }));
    }

    public static async fetchPaginatedHotels(filters: HotelFilterQuery) {
        try {
            const result = await HotelRepository.getPaginatedHotels(filters);
            return {
                ...result,
                properties: this.formatProperties(result.properties)
            };
        } catch (error: any) {
            console.error("Error in HotelService.fetchPaginatedHotels", error);
            throw new Error(`Failed to fetch hotels: ${error.message}`);
        }
    }

    public static async fetchAutocompleteHotels(filters: HotelFilterQuery) {
        try {
            const result = await HotelRepository.getAutocompleteHotels(filters);
            return {
                ...result,
                properties: this.formatProperties(result.properties)
            };
        } catch (error: any) {
            console.error("Error in HotelService.fetchAutocompleteHotels", error);
            throw new Error(`Failed to fetch autocomplete hotels: ${error.message}`);
        }
    }

    public static async fetchAutocompleteLocations(filters: HotelFilterQuery) {
        try {
            const result = await HotelRepository.getAutocompleteLocations(filters);
            return {
                ...result,
                properties: this.formatProperties(result.properties)
            };
        } catch (error: any) {
            console.error("Error in HotelService.fetchAutocompleteLocations", error);
            throw new Error(`Failed to fetch autocomplete locations: ${error.message}`);
        }
    }
}
