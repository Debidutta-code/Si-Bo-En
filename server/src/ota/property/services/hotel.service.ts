import { HotelRepository } from '../repository';
import { HotelFilterQuery } from '../types';

export class HotelService {
    public static async fetchPaginatedHotels(filters: HotelFilterQuery) {
        try {
            // Can add more business logic here if needed (e.g., transforming data)
            const result = await HotelRepository.getPaginatedHotels(filters);

            // Mapping to a streamlined basic data format suitable for the app list
            const formattedProperties = result.properties.map((prop: any) => ({
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

            return {
                ...result,
                properties: formattedProperties
            };
        } catch (error: any) {
            console.error("Error in HotelService.fetchPaginatedHotels", error);
            throw new Error(`Failed to fetch hotels: ${error.message}`);
        }
    }
}
