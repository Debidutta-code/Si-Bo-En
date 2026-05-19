import ExcelJS from 'exceljs';

export class ReportsV2ExcelService {
    private readonly HEADER_COLOR = 'FF1E3A5F';
    private readonly ALT_ROW_COLOR = 'FFF0F4FF';

    private styleHeader(row: ExcelJS.Row, cols: number) {
        row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.HEADER_COLOR },
        };
        row.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
        };
        row.height = 22;
    }

    private styleAltRows(
        worksheet: ExcelJS.Worksheet,
        startRow: number,
        cols: number
    ) {
        worksheet.eachRow((row, rowNum) => {
            if (rowNum >= startRow && (rowNum - startRow) % 2 === 1) {
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: this.ALT_ROW_COLOR },
                    };
                });
            }
        });
    }

    private addBorders(
        ws: ExcelJS.Worksheet,
        startRow: number,
        endRow: number,
        cols: number
    ) {
        for (let r = startRow; r <= endRow; r++) {
            for (let c = 1; c <= cols; c++) {
                ws.getCell(r, c).border = {
                    top: { style: 'thin', color: { argb: 'FFD0D7E2' } },
                    left: { style: 'thin', color: { argb: 'FFD0D7E2' } },
                    bottom: { style: 'thin', color: { argb: 'FFD0D7E2' } },
                    right: { style: 'thin', color: { argb: 'FFD0D7E2' } },
                };
            }
        }
    }

    private addTitle(
        ws: ExcelJS.Worksheet,
        title: string,
        subtitle: string,
        cols: number
    ) {
        ws.mergeCells(1, 1, 1, cols);
        const t = ws.getCell('A1');
        t.value = title;
        t.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
        t.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 28;

        ws.mergeCells(2, 1, 2, cols);
        const s = ws.getCell('A2');
        s.value = subtitle;
        s.font = { size: 10, color: { argb: 'FF666666' } };
        s.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(2).height = 18;

        ws.addRow([]);
    }

    private fmtDate(d: any): string {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-GB');
    }

    private fmtNum(n: any): string {
        return Number(n || 0).toFixed(2);
    }

    private roomNights(start: any, end: any): number {
        if (!start || !end) return 0;
        return Math.max(
            0,
            Math.ceil(
                (new Date(end).getTime() - new Date(start).getTime()) / 86400000
            )
        );
    }

    // ── Report 1: Comparison ──────────────────────────────────────────────────
    public async generateComparison(data: any): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Comparison Report');
        const cols = 7;
        this.addTitle(
            ws,
            'Comparison Report',
            `Period: ${this.fmtDate(data.start)} – ${this.fmtDate(data.end)} | Group By: ${data.groupBy}`,
            cols
        );

        const grouped = new Map<string, any[]>();
        for (const r of data.reservations) {
            const d = new Date(r.reservationStartDate);
            let key: string;
            if (data.groupBy === 'day') key = d.toLocaleDateString('en-GB');
            else if (data.groupBy === 'month')
                key = `${d.getMonth() + 1}/${d.getFullYear()}`;
            else key = String(d.getFullYear());
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(r);
        }

        const hdr = ws.addRow([
            'Period',
            'Total Bookings',
            'Revenue',
            'Avg. Booking Value',
            'Cancellation Rate',
            'Room Nights',
            'Properties',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 18 },
            { width: 16 },
            { width: 16 },
            { width: 20 },
            { width: 18 },
            { width: 14 },
            { width: 20 },
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const [period, rows] of grouped) {
            const total = rows.length;
            const revenue = rows
                .filter(r => r.bookingStatus !== 'cancelled')
                .reduce((s, r) => s + Number(r.amount), 0);
            const cancelled = rows.filter(
                r => r.bookingStatus === 'cancelled'
            ).length;
            const avgVal = total > 0 ? revenue / total : 0;
            const cancelRate =
                total > 0 ? ((cancelled / total) * 100).toFixed(1) + '%' : '0%';
            const nights = rows.reduce(
                (s, r) =>
                    s +
                    this.roomNights(
                        r.reservationStartDate,
                        r.reservationEndDate
                    ),
                0
            );
            const props = [...new Set(rows.map(r => r.hotelName))].join(', ');
            ws.addRow([
                period,
                total,
                this.fmtNum(revenue),
                this.fmtNum(avgVal),
                cancelRate,
                nights,
                props,
            ]);
        }

        const endRow = ws.lastRow!.number;
        this.addBorders(ws, startRow - 1, endRow, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }


    // ─── GENERATOR ───────────────────────────────────────────────────────────────
    public async generateReservationOverview(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Reservation Overview');
        const cols = 17;

        this.addTitle(
            ws,
            'Reservation Overview Report',
            `Total: ${reservations.length} reservations`,
            cols
        );

        const hdr = ws.addRow([
            'Booking Code',
            'Property',
            'Guest Name',
            'Email',
            'Phone',
            'Room Type',
            'Rate Plan',
            'Check-In',
            'Check-Out',
            'Nights',
            'Currency',
            'Amount Before Tax',
            'Tax Amount',
            'AmountAfterTax',
            'Total Amount',
            'Chargeable Amount',
            'Later Payable',
            'Status',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 16 },  //  1 Booking Code
            { width: 22 },  //  2 Property
            { width: 20 },  //  3 Guest Name
            { width: 24 },  //  4 Email
            { width: 15 },  //  5 Phone
            { width: 14 },  //  6 Room Type
            { width: 16 },  //  7 Rate Plan
            { width: 12 },  //  8 Check-In
            { width: 12 },  //  9 Check-Out
            { width: 8 },  // 10 Nights
            { width: 10 },  // 11 Currency
            { width: 16 },
            { width: 16 },// 12 Amount Before Tax
            { width: 14 },  // 13 Tax Amount
            { width: 14 },  // 14 Total Amount
            { width: 16 },  // 15 Chargeable Amount
            { width: 14 },  // 16 Later Payable
            { width: 14 },  // 17 Status
        ];

        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            const pb = r.PricingBrakeDown;

            const amountBeforeTax = Number(pb?.amountBeforeTax ?? 0);
            const taxedAmount = Number(pb?.taxedAmount ?? 0);
            const totalAmount = Number( r.amount ?? 0);
            const chargeableAmount = Number(pb?.currentChargeableAmount ?? 0);
            const laterPayable = Number(pb?.latterpayableAmount ?? 0);

            ws.addRow([
                r.bookingCode?.split('-').slice(1).join('-') ?? r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.primaryGuest
                    ? `${r.primaryGuest.firstName ?? ''} ${r.primaryGuest.lastName ?? ''}`.trim()
                    : 'N/A',
                r.primaryGuest?.email || 'N/A',
                r.primaryGuest?.phoneNumber || 'N/A',
                r.roomTypeCode || 'N/A',
                r.ratePlanName || r.ratePlanCode || 'N/A',
                this.fmtDate(r.reservationStartDate),
                this.fmtDate(r.reservationEndDate),
                this.roomNights(r.reservationStartDate, r.reservationEndDate),
                r.currencyCode || pb?.currencyCode || 'N/A',
                this.fmtNum(amountBeforeTax),
                this.fmtNum(taxedAmount),
                this.fmtNum(amountBeforeTax+taxedAmount),
                this.fmtNum(totalAmount),
                this.fmtNum(chargeableAmount),
                this.fmtNum(laterPayable),
                (r.bookingStatus ?? 'N/A').replace(/_/g, ' '),
            ]);
        }

        const endRow = ws.lastRow!.number;
        this.addBorders(ws, startRow - 1, endRow, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 3: Revenue Analytics ──────────────────────────────────────────
    public async generateRevenueAnalytics(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();

        // Sheet 1: Summary
        const ws1 = wb.addWorksheet('Revenue Summary');
        const propMap = new Map<
            string,
            {
                revenue: number;
                paid: number;
                refund: number;
                outstanding: number;
                bookings: number;
                byRoom: Map<string, number>;
                bySource: Map<string, number>;
                byMethod: Map<string, number>;
            }
        >();

        for (const r of reservations) {
            const key = r.propertyId;
            if (!propMap.has(key))
                propMap.set(key, {
                    revenue: 0,
                    paid: 0,
                    refund: 0,
                    outstanding: 0,
                    bookings: 0,
                    byRoom: new Map(),
                    bySource: new Map(),
                    byMethod: new Map(),
                });
            const e = propMap.get(key)!;
            if (r.bookingStatus !== 'cancelled') {
                e.revenue += Number(r.amount);
                e.paid += Number(r.paidAmount);
                e.refund += Number(r.refundAmount);
                e.outstanding += Number(r.extraAmountToPay);
            }
            e.bookings++;
            const room = r.roomTypeCode || 'Unknown';
            e.byRoom.set(room, (e.byRoom.get(room) || 0) + Number(r.amount));
            const src = r.bookingSource || 'Unknown';
            e.bySource.set(src, (e.bySource.get(src) || 0) + Number(r.amount));
            const mth = r.paymentMethod || 'Unknown';
            e.byMethod.set(mth, (e.byMethod.get(mth) || 0) + Number(r.amount));
        }

        this.addTitle(
            ws1,
            'Revenue Analytics Report',
            'Property-wise Revenue Breakdown',
            6
        );
        const h1 = ws1.addRow([
            'Property',
            'Total Bookings',
            'Gross Revenue',
            'Paid Amount',
            'Refunds',
            'Outstanding',
        ]);
        this.styleHeader(h1, 6);
        ws1.columns = [
            { width: 28 },
            { width: 16 },
            { width: 16 },
            { width: 16 },
            { width: 14 },
            { width: 16 },
        ];
        const s1 = ws1.lastRow!.number + 1;
        for (const [propId, e] of propMap) {
            ws1.addRow([
                propertyNames.get(propId) || propId,
                e.bookings,
                this.fmtNum(e.revenue),
                this.fmtNum(e.paid),
                this.fmtNum(e.refund),
                this.fmtNum(e.outstanding),
            ]);
        }
        this.addBorders(ws1, s1 - 1, ws1.lastRow!.number, 6);
        this.styleAltRows(ws1, s1, 6);

        // Sheet 2: Detail
        const ws2 = wb.addWorksheet('Reservation Detail');
        this.addTitle(ws2, 'Revenue Analytics – Detail', '', 9);
        const h2 = ws2.addRow([
            'Booking Code',
            'Property',
            'Room Type',
            'Rate Plan',
            'Source',
            'Payment Method',
            'Amount',
            'Paid',
            'Refund',
        ]);
        this.styleHeader(h2, 9);
        ws2.columns = [
            { width: 16 },
            { width: 24 },
            { width: 14 },
            { width: 16 },
            { width: 14 },
            { width: 18 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
        ];
        const s2 = ws2.lastRow!.number + 1;
        for (const r of reservations) {
            ws2.addRow([
                r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.roomTypeCode || 'N/A',
                r.ratePlanName || r.ratePlanCode || 'N/A',
                r.bookingSource,
                r.paymentMethod,
                this.fmtNum(r.amount),
                this.fmtNum(r.paidAmount),
                this.fmtNum(r.refundAmount),
            ]);
        }
        this.addBorders(ws2, s2 - 1, ws2.lastRow!.number, 9);
        this.styleAltRows(ws2, s2, 9);

        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 4: Insights ────────────────────────────────────────────────────
    public async generateInsights(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Additional Insights');
        const cols = 7;
        this.addTitle(
            ws,
            'Additional Insights Report',
            `Total Records: ${reservations.length}`,
            cols
        );

        const hdr = ws.addRow([
            'Property',
            'Device',
            'Platform',
            'Booking Source',
            'Country',
            'Promo Used',
            'Avg Lead Days',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 26 },
            { width: 14 },
            { width: 14 },
            { width: 16 },
            { width: 12 },
            { width: 12 },
            { width: 15 },
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            const leadDays =
                r.checkInDate && r.bookedAt
                    ? Math.max(
                        0,
                        Math.ceil(
                            (new Date(r.checkInDate).getTime() -
                                new Date(r.bookedAt).getTime()) /
                            86400000
                        )
                    )
                    : 'N/A';
            ws.addRow([
                propertyNames.get(r.propertyId) || r.hotelName,
                r.deviceTypes || 'N/A',
                r.platforms || 'N/A',
                r.bookingSource || 'N/A',
                r.countryCode || 'N/A',
                r.isPromoUsed ? 'Yes' : 'No',
                leadDays,
            ]);
        }

        const endRow = ws.lastRow!.number;
        this.addBorders(ws, startRow - 1, endRow, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 5: Top Properties ──────────────────────────────────────────────
    public async generateTopProperties(
        reservations: any[],
        sortBy: 'revenue' | 'bookings' | 'nights'
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Top Properties');
        const cols = 7;
        this.addTitle(
            ws,
            'Top Performing Properties',
            `Sorted by: ${sortBy}`,
            cols
        );

        const map = new Map<
            string,
            {
                name: string;
                code: string;
                bookings: number;
                revenue: number;
                nights: number;
                cancelled: number;
            }
        >();
        for (const r of reservations) {
            if (!map.has(r.propertyId))
                map.set(r.propertyId, {
                    name: r.hotelName,
                    code: r.propertyCode,
                    bookings: 0,
                    revenue: 0,
                    nights: 0,
                    cancelled: 0,
                });
            const e = map.get(r.propertyId)!;
            e.bookings++;
            if (r.bookingStatus === 'cancelled') e.cancelled++;
            else {
                e.revenue += Number(r.amount);
                e.nights += this.roomNights(
                    r.reservationStartDate,
                    r.reservationEndDate
                );
            }
        }

        const rows = [...map.values()].sort((a, b) =>
            sortBy === 'revenue'
                ? b.revenue - a.revenue
                : sortBy === 'bookings'
                    ? b.bookings - a.bookings
                    : b.nights - a.nights
        );

        const hdr = ws.addRow([
            'Rank',
            'Property',
            'Code',
            'Total Bookings',
            'Revenue',
            'Avg Booking Value',
            'Room Nights',
            'Cancellation Rate',
        ]);
        this.styleHeader(hdr, 8);
        ws.columns = [
            { width: 8 },
            { width: 28 },
            { width: 10 },
            { width: 16 },
            { width: 16 },
            { width: 20 },
            { width: 14 },
            { width: 18 },
        ];
        const startRow = ws.lastRow!.number + 1;

        rows.forEach((r, i) => {
            const avgVal = r.bookings > 0 ? r.revenue / r.bookings : 0;
            const cancelRate =
                r.bookings > 0
                    ? ((r.cancelled / r.bookings) * 100).toFixed(1) + '%'
                    : '0%';
            ws.addRow([
                i + 1,
                r.name,
                r.code,
                r.bookings,
                this.fmtNum(r.revenue),
                this.fmtNum(avgVal),
                r.nights,
                cancelRate,
            ]);
        });

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, 8);
        this.styleAltRows(ws, startRow, 8);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    public async generateAllReservations(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('All Reservations');
        const cols = 22;

        this.addTitle(
            ws,
            'All Reservations Report',
            `Total: ${reservations.length}`,
            cols
        );

        const hdr = ws.addRow([
            'Booking Code',
            'Property',
            'Guest Name',
            'Email',
            'Phone',
            'Room Type',
            'Rate Plan',
            'Check-In',
            'Check-Out',
            'Nights',
            'Currency',
            'Amount Before Tax',
            'Tax Amount',
            "Amount after Tax",
            'Total Amount',
            'Chargeable Amount',
            'Later Payable',
            'Status',
            'Payment Method',
            'Source',
            'Agency',
            'Booked At',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = Array(cols).fill({ width: 22 });

        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            const pb = r.PricingBrakeDown;

            const nights = this.roomNights(r.reservationStartDate, r.reservationEndDate);

            const amountBeforeTax = Number(pb?.amountBeforeTax ?? 0);
            const taxedAmount = Number(pb?.taxedAmount ?? 0);
            const totalAmount = Number(pb?.totalAmount ?? r.amount ?? 0);
            const chargeableAmount = Number(pb?.currentChargeableAmount ?? 0);
            const laterPayable = Number(pb?.latterpayableAmount ?? r.extraAmountToPay ?? 0);
            const amountAfterTax = amountBeforeTax + taxedAmount;
            ws.addRow([
                r.bookingCode?.split('-').slice(1).join('-') ?? r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.primaryGuest
                    ? `${r.primaryGuest.firstName ?? ''} ${r.primaryGuest.lastName ?? ''}`.trim()
                    : 'N/A',
                r.primaryGuest?.email || r.bookingUserEmail || 'N/A',
                r.primaryGuest?.phoneNumber || r.bookingUserPhone || 'N/A',
                r.roomTypeCode || 'N/A',
                r.ratePlanName || r.ratePlanCode || 'N/A',
                this.fmtDate(r.reservationStartDate),
                this.fmtDate(r.reservationEndDate),
                nights,
                r.currencyCode || pb?.currencyCode || 'N/A',
                this.fmtNum(amountBeforeTax),
                this.fmtNum(taxedAmount),
                this.fmtNum(amountAfterTax),
                this.fmtNum(totalAmount),
                this.fmtNum(chargeableAmount),
                this.fmtNum(laterPayable),
                (r.bookingStatus ?? 'N/A').replace(/_/g, ' '),
                (r.paymentMethod ?? 'N/A').replace(/_/g, ' '),
                (r.bookingSource ?? 'N/A').replace(/_/g, ' '),
                r.agency?.agencyName || 'N/A',
                this.fmtDate(r.bookedAt),
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }
    // ── Report 7: Check-In / Check-Out ───────────────────────────────────────
    public async generateCheckInOut(
        reservations: any[],
        mode: 'checkin' | 'checkout',
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const label = mode === 'checkin' ? 'Check-In' : 'Check-Out';
        const ws = wb.addWorksheet(`${label} Report`);
        const cols = 11;
        this.addTitle(
            ws,
            `${label} Report`,
            `Total: ${reservations.length}`,
            cols
        );

        const hdr = ws.addRow([
            'Booking Code',
            'Property',
            'Guest Name',
            'Email',
            'Phone',
            'Room Type',
            'Check-In',
            'Check-Out',
            'Nights',
            'Amount',
            'Status',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 16 },
            { width: 24 },
            { width: 20 },
            { width: 24 },
            { width: 15 },
            { width: 14 },
            { width: 12 },
            { width: 12 },
            { width: 8 },
            { width: 12 },
            { width: 14 },
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            ws.addRow([
                r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.primaryGuest
                    ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`
                    : 'N/A',
                r.primaryGuest?.email || 'N/A',
                r.primaryGuest?.phoneNumber || 'N/A',
                r.roomTypeCode || 'N/A',
                this.fmtDate(r.checkInDate),
                this.fmtDate(r.checkOutDate),
                this.roomNights(r.reservationStartDate, r.reservationEndDate),
                this.fmtNum(r.amount),
                r.bookingStatus,
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 8: Status Breakdown ────────────────────────────────────────────
    public async generateStatusBreakdown(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Status Breakdown');
        const cols = 5;
        this.addTitle(
            ws,
            'Reservation Status Breakdown',
            `Total: ${reservations.length}`,
            cols
        );

        const statusMap = new Map<string, { count: number; amount: number }>();
        for (const r of reservations) {
            const s = r.bookingStatus;
            if (!statusMap.has(s)) statusMap.set(s, { count: 0, amount: 0 });
            const e = statusMap.get(s)!;
            e.count++;
            e.amount += Number(r.amount);
        }

        const hdr = ws.addRow([
            'Status',
            'Count',
            'Total Amount',
            '% of Bookings',
            'Avg. Amount',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 18 },
            { width: 12 },
            { width: 16 },
            { width: 16 },
            { width: 16 },
        ];
        const startRow = ws.lastRow!.number + 1;
        const total = reservations.length;

        for (const [status, e] of statusMap) {
            ws.addRow([
                status,
                e.count,
                this.fmtNum(e.amount),
                total > 0 ? ((e.count / total) * 100).toFixed(1) + '%' : '0%',
                e.count > 0 ? this.fmtNum(e.amount / e.count) : '0.00',
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 9: Loyalty Guests ──────────────────────────────────────────────
    public async generateLoyaltyGuests(
        guests: any[],
        spendMap: Map<string, number>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Loyalty Guests');
        const cols = 11;
        this.addTitle(
            ws,
            'Loyalty Guest Report',
            `Total Loyalty Guests: ${guests.length}`,
            cols
        );

        const hdr = ws.addRow([
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Country',
            'Home Property',
            'Enrolled Properties',
            'Loyalty Level',
            'Total Bookings',
            'Total Spend',
            'Enrolled Since',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 16 },
            { width: 16 },
            { width: 26 },
            { width: 16 },
            { width: 12 },
            { width: 22 },
            { width: 28 },
            { width: 14 },
            { width: 16 },
            { width: 14 },
            { width: 16 },
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const g of guests) {
            // Personal info lives on the linked Guests record (nullable)
            const guestInfo = g.guest;
            const firstName = guestInfo?.firstName || 'N/A';
            const lastName = guestInfo?.lastName || 'N/A';
            const email = g.guestEmail || guestInfo?.email || 'N/A';
            const phone = guestInfo?.phoneNumber || 'N/A';
            const country = guestInfo?.country || 'N/A';
            const homeProperty = guestInfo?.property
                ? `${guestInfo.property.propertyName} (${guestInfo.property.propertyCode})`
                : 'N/A';

            // Enrolled properties via PropertyLoyalityGuests
            const enrolledProperties = (g.PropertyLoyalityGuests ?? [])
                .map((plg: any) =>
                    plg.PropertyLoyalityConfig
                        ? `${plg.PropertyLoyalityConfig.propertyName} (${plg.PropertyLoyalityConfig.propertyCode})`
                        : ''
                )
                .filter(Boolean)
                .join(', ') || 'N/A';

            // A LoyalityGuest can belong to MULTIPLE loyalty programs (one CreationGuest
            // per CreationLoyaltyConfig). Sum noOfBookings across all programs for the
            // true total, and take the highest guestLevel as their best tier.
            const allCreationGuests: any[] = g.CreationGuest ?? [];
            const noOfBookings = allCreationGuests.reduce(
                (sum: number, cg: any) => sum + (cg.noOfBookings ?? 0),
                0
            );
            const guestLevel = allCreationGuests.reduce(
                (max: number, cg: any) => Math.max(max, cg.guestLevel ?? 1),
                1
            );

            // Total spend: cross-property sum from spendMap (keyed by guestEmail)
            const totalSpend = spendMap.get(g.guestEmail) ?? 0;

            // Enrolled since = LoyalityGuest.createdAt
            const enrolledSince = g.createdAt
                ? new Date(g.createdAt).toLocaleDateString('en-GB')
                : 'N/A';

            ws.addRow([
                firstName,
                lastName,
                email,
                phone,
                country,
                homeProperty,
                enrolledProperties,
                `Level ${guestLevel}`,
                noOfBookings,
                this.fmtNum(totalSpend),
                enrolledSince,
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }

    // ── Report 10: Payment Status ──────────────────────────────────────────────
    public async generatePaymentStatus(
        reservations: any[],
        propertyNames: Map<string, string>
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Payment Status');
        const cols = 10;
        this.addTitle(
            ws,
            'Payment Status Report',
            `Total: ${reservations.length}`,
            cols
        );

        const hdr = ws.addRow([
            'Booking Code',
            'Property',
            'Guest Name',
            'Amount',
            'Paid',
            'Outstanding',
            'Refund',
            'Payment Method',
            'Payment Status',
            'Agency Commission',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 16 },
            { width: 24 },
            { width: 20 },
            { width: 12 },
            { width: 12 },
            { width: 14 },
            { width: 12 },
            { width: 18 },
            { width: 18 },
            { width: 20 },
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            const paid = Number(r.paidAmount);
            const amount = Number(r.amount);
            const outstanding = Number(r.extraAmountToPay);
            const refund = Number(r.refundAmount);
            let payStatus = 'Unpaid';
            if (refund > 0) payStatus = 'Refunded';
            else if (paid >= amount) payStatus = 'Fully Paid';
            else if (paid > 0) payStatus = 'Partially Paid';

            ws.addRow([
                r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.primaryGuest
                    ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`
                    : 'N/A',
                this.fmtNum(amount),
                this.fmtNum(paid),
                this.fmtNum(outstanding),
                this.fmtNum(refund),
                r.paymentMethod || 'N/A',
                payStatus,
                r.AgencyCommission
                    ? this.fmtNum(r.AgencyCommission.commissionAmount)
                    : 'N/A',
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }
}
