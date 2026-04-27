import ExcelJS from 'exceljs';
import {
    IArrivalReport,
    IDepartureReport,
} from '../interfaces';
import { IGuestReport, IReservationReport, ReportType } from '../interfaces/reports.type';

export class ExcelExportService {
    /**
     * Main method to generate Excel based on report type
     */
    public async generateExcelReport(
        reportType: ReportType,
        reportData: any,
        propertyName: string,
        dateRange: { startDate: string; endDate: string }
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        switch (reportType) {
            case ReportType.GUEST:
                await this.generateGuestExcel(
                    workbook,
                    reportData as IGuestReport,
                    propertyName,
                    dateRange
                );
                break;
            case ReportType.RESERVATION:
                await this.generateReservationExcel(
                    workbook,
                    reportData as IReservationReport,
                    propertyName,
                    dateRange
                );
                break;
            case ReportType.ARRIVAL:
                await this.generateArrivalExcel(
                    workbook,
                    reportData as IArrivalReport,
                    propertyName,
                    dateRange
                );
                break;
            case ReportType.DEPARTURE:
                await this.generateDepartureExcel(
                    workbook,
                    reportData as IDepartureReport,
                    propertyName,
                    dateRange
                );
                break;
            default:
                throw new Error('Invalid report type for Excel generation');
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Helper: Add report header
     */
    private addReportHeader(
        worksheet: ExcelJS.Worksheet,
        propertyName: string,
        reportTitle: string,
        dateRange?: { startDate: string; endDate: string }
    ) {
        // Property Name
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = propertyName;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Report Title
        worksheet.mergeCells('A2:F2');
        const reportTitleCell = worksheet.getCell('A2');
        reportTitleCell.value = reportTitle;
        reportTitleCell.font = { bold: true, size: 12 };
        reportTitleCell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };

        // Date Range (if provided)
        if (dateRange) {
            worksheet.mergeCells('A3:F3');
            const dateCell = worksheet.getCell('A3');
            const startDate = new Date(dateRange.startDate).toLocaleDateString(
                'en-GB'
            );
            const endDate = new Date(dateRange.endDate).toLocaleDateString(
                'en-GB'
            );
            dateCell.value = `From: ${startDate} To: ${endDate}`;
            dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Empty row
        worksheet.addRow([]);
    }

    /**
     * Helper: Style header row
     */
    private styleHeaderRow(row: ExcelJS.Row) {
        row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        row.alignment = { horizontal: 'center', vertical: 'middle' };
        row.height = 20;
    }

    /**
     * Helper: Add borders to range
     */
    private addBorders(
        worksheet: ExcelJS.Worksheet,
        startRow: number,
        endRow: number,
        startCol: number,
        endCol: number
    ) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = worksheet.getCell(row, col);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            }
        }
    }

    /**
     * Guest Report Excel
     */
    private async generateGuestExcel(
        workbook: ExcelJS.Workbook,
        data: IGuestReport,
        propertyName: string,
        dateRange: { startDate: string; endDate: string }
    ) {
        const worksheet = workbook.addWorksheet('Guest Report');
        this.addReportHeader(
            worksheet,
            propertyName,
            'Guest Report',
            dateRange
        );

        // Summary
        worksheet.addRow(['Total Guests', data.totalGuests]);
        worksheet.addRow([]);

        // Guest Details
        const headerRow = worksheet.addRow([
            'Guest ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone Number',
            'User Type',
            'Total Reservations',
            'Total Spent',
            'Last Visit',
        ]);
        this.styleHeaderRow(headerRow);

        const startRow = worksheet.lastRow!.number + 1;

        data.guests.forEach(guest => {
            worksheet.addRow([
                guest.id,
                guest.firstName,
                guest.lastName,
                guest.email || 'N/A',
                guest.phoneNumber || 'N/A',
                guest.userType,
                guest.totalReservations,
                guest.totalSpent.toFixed(2),
                guest.lastVisit
                    ? new Date(guest.lastVisit).toLocaleDateString('en-GB')
                    : 'N/A',
            ]);
        });

        const endRow = worksheet.lastRow!.number;

        worksheet.columns = [
            { width: 25 },
            { width: 15 },
            { width: 15 },
            { width: 25 },
            { width: 15 },
            { width: 12 },
            { width: 18 },
            { width: 15 },
            { width: 15 },
        ];

        this.addBorders(worksheet, startRow - 1, endRow, 1, 9);
    }

    /**
     * Reservation Report Excel
     */
    private async generateReservationExcel(
        workbook: ExcelJS.Workbook,
        data: IReservationReport,
        propertyName: string,
        dateRange: { startDate: string; endDate: string }
    ) {
        const worksheet = workbook.addWorksheet('Reservation Report');
        this.addReportHeader(
            worksheet,
            propertyName,
            'Reservation Report',
            dateRange
        );

        // Summary
        worksheet.addRow(['Total Reservations', data.totalReservations]);
        worksheet.addRow([
            'Confirmed Reservations',
            data.summary.confirmedReservations,
        ]);
        worksheet.addRow([
            'Pending Reservations',
            data.summary.pendingReservations,
        ]);
        worksheet.addRow([
            'Cancelled Reservations',
            data.summary.cancelledReservations,
        ]);
        worksheet.addRow([
            'Total Revenue',
            data.summary.totalRevenue.toFixed(2),
        ]);
        worksheet.addRow(['Total Paid', data.summary.totalPaid.toFixed(2)]);
        worksheet.addRow([
            'Total Outstanding',
            data.summary.totalOutstanding.toFixed(2),
        ]);
        worksheet.addRow([]);

        // Reservation Details
        const headerRow = worksheet.addRow([
            'Booking Code',
            'Guest Name',
            'Email',
            'Phone',
            'Status',
            'Check-In',
            'Check-Out',
            'Nights',
            'Guests',
            'Room Type',
            'Rate Plan',
            'Amount',
            'Paid',
            'Balance',
            'Source',
            'Booked At',
        ]);
        this.styleHeaderRow(headerRow);

        const startRow = worksheet.lastRow!.number + 1;

        data.reservations.forEach(reservation => {
            const balance = reservation.amount - reservation.paidAmount;
            worksheet.addRow([
                reservation.bookingCode,
                reservation.primaryGuestName,
                reservation.primaryGuestEmail || 'N/A',
                reservation.primaryGuestPhone || 'N/A',
                reservation.bookingStatus,
                new Date(reservation.checkInDate).toLocaleDateString('en-GB'),
                new Date(reservation.checkOutDate).toLocaleDateString('en-GB'),
                reservation.numberOfNights,
                reservation.numberOfGuests,
                reservation.roomTypeCode || 'N/A',
                reservation.ratePlanCode || 'N/A',
                reservation.amount.toFixed(2),
                reservation.paidAmount.toFixed(2),
                balance.toFixed(2),
                reservation.bookingSource,
                new Date(reservation.bookedAt).toLocaleString('en-GB'),
            ]);
        });

        const endRow = worksheet.lastRow!.number;

        worksheet.columns = [
            { width: 15 },
            { width: 20 },
            { width: 25 },
            { width: 15 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 8 },
            { width: 8 },
            { width: 15 },
            { width: 15 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 20 },
        ];

        this.addBorders(worksheet, startRow - 1, endRow, 1, 16);
    }

    /**
     * Arrival Report Excel
     */
    private async generateArrivalExcel(
        workbook: ExcelJS.Workbook,
        data: IArrivalReport,
        propertyName: string,
        dateRange: { startDate: string; endDate: string }
    ) {
        const worksheet = workbook.addWorksheet('Arrival Report');
        this.addReportHeader(
            worksheet,
            propertyName,
            'Arrival Report',
            dateRange
        );

        worksheet.addRow(['Total Arrivals', data.totalArrivals]);
        worksheet.addRow([]);

        const headerRow = worksheet.addRow([
            'Booking Code',
            'Guest Name',
            'Email',
            'Phone',
            'Status',
            'Arrival Date',
            'Departure Date',
            'Nights',
            'Guests',
            'Room Type',
            'Rate Plan',
            'Total Amount',
        ]);
        this.styleHeaderRow(headerRow);

        const startRow = worksheet.lastRow!.number + 1;

        data.arrivals.forEach(arrival => {
            worksheet.addRow([
                arrival.bookingCode,
                arrival.primaryGuestName,
                arrival.primaryGuestEmail || 'N/A',
                arrival.primaryGuestPhone || 'N/A',
                arrival.bookingStatus,
                new Date(arrival.checkInDate).toLocaleDateString('en-GB'),
                new Date(arrival.checkOutDate).toLocaleDateString('en-GB'),
                arrival.numberOfNights,
                arrival.numberOfGuests,
                arrival.roomTypeCode || 'N/A',
                arrival.ratePlanCode || 'N/A',
                arrival.amount.toFixed(2),
            ]);
        });

        const endRow = worksheet.lastRow!.number;

        worksheet.columns = [
            { width: 15 },
            { width: 20 },
            { width: 25 },
            { width: 15 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 8 },
            { width: 8 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
        ];

        this.addBorders(worksheet, startRow - 1, endRow, 1, 12);
    }

    /**
     * Departure Report Excel
     */
    private async generateDepartureExcel(
        workbook: ExcelJS.Workbook,
        data: IDepartureReport,
        propertyName: string,
        dateRange: { startDate: string; endDate: string }
    ) {
        const worksheet = workbook.addWorksheet('Departure Report');
        this.addReportHeader(
            worksheet,
            propertyName,
            'Departure Report',
            dateRange
        );

        worksheet.addRow(['Total Departures', data.totalDepartures]);
        worksheet.addRow([]);

        const headerRow = worksheet.addRow([
            'Booking Code',
            'Guest Name',
            'Email',
            'Phone',
            'Status',
            'Arrival Date',
            'Departure Date',
            'Nights',
            'Guests',
            'Room Type',
            'Rate Plan',
            'Amount',
            'Paid',
            'Balance',
        ]);
        this.styleHeaderRow(headerRow);

        const startRow = worksheet.lastRow!.number + 1;

        data.departures.forEach(departure => {
            const balance = departure.amount - departure.paidAmount;
            worksheet.addRow([
                departure.bookingCode,
                departure.primaryGuestName,
                departure.primaryGuestEmail || 'N/A',
                departure.primaryGuestPhone || 'N/A',
                departure.bookingStatus,
                new Date(departure.checkInDate).toLocaleDateString('en-GB'),
                new Date(departure.checkOutDate).toLocaleDateString('en-GB'),
                departure.numberOfNights,
                departure.numberOfGuests,
                departure.roomTypeCode || 'N/A',
                departure.ratePlanCode || 'N/A',
                departure.amount.toFixed(2),
                departure.paidAmount.toFixed(2),
                balance.toFixed(2),
            ]);
        });

        const endRow = worksheet.lastRow!.number;

        worksheet.columns = [
            { width: 15 },
            { width: 20 },
            { width: 25 },
            { width: 15 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 8 },
            { width: 8 },
            { width: 15 },
            { width: 15 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
        ];

        this.addBorders(worksheet, startRow - 1, endRow, 1, 14);
    }

    /**
     * Generate filename based on report type
     */
    public generateFileName(
        reportType: ReportType,
        propertyCode: string
    ): string {
        const date = new Date().toISOString().split('T')[0];
        return `${reportType}-${propertyCode}-${date}.xlsx`;
    }
}