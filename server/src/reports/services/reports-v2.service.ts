import { errorResponse, successResponse } from '../../utils/return';
import {
    CreationScopeResolver,
    ReportsV2Repository,
} from '../dao/reports-v2.dao';
import { ReportsV2ExcelService } from '.';
import { convertCurrency } from '../../currency-maping/utils/currency-exchnage.utils';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import { DashBoardRepository } from '../../dashboard/repository/dash.repository';
import { IPropertyCodeAndIds } from '../../dashboard/types';

const XLSX_CONTENT_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export class ReportsV2Service {
    private dao: ReportsV2Repository;
    private xl: ReportsV2ExcelService;
    private scopeResolver: CreationScopeResolver;
    private dashRepo: DashBoardRepository;

    constructor() {
        this.dao = new ReportsV2Repository();
        this.xl = new ReportsV2ExcelService();
        this.scopeResolver = new CreationScopeResolver();
        this.dashRepo = new DashBoardRepository();
    }

    private async resolveScope(
        creationId: string,
        overridePropertyId?: string,
        overrideBrandId?: string,
        overrideGroupId?: string
    ): Promise<string[]> {
        return this.scopeResolver.resolvePropertyIds(
            creationId,
            overridePropertyId,
            overrideBrandId,
            overrideGroupId
        );
    }

    /**
     * Builds a multiplier map: nativeCurrency → factor to reach targetCurrency.
     * Fetches exchange rates only once per unique currency to avoid N*Redis-round-trips.
     */
    private async buildRateMap(
        reservations: any[],
        targetCurrency: string
    ): Promise<Map<string, number>> {
        const uniqueCurrencies = new Set<string>();
        for (const r of reservations) {
            const c = r.PricingBrakeDown?.currencyCode || r.currencyCode;
            if (c) uniqueCurrencies.add(c);
        }

        const rateMap = new Map<string, number>();
        await Promise.all(
            [...uniqueCurrencies].map(async (from) => {
                try {
                    // Convert 1 unit → get the multiplier
                    const converted = await convertCurrency(
                        1,
                        from as CurrencyCode,
                        targetCurrency as CurrencyCode
                    );
                    rateMap.set(from, converted);
                } catch {
                    // If rate missing, fall back to 1 (native amount, no conversion)
                    rateMap.set(from, 1);
                }
            })
        );
        return rateMap;
    }

    // ── Report 1: Comparison ────────────────────────────────────────────
    /**
     * Uses the dashboard’s getStatisticsComparison to produce a
     * current-vs-previous-period comparison report (date / month / year).
     */
    public async generateComparison(params: {
        creationId: string;
        comparisonType?: 'date' | 'month' | 'year';
        selectedDate?: string;   // ISO date string; defaults to today
        targetCurrency?: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const comparisonType = params.comparisonType || 'month';
            const selectedDate = params.selectedDate
                ? new Date(params.selectedDate)
                : new Date();
            const currency = (params.targetCurrency || 'USD') as CurrencyCode;

            const data = await this.dashRepo.getStatisticsComparison(
                propertyIds,
                comparisonType,
                selectedDate,
                currency
            );

            const excel = await this.xl.generateComparison(data);

            const label = selectedDate.toISOString().split('T')[0];
            return successResponse('Comparison report generated', {
                excel,
                fileName: `comparison-${comparisonType}-${label}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate comparison report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 2: Reservation Overview ───────────────────────────────────────
    public async generateReservationOverview(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getReservationOverview(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generateReservationOverview(
                reservations,
                propertyNames
            );

            return successResponse('Reservation overview generated', {
                excel,
                fileName: `reservation-overview-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate reservation overview',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 3: Revenue Analytics ──────────────────────────────────────────
    public async generateRevenueAnalytics(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getRevenueAnalytics(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generateRevenueAnalytics(
                reservations,
                propertyNames
            );

            return successResponse('Revenue analytics generated', {
                excel,
                fileName: `revenue-analytics-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate revenue analytics',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 4: Insights ────────────────────────────────────────────────────
    public async generateInsights(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getInsightsData(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generateInsights(
                reservations,
                propertyNames
            );

            return successResponse('Insights report generated', {
                excel,
                fileName: `insights-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate insights report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 5: Top Properties ────────────────────────────────────────────
    /**
     * Uses the dashboard’s getTopPerformingProperties to produce a report
     * with three dimensions: By Revenue, By Bookings, and By Occupancy.
     */
    public async generateTopProperties(params: {
        creationId: string;
        targetCurrency?: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            // Build IPropertyCodeAndIds[] directly from DB records
            const propertyIdsAndCodes: IPropertyCodeAndIds[] = await this.dao.getPropertyCodesAndNames(propertyIds);

            const currency = (params.targetCurrency || 'USD') as CurrencyCode;
            const data = await this.dashRepo.getTopPerformingProperties(
                propertyIdsAndCodes,
                currency
            );

            const excel = await this.xl.generateTopProperties(data, currency);

            return successResponse('Top properties report generated', {
                excel,
                fileName: `top-properties-${new Date().toISOString().split('T')[0]}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate top properties report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 6: All Reservations ────────────────────────────────────────────
    public async generateAllReservations(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
        targetCurrency?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getAllReservations(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);

            // Build conversion rate map if a target currency was requested
            let rateMap: Map<string, number> | undefined;
            if (params.targetCurrency) {
                rateMap = await this.buildRateMap(reservations, params.targetCurrency);
            }

            const excel = await this.xl.generateAllReservations(
                reservations,
                propertyNames,
                params.targetCurrency
                    ? { targetCurrency: params.targetCurrency, rateMap: rateMap! }
                    : undefined
            );

            return successResponse('All reservations report generated', {
                excel,
                fileName: `all-reservations-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate all reservations report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 7: Check-In / Check-Out ───────────────────────────────────────
    public async generateCheckInOut(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        mode?: 'checkin' | 'checkout';
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const mode = params.mode || 'checkin';
            const reservations = await this.dao.getCheckInOutData(
                propertyIds,
                params.startDate,
                params.endDate,
                mode
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generateCheckInOut(
                reservations,
                mode,
                propertyNames
            );

            return successResponse('Check-in/out report generated', {
                excel,
                fileName: `${mode}-report-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate check-in/out report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 8: Status Breakdown ────────────────────────────────────────────
    public async generateStatusBreakdown(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getStatusBreakdown(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generateStatusBreakdown(
                reservations,
                propertyNames
            );

            return successResponse('Status breakdown generated', {
                excel,
                fileName: `status-breakdown-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate status breakdown',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 9: Loyalty Guests ──────────────────────────────────────────────
    public async generateLoyaltyGuests(params: {
        creationId: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const guests = await this.dao.getLoyaltyGuests(propertyIds);

            // Build cross-property spend map: for each loyalty guest collect
            // their email + all enrolled property IDs, then aggregate spend
            const spendInput = guests.map((g: any) => ({
                email: g.email,
                enrolledPropertyIds: (g.PropertyLoyalityGuests ?? []).map(
                    (plg: any) => plg.PropertyLoyalityConfig?.propertyId
                ).filter(Boolean),
            }));
            const spendMap = await this.dao.getLoyaltyGuestSpendMap(spendInput);

            const excel = await this.xl.generateLoyaltyGuests(guests, spendMap);

            return successResponse('Loyalty guest report generated', {
                excel,
                fileName: `loyalty-guests-${new Date().toISOString().split('T')[0]}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate loyalty guest report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // ── Report 10: Payment Status ──────────────────────────────────────────────
    public async generatePaymentStatus(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        propertyId?: string;
        brandId?: string;
        groupId?: string;
    }) {
        try {
            const propertyIds = await this.resolveScope(
                params.creationId,
                params.propertyId,
                params.brandId,
                params.groupId
            );
            if (!propertyIds.length)
                return errorResponse('No properties found for your account');

            const reservations = await this.dao.getPaymentStatus(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const propertyNames = await this.dao.getPropertyNames(propertyIds);
            const excel = await this.xl.generatePaymentStatus(
                reservations,
                propertyNames
            );

            return successResponse('Payment status report generated', {
                excel,
                fileName: `payment-status-${params.startDate}-${params.endDate}.xlsx`,
                contentType: XLSX_CONTENT_TYPE,
            });
        } catch (error) {
            return errorResponse(
                'Failed to generate payment status report',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }
}
