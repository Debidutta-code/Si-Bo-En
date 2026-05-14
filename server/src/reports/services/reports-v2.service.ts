import { errorResponse, successResponse } from '../../utils/return';
import {
    CreationScopeResolver,
    ReportsV2Repository,
} from '../dao/reports-v2.dao';
import { ReportsV2ExcelService } from '.';

const XLSX_CONTENT_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export class ReportsV2Service {
    private dao: ReportsV2Repository;
    private xl: ReportsV2ExcelService;
    private scopeResolver: CreationScopeResolver;

    constructor() {
        this.dao = new ReportsV2Repository();
        this.xl = new ReportsV2ExcelService();
        this.scopeResolver = new CreationScopeResolver();
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

    // ── Report 1: Comparison ──────────────────────────────────────────────────
    public async generateComparison(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        groupBy?: 'day' | 'month' | 'year';
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

            const data = await this.dao.getComparisonData(
                propertyIds,
                params.startDate,
                params.endDate,
                params.groupBy || 'month'
            );
            const excel = await this.xl.generateComparison(data);

            return successResponse('Comparison report generated', {
                excel,
                fileName: `comparison-report-${params.startDate}-${params.endDate}.xlsx`,
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

    // ── Report 5: Top Properties ──────────────────────────────────────────────
    public async generateTopProperties(params: {
        creationId: string;
        startDate: string;
        endDate: string;
        sortBy?: 'revenue' | 'bookings' | 'nights';
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

            const reservations = await this.dao.getTopPropertiesData(
                propertyIds,
                params.startDate,
                params.endDate
            );
            const excel = await this.xl.generateTopProperties(
                reservations,
                params.sortBy || 'revenue'
            );

            return successResponse('Top properties report generated', {
                excel,
                fileName: `top-properties-${params.startDate}-${params.endDate}.xlsx`,
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
            const excel = await this.xl.generateAllReservations(
                reservations,
                propertyNames
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
                guestEmail: g.guestEmail,
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
