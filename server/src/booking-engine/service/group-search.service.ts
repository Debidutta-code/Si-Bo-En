// group-search.service.ts

import { IApiResponse, successResponse, errorResponse } from '../../utils';
import { GroupSearchRepository } from '../repository';
import {
    IBrandSummary,
    IGroupSearchQuery,
    IPropertyDetails,
    IPropertyWithBasePrice,
} from '../types';
import { RoomBookingService } from './room.service';

export class GroupSearchService {
    private groupSearchRepository: GroupSearchRepository;

    constructor() {
        this.groupSearchRepository = new GroupSearchRepository();
    }

    // ── shared helpers ──────────────────────────────────────────────────

    private async getBasePrice(
        propertyCode: string,
        query: IGroupSearchQuery
    ): Promise<{ basePrice: number; currencyCode: string } | null> {
        const result = await RoomBookingService.fetchRooms({
            propertyCode,
            startDate: query.startDate,
            endDate: query.endDate,
            guests: query.guests,
        });

        if (!result.success || !result.data) return null;

        const validRooms = result.data.rooms.filter((r: any) => r.hasValidRate);
        if (validRooms.length === 0) return null;

        const allPrices = validRooms.flatMap((r: any) => r.roomPrice ?? []);
        if (allPrices.length === 0) return null;

        const lowest = allPrices.reduce((min: any, curr: any) =>
            curr.totalAmount < min.totalAmount ? curr : min
        );

        return {
            basePrice: lowest.totalAmount,
            currencyCode: lowest.currencyCode,
        };
    }

    private async filterAvailableProperties(
        properties: IPropertyDetails[],
        query: IGroupSearchQuery
    ): Promise<IPropertyWithBasePrice[]> {
        const results = await Promise.all(
            properties.map(async property => {
                const priceData = await this.getBasePrice(
                    property.propertyCode,
                    query
                );
                if (!priceData) return null;
                return { ...property, ...priceData };
            })
        );
        return results.filter((r): r is IPropertyWithBasePrice => r !== null);
    }

    private async resolveGroupPropertyCreationIds(
        groupId: string
    ): Promise<string[]> {
        const group =
            await this.groupSearchRepository.getGroupChildrens(groupId);
        if (!group) return [];

        const directIds = group.groupChildren
            .filter(c => c.type === 'property')
            .map(c => c.id);

        const brandIds = group.groupChildren
            .filter(c => c.type === 'brand')
            .map(c => c.id);

        let brandPropertyIds: string[] = [];
        if (brandIds.length > 0) {
            const brands =
                await this.groupSearchRepository.getBrandChildrens(brandIds);
            brandPropertyIds = brands.flatMap(b =>
                b.brandChildren
                    .filter(c => c.type === 'property')
                    .map(c => c.id)
            );
        }

        return [...directIds, ...brandPropertyIds];
    }

    // ── API 1: all properties under a group ────────────────────────────

    public async getPropertiesByGroup(
        groupId: string,
        query: IGroupSearchQuery
    ): Promise<IApiResponse<IPropertyWithBasePrice[]>> {
        try {
            const creationIds =
                await this.resolveGroupPropertyCreationIds(groupId);

            if (creationIds.length === 0) {
                return successResponse(
                    'No properties found for this group',
                    []
                );
            }

            const properties =
                await this.groupSearchRepository.getPropertyDetails(
                    creationIds,
                    query.city
                );

            if (properties.length === 0) {
                return errorResponse(
                    'No properties available in this city',
                    `No properties found${query.city ? ` in ${query.city}` : ''} for this group`
                );
            }

            const available = await this.filterAvailableProperties(
                properties,
                query
            );

            if (available.length === 0) {
                return errorResponse(
                    'Rooms not available for the selected date range',
                    `Properties found but no rooms available from ${query.startDate} to ${query.endDate}`
                );
            }

            return successResponse(
                'Properties retrieved successfully',
                available
            );
        } catch (error) {
            return error instanceof Error
                ? errorResponse('Failed to retrieve properties', error.message)
                : errorResponse(
                      'Failed to retrieve properties',
                      'Unknown error'
                  );
        }
    }

    // ── API 2: brands under a group ────────────────────────────────────

    public async getBrandsByGroup(
        groupId: string
    ): Promise<IApiResponse<IBrandSummary[]>> {
        try {
            const group =
                await this.groupSearchRepository.getGroupChildrens(groupId);

            if (!group) {
                return successResponse('No brands found for this group', []);
            }

            const brandIds = group.groupChildren
                .filter(c => c.type === 'brand')
                .map(c => c.id);

            if (brandIds.length === 0) {
                return successResponse('No brands found for this group', []);
            }

            const brandNames =
                await this.groupSearchRepository.getBrandNames(brandIds);

            const brands: IBrandSummary[] = brandNames.map(b => ({
                brandId: b.id,
                brandName: b.name,
            }));

            return successResponse('Brands retrieved successfully', brands);
        } catch (error) {
            return error instanceof Error
                ? errorResponse('Failed to retrieve brands', error.message)
                : errorResponse('Failed to retrieve brands', 'Unknown error');
        }
    }

    // ── API 3: properties under a specific brand ───────────────────────

    public async getPropertiesByBrand(
        brandId: string,
        query: IGroupSearchQuery
    ): Promise<IApiResponse<IPropertyWithBasePrice[]>> {
        try {
            const creationIds =
                await this.groupSearchRepository.getPropertyCreationIdsByBrand(
                    brandId
                );

            if (creationIds.length === 0) {
                return successResponse(
                    'No properties found for this brand',
                    []
                );
            }

            const properties =
                await this.groupSearchRepository.getPropertyDetails(
                    creationIds,
                    query.city
                );

            if (properties.length === 0) {
                return errorResponse(
                    'No properties available in this city',
                    `No properties found${query.city ? ` in ${query.city}` : ''} for this brand`
                );
            }

            const available = await this.filterAvailableProperties(
                properties,
                query
            );

            if (available.length === 0) {
                return errorResponse(
                    'Rooms not available for the selected date range',
                    `Properties found but no rooms available from ${query.startDate} to ${query.endDate}`
                );
            }

            return successResponse(
                'Properties retrieved successfully',
                available
            );
        } catch (error) {
            return error instanceof Error
                ? errorResponse('Failed to retrieve properties', error.message)
                : errorResponse(
                      'Failed to retrieve properties',
                      'Unknown error'
                  );
        }
    }
}
