import { AddonDateWiseDao } from '../repository/addonDateWise.repository';
import AddonRepository from '../repository/addon.repository';
import { IAddonAvailability, ICreateAddonAvailability } from '../interfaces';
import { IApiResponse } from '../../utils/return.types';
import { successResponse, errorResponse } from '../../utils/return';
import { getCurrencyConverter } from '../../currency-maping/utils';

export class AddonDateWiseService {
    private addonDateWiseDao: AddonDateWiseDao;

    constructor() {
        this.addonDateWiseDao = new AddonDateWiseDao();
    }

    /**
     * ✅ UPDATED: Upsert addon date-wise availability (bulk)
     */
    async createAddonDateWise(
        data: ICreateAddonAvailability[]
    ): Promise<IApiResponse> {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                return errorResponse(
                    'Input data must be a non-empty array',
                    'Invalid input'
                );
            }

            // Validate addon exists (check once per unique addonId)
            const uniqueAddonId = data[0].addonId;

            const addon = await AddonRepository.getAddonById(
                uniqueAddonId.toString()
            );
            if (!addon) {
                return errorResponse(`Addon not found `, 'Addon not found');
            }
            const { convert, baseCurrency } = await getCurrencyConverter(
                addon.propertyId,
                data[0].currencyCode ? data[0].currencyCode : 'AED'
            );

            const normalizedData = data.map(item => ({
                ...item,
                price: convert(item.price),
                currencyCode: baseCurrency,
            }));

            const result =
                await this.addonDateWiseDao.upsertAddonDateWiseWithMetadata(
                    normalizedData
                );

            return successResponse(
                'Addon date-wise availability saved successfully',
                {
                    total: result.records.length,
                    created: result.created,
                    updated: result.updated,
                    records: result.records,
                }
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to save addon date-wise availability',
                    error.message
                );
            }
            return errorResponse(
                'Failed to save addon date-wise availability',
                'Unknown error'
            );
        }
    }

    async getAddOnDateWiseById(addonId: string): Promise<IApiResponse> {
        try {
            const result =
                await this.addonDateWiseDao.getAddonDateWiseById(addonId);
            return successResponse(
                'Addon date-wise availability fetched successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get addon date-wise by ID',
                    error.message
                );
            }
            return errorResponse(
                'Failed to get addon date-wise by ID',
                'Unknown error'
            );
        }
    }

    /**
     * Update addon availability by addon ID (bulk update for all dates of an addon)
     */
    async updateAddonByAddonId(
        addonId: string,
        data: { price: number; currencyCode: string; isAvailable: boolean }
    ): Promise<IApiResponse> {
        try {
            // Check if addon exists
            const addon = await AddonRepository.getAddonById(addonId);
            if (!addon) {
                return errorResponse('Addon not found', 'Addon not found');
            }

            const result = await this.addonDateWiseDao.updateAddonByAddonId(
                addonId,
                data
            );

            return successResponse(
                'Addon availability updated successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update addon by addon ID',
                    error.message
                );
            }
            console.error(
                'Failed to update addon by addon ID at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to update addon by addon ID',
                'Unknown error'
            );
        }
    }

    /**
     * Update addon for a single date
     */
    async updateAddonForSingleDate(
        id: string,
        data: { price: number; currencyCode: string; isAvailable: boolean }
    ): Promise<IApiResponse> {
        try {
            const result = await this.addonDateWiseDao.updateAddonForSingleDate(
                id,
                data
            );

            if (!result) {
                return errorResponse(
                    'Addon date-wise record not found',
                    'Not Found'
                );
            }

            return successResponse(
                'Addon date-wise record updated successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update addon for single date',
                    error.message
                );
            }
            console.error(
                'Failed to update addon for single date at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to update addon for single date',
                'Unknown error'
            );
        }
    }

    /**
     * Delete addon by addon ID (bulk delete all dates for an addon)
     */
    async deleteAddonByAddonId(addonId: string): Promise<IApiResponse> {
        try {
            const result =
                await this.addonDateWiseDao.deleteAddonByAddonId(addonId);

            return successResponse(
                'Addon availability deleted successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete addon by addon ID',
                    error.message
                );
            }
            console.error(
                'Failed to delete addon by addon ID at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to delete addon by addon ID',
                'Unknown error'
            );
        }
    }

    /**
     * Delete addon for a particular date
     */
    async deleteAddonForParticularDate(id: string): Promise<IApiResponse> {
        try {
            const result =
                await this.addonDateWiseDao.deleteAddonForParticularDate(id);

            if (!result) {
                return errorResponse(
                    'Addon date-wise record not found',
                    'Not Found'
                );
            }

            return successResponse(
                'Addon date-wise record deleted successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete addon for particular date',
                    error.message
                );
            }
            console.error(
                'Failed to delete addon for particular date at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to delete addon for particular date',
                'Unknown error'
            );
        }
    }

    /**
     * Get addon availability for a property on a specific date
     */
    async getAddonsByDate(
        propertyId: string,
        dateStr: string
    ): Promise<IApiResponse> {
        try {
            if (!propertyId)
                return errorResponse('propertyId is required', 'Bad Request');
            const date = new Date(dateStr);
            const result = await AddonDateWiseDao.getAddonByDate(
                propertyId,
                date
            );
            return successResponse('Addons fetched successfully', result);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get addons by date',
                    error.message
                );
            }
            console.error(
                'Failed to get addons by date at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to get addons by date',
                'Unknown error'
            );
        }
    }

    /**
     * Get available addons for a property within a date range
     */
    async getAvailableAddonsByDateRange(
        propertyId: string,
        startDateStr: string,
        endDateStr: string,
        ratePlanCode: string
    ): Promise<IApiResponse> {
        try {
            if (!propertyId) {
                return errorResponse('Property ID is required', 'Bad Request');
            }
            if (!startDateStr) {
                return errorResponse('Start date is required', 'Bad Request');
            }
            if (!endDateStr) {
                return errorResponse('End date is required', 'Bad Request');
            }
            if (!ratePlanCode) {
                return errorResponse(
                    'Rate plan code is required',
                    'Bad Request'
                );
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            // Validate dates
            if (isNaN(startDate.getTime())) {
                return errorResponse(
                    'Invalid start date format',
                    'Bad Request'
                );
            }
            if (isNaN(endDate.getTime())) {
                return errorResponse('Invalid end date format', 'Bad Request');
            }
            if (startDate > endDate) {
                return errorResponse(
                    'Start date must be before or equal to end date',
                    'Bad Request'
                );
            }

            const result = await AddonDateWiseDao.getAvailableAddonsByDateRange(
                propertyId,
                startDate,
                endDate,
                ratePlanCode
            );

            return successResponse(
                'Available addons fetched successfully',
                result
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get available addons',
                    error.message
                );
            }
            console.error(
                'Failed to get available addons at Service Layer:',
                error
            );
            return errorResponse(
                'Failed to get available addons',
                'Unknown error'
            );
        }
    }
}
