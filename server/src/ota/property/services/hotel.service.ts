import { errorResponse, IApiResponse, paginatedSuccessResponse, successResponse } from '../../../utils';
import { HotelRepository } from '../repository';
import { HotelFilterQuery, IProperties, IRepoProperty } from '../types';

export class HotelService {
    private hotelRepository: HotelRepository;
    constructor() {
        this.hotelRepository = new HotelRepository();
    }
    private formatProperties(properties: IRepoProperty[]): IProperties[] {
        return properties.map((prop: IRepoProperty) => ({
            id: prop.id,
            propertyCode: prop.propertyCode,
            propertyName: prop.propertyName,
            propertyEmail: prop.propertyEmail,
            propertyContact: prop.propertyContact,
            description: prop.description,
            image: prop.image,
            propertyAddress: prop.propertyAddress ? {
                city: prop.propertyAddress.city,
                state: prop.propertyAddress.state,
                country: prop.propertyAddress.country,
                latitude: prop.propertyAddress.latitude,
                longitude: prop.propertyAddress.longitude,
            } : null,
            propertyType: prop.propertyType?.masterPropertyType?.propertyTypeName || null,
            amenities: prop.propertyAmenities.map((pa: any) => ({
                id: pa.id,
                name: pa.amenityName,
                icon: pa.icon,
            })),
        }));
    }

    public async fetchPaginatedHotels(filters: HotelFilterQuery): Promise<IApiResponse<IProperties[]>> {
        try {
            const result = await this.hotelRepository.getPaginatedHotels(filters);
            const properties = this.formatProperties(result.properties);
            return paginatedSuccessResponse("Properties fetched successfully", properties, {

                currentPage: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                totalCount: result.pagination.totalCount,
                hasNextPage: result.pagination.currentPage < result.pagination.totalPages,
                hasPrevPage: result.pagination.currentPage > 1,
                limit: result.pagination.pageSize

            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch properties", error.message);
            }
            return errorResponse("Failed to fetch properties", "Unknown error");
        }
    }


    public async fetchAutocompleteLocations(filters: HotelFilterQuery): Promise<IApiResponse<IProperties[]>> {
        try {
            const result = await this.hotelRepository.getAutocompleteLocations(filters);
            const properties = this.formatProperties(result.properties);
            return paginatedSuccessResponse("Properties fetched successfully", properties,
                {
                    currentPage: result.pagination.currentPage,
                    totalPages: result.pagination.totalPages,
                    totalCount: result.pagination.totalCount,
                    hasNextPage: result.pagination.currentPage < result.pagination.totalPages,
                    hasPrevPage: result.pagination.currentPage > 1,
                    limit: result.pagination.pageSize
                });
        } catch (error: any) {
            console.error("Error in HotelService.fetchAutocompleteLocations", error);
            if (error instanceof Error) {
                return errorResponse("Failed to fetch autocomplete locations", error.message);
            }
            return errorResponse("Failed to fetch autocomplete locations", "Unknown error");
        }
    }
}
