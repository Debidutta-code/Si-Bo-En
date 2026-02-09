import { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { errorResponse } from '../../../../utils/return';
import { CustomRequest } from '../../../../utils/customRequest';
import { ReportType } from '../interfaces/reports.type';

export class ReportsController {
    private reportsService: ReportsService;

    constructor() {
        this.reportsService = new ReportsService();
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

    public getReportTypes = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const reportTypes = [
                {
                    type: ReportType.GUEST,
                    name: 'Guest Report',
                    description: 'List of all guests with their booking history',
                },
                {
                    type: ReportType.RESERVATION,
                    name: 'Reservation Report',
                    description:
                        'Detailed report of all reservations with status',
                },
                {
                    type: ReportType.ARRIVAL,
                    name: 'Arrival Report',
                    description: 'Expected arrivals for selected date range',
                },
                {
                    type: ReportType.DEPARTURE,
                    name: 'Departure Report',
                    description: 'Expected departures for selected date range',
                },
            ];

            res.status(200).json({
                success: true,
                data: reportTypes,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch report types',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    public generatePropertyReport = async (
        req: CustomRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { propertyId } = req.params;
            const { reportType, startDate, endDate } = req.query;

            if (!propertyId) {
                res.status(400).json(errorResponse('Property ID is required'));
                return;
            }

            if (!reportType) {
                res.status(400).json(errorResponse('Report type is required'));
                return;
            }

            if (
                !Object.values(ReportType).includes(reportType as ReportType)
            ) {
                res.status(400).json(errorResponse('Invalid report type'));
                return;
            }

            const result = await this.reportsService.generatePropertyReport({
                propertyId,
                reportType: reportType as ReportType,
                startDate: startDate as string,
                endDate: endDate as string,
            });

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            if (!result.data.file || !Buffer.isBuffer(result.data.file)) {
                res.status(500).json(
                    errorResponse(
                        'Invalid Excel file generated',
                        'Excel buffer is missing or invalid'
                    )
                );
                return;
            }

            res.setHeader('Content-Type', result.data.contentType);
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${result.data.fileName}"`
            );
            res.setHeader('Content-Length', result.data.file.length);

            res.send(result.data.file);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate property report',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}