import { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { ReportsV2Service } from '../services/reports-v2.service';
import { GBPService } from '../services/gbp.service';
import { errorResponse, CustomRequest } from '../../utils';
import { ReportType } from '../interfaces/reports.type';
import { FilterOptionsInterceptor } from '../../multi-language/interceptors/reports/filter-options.interceptor';

export class ReportsController {
    private reportsService: ReportsService;
    private v2Service: ReportsV2Service;
    private gbpService: GBPService;

    constructor() {
        this.reportsService = new ReportsService();
        this.v2Service = new ReportsV2Service();
        this.gbpService = new GBPService();
    }

    private sendExcel(res: Response, result: any): void {
        if (result.success && result.data?.excel) {
            res.setHeader('Content-Type', result.data.contentType);
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${result.data.fileName}"`
            );
            res.send(result.data.excel);
            return;
        }
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    }

    private getCreationId(req: CustomRequest): string | null {
        return req.user?.creationId || null;
    }

    private getDateRange(req: CustomRequest): {
        startDate: string;
        endDate: string;
    } {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split('T')[0];
        return {
            startDate: (req.query.startDate as string) || firstDay,
            endDate: (req.query.endDate as string) || lastDay,
        };
    }

    public getBookingVoucher = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { bookingCode } = req.params;

            if (!bookingCode) {
                res.status(400).json(
                    errorResponse(
                        'Booking code is required',
                        'Missing booking code'
                    )
                );
                return;
            }

            const result =
                await this.reportsService.getBookingVoucher(bookingCode);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            if (!result.data.pdf || !Buffer.isBuffer(result.data.pdf)) {
                res.status(500).json(
                    errorResponse(
                        'Invalid PDF generated',
                        'PDF buffer is missing or invalid'
                    )
                );
                return;
            }

            res.setHeader('Content-Type', result.data.contentType);
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${result.data.fileName}"`
            );
            res.setHeader('Content-Length', result.data.pdf.length);

            res.send(result.data.pdf);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate booking voucher',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    public getBookingInvoice = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { bookingCode } = req.params;

            if (!bookingCode) {
                res.status(400).json(
                    errorResponse(
                        'Booking code is required',
                        'Missing booking code'
                    )
                );
                return;
            }

            const result =
                await this.reportsService.generateBookingInvoice(bookingCode);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            if (!result.data.pdf || !Buffer.isBuffer(result.data.pdf)) {
                res.status(500).json(
                    errorResponse(
                        'Invalid PDF generated',
                        'PDF buffer is missing or invalid'
                    )
                );
                return;
            }

            res.setHeader('Content-Type', result.data.contentType);
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${result.data.fileName}"`
            );
            res.setHeader('Content-Length', result.data.pdf.length);

            res.send(result.data.pdf);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate booking invoice',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    public generateV2Report = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const creationId = this.getCreationId(req);
            if (!creationId) {
                res.status(401).json(errorResponse('Unauthorized'));
                return;
            }

            const { reportType } = req.query;
            if (!reportType) {
                res.status(400).json(errorResponse('Report type is required'));
                return;
            }

            const { startDate, endDate } = this.getDateRange(req);
            const queryParams = req.query as Record<string, string>;
            const { propertyId, brandId, groupId } = queryParams;

            let result;

            switch (reportType) {
                case 'comparison':
                    result = await this.v2Service.generateComparison({
                        creationId,
                        comparisonType: (queryParams.comparisonType as 'date' | 'month' | 'year') || 'month',
                        selectedDate: queryParams.selectedDate || new Date().toISOString(),
                        targetCurrency: queryParams.targetCurrency || undefined,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'reservation-overview':
                    result = await this.v2Service.generateReservationOverview({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'revenue-analytics':
                    result = await this.v2Service.generateRevenueAnalytics({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'insights':
                    result = await this.v2Service.generateInsights({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'top-properties':
                    result = await this.v2Service.generateTopProperties({
                        creationId,
                        targetCurrency: queryParams.targetCurrency || undefined,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'all-reservations':
                    result = await this.v2Service.generateAllReservations({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                        targetCurrency: queryParams.targetCurrency || undefined,
                    });
                    break;
                case 'checkin-checkout':
                    result = await this.v2Service.generateCheckInOut({
                        creationId,
                        startDate,
                        endDate,
                        mode:
                            (queryParams.mode as 'checkin' | 'checkout') ||
                            'checkin',
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'status-breakdown':
                    result = await this.v2Service.generateStatusBreakdown({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                case 'loyalty-guests':
                    result = await this.v2Service.generateLoyaltyGuests({
                        creationId,
                        propertyId,
                        brandId,
                        groupId,
                        startDate,
                        endDate,
                    });
                    break;
                case 'payment-status':
                    result = await this.v2Service.generatePaymentStatus({
                        creationId,
                        startDate,
                        endDate,
                        propertyId,
                        brandId,
                        groupId,
                    });
                    break;
                default:
                    res.status(400).json(errorResponse('Invalid report type'));
                    return;
            }

            this.sendExcel(res, result);
        } catch (error) {
            res.status(500).json(errorResponse('Failed to generate report'));
        }
    };

    public getFilterOptions = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const creationId = this.getCreationId(req);
            if (!creationId) {
                res.status(401).json(errorResponse('Unauthorized'));
                return;
            }

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            let result = await this.gbpService.getFilterOptions(creationId);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            result = await FilterOptionsInterceptor.intercept(result, locale);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(
                errorResponse('Failed to fetch filter options')
            );
        }
    };
}
