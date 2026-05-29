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
    public async generateComparison(data: {
        currencyCode: string;
        bookings: { current: number; previous: number; percentageChange: number };
        cancelledBookings: { current: number; previous: number; percentageChange: number };
        revenue: { current: number; previous: number; percentageChange: number };
        averageBookingValue: { current: number; previous: number; percentageChange: number };
        roomNights: { current: number; previous: number; percentageChange: number };
        period: {
            current: { start: Date; end: Date; label: string };
            previous: { start: Date; end: Date; label: string };
        };
    }): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Statistics Comparison');
        const cols = 4;

        const currentLabel = data.period.current.label || this.fmtDate(data.period.current.start);
        const previousLabel = data.period.previous.label || this.fmtDate(data.period.previous.start);

        this.addTitle(
            ws,
            'Statistics Comparison Report',
            `${previousLabel}  →  ${currentLabel} | Currency: ${data.currencyCode}`,
            cols
        );

        const hdr = ws.addRow(['Metric', previousLabel, currentLabel, '% Change']);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 28 },
            { width: 22 },
            { width: 22 },
            { width: 16 },
        ];

        const startRow = ws.lastRow!.number + 1;

        const fmtChange = (pct: number): string => {
            const sign = pct >= 0 ? '+' : '';
            return `${sign}${pct.toFixed(1)}%`;
        };

        const metrics: [string, { current: number; previous: number; percentageChange: number }, boolean][] = [
            ['Total Bookings',        data.bookings,          false],
            ['Cancelled Bookings',    data.cancelledBookings, false],
            [`Revenue (${data.currencyCode})`, data.revenue,  true],
            [`Avg. Booking Value (${data.currencyCode})`, data.averageBookingValue, true],
            ['Room Nights',           data.roomNights,        false],
        ];

        for (const [label, m, isMoney] of metrics) {
            const row = ws.addRow([
                label,
                isMoney ? this.fmtNum(m.previous) : m.previous,
                isMoney ? this.fmtNum(m.current) : m.current,
                fmtChange(m.percentageChange),
            ]);

            // Colour the % change cell: green if positive, red if negative
            const changeCell = row.getCell(4);
            if (m.percentageChange > 0) {
                changeCell.font = { bold: true, color: { argb: 'FF15803D' } };
            } else if (m.percentageChange < 0) {
                changeCell.font = { bold: true, color: { argb: 'FFB91C1C' } };
            }
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
if(!pb) continue;
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
        this.addTitle(ws2, 'Revenue Summary – Detail', '', 10);
        const h2 = ws2.addRow([
            'Booking Code',
            'Property',
            'Room Type',
            'Rate Plan',
            'Source',
            'Payment Method',
            'Currency',
            'Amount',
            'Paid',
            'Refund',
        ]);
        this.styleHeader(h2, 10);
        ws2.columns = [
            { width: 16 },
            { width: 24 },
            { width: 14 },
            { width: 16 },
            { width: 14 },
            { width: 18 },
            { width: 10 },
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
                r.PricingBrakeDown?.currencyCode || r.currencyCode || 'N/A',
                this.fmtNum(r.amount),
                this.fmtNum(r.paidAmount),
                this.fmtNum(r.refundAmount),
            ]);
        }
        this.addBorders(ws2, s2 - 1, ws2.lastRow!.number, 10);
        this.styleAltRows(ws2, s2, 10);

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
        data: {
            topByRevenue: { propertyId: string; propertyCode: string; propertyName: string; totalRevenue: number }[];
            topByBookings: { propertyId: string; propertyCode: string; propertyName: string; totalBookings: number }[];
            topByOccupancy: { propertyId: string; propertyCode: string; propertyName: string; occupancyRate: number; totalRooms: number; occupiedRooms: number }[];
        },
        currency: string
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const generatedAt = new Date().toLocaleDateString('en-GB');

        // ── Sheet 1: Top by Revenue ───────────────────────────────────────────
        const ws1 = wb.addWorksheet('Top by Revenue');
        this.addTitle(ws1, 'Top Properties by Revenue', `Currency: ${currency} | Generated: ${generatedAt}`, 4);
        const h1 = ws1.addRow(['Rank', 'Property', 'Code', `Revenue (${currency})`]);
        this.styleHeader(h1, 4);
        ws1.columns = [{ width: 8 }, { width: 30 }, { width: 12 }, { width: 20 }];
        const s1 = ws1.lastRow!.number + 1;
        data.topByRevenue.forEach((p, i) => {
            ws1.addRow([i + 1, p.propertyName, p.propertyCode, this.fmtNum(p.totalRevenue)]);
        });
        this.addBorders(ws1, s1 - 1, ws1.lastRow!.number, 4);
        this.styleAltRows(ws1, s1, 4);

        // ── Sheet 2: Top by Bookings ──────────────────────────────────────────
        const ws2 = wb.addWorksheet('Top by Bookings');
        this.addTitle(ws2, 'Top Properties by Bookings', `Generated: ${generatedAt}`, 4);
        const h2 = ws2.addRow(['Rank', 'Property', 'Code', 'Total Bookings']);
        this.styleHeader(h2, 4);
        ws2.columns = [{ width: 8 }, { width: 30 }, { width: 12 }, { width: 18 }];
        const s2 = ws2.lastRow!.number + 1;
        data.topByBookings.forEach((p, i) => {
            ws2.addRow([i + 1, p.propertyName, p.propertyCode, p.totalBookings]);
        });
        this.addBorders(ws2, s2 - 1, ws2.lastRow!.number, 4);
        this.styleAltRows(ws2, s2, 4);

        // ── Sheet 3: Top by Occupancy ─────────────────────────────────────────
        const ws3 = wb.addWorksheet('Top by Occupancy');
        this.addTitle(ws3, 'Top Properties by Occupancy', `Generated: ${generatedAt}`, 6);
        const h3 = ws3.addRow(['Rank', 'Property', 'Code', 'Total Rooms', 'Occupied Rooms', 'Occupancy Rate']);
        this.styleHeader(h3, 6);
        ws3.columns = [{ width: 8 }, { width: 30 }, { width: 12 }, { width: 14 }, { width: 16 }, { width: 16 }];
        const s3 = ws3.lastRow!.number + 1;
        data.topByOccupancy.forEach((p, i) => {
            ws3.addRow([
                i + 1,
                p.propertyName,
                p.propertyCode,
                p.totalRooms,
                p.occupiedRooms,
                `${p.occupancyRate.toFixed(1)}%`,
            ]);
        });
        this.addBorders(ws3, s3 - 1, ws3.lastRow!.number, 6);
        this.styleAltRows(ws3, s3, 6);

        return Buffer.from(await wb.xlsx.writeBuffer());
    }



    public async generateAllReservations(
        reservations: any[],
        propertyNames: Map<string, string>,
        conversionOptions?: { targetCurrency: string; rateMap: Map<string, number> }
    ): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('All Reservations');
        const cols = 21;

        const isConverted = !!conversionOptions;
        const { targetCurrency, rateMap } = conversionOptions ?? { targetCurrency: '', rateMap: new Map() };

        // Helper: apply conversion factor for a given native currency
        const applyRate = (amount: number, nativeCurrency: string): number => {
            if (!isConverted) return amount;
            const factor = rateMap.get(nativeCurrency) ?? 1;
            return Math.round(amount * factor * 100) / 100;
        };

        // Title + subtitle
        const subtitle = isConverted
            ? `Total: ${reservations.length} | Amounts converted to ${targetCurrency} ⚠ Indicative prices only`
            : `Total: ${reservations.length}`;

        this.addTitle(ws, 'All Reservations Report', subtitle, cols);

        // Warning row (only when conversion is active)
        if (isConverted) {
            ws.mergeCells(ws.lastRow!.number + 1, 1, ws.lastRow!.number + 1, cols);
            const warnRow = ws.lastRow!;
            warnRow.getCell(1).value =
                `⚠  All monetary amounts below are indicative conversions to ${targetCurrency} based on live exchange rates and may differ from the amounts actually charged to guests.`;
            warnRow.getCell(1).font = { bold: true, color: { argb: 'FF92400E' }, size: 10 };
            warnRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF3CD' },
            };
            warnRow.getCell(1).alignment = { wrapText: true, horizontal: 'left', vertical: 'middle' };
            warnRow.height = 30;
            ws.addRow([]); // spacer
        }

        const currencyHeader = isConverted ? `Currency (${targetCurrency} – Indicative)` : 'Currency';

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
            currencyHeader,
            'Amount Before Tax',
            'Tax Amount',
            'Amount after Tax',
            'Later Payable',
            'Total Amount',
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
            if (!pb) continue;

            const nativeCurrency: string = pb?.currencyCode || r.currencyCode || '';
            const nights = this.roomNights(r.reservationStartDate, r.reservationEndDate);

            const amountBeforeTax  = applyRate(Number(pb?.amountBeforeTax ?? 0), nativeCurrency);
            const taxedAmount      = applyRate(Number(pb?.taxedAmount ?? 0), nativeCurrency);
            const totalAmount      = applyRate(Number(pb?.totalAmount ?? r.amount ?? 0), nativeCurrency);
            const laterPayable     = applyRate(Number(pb?.latterpayableAmount ?? r.extraAmountToPay ?? 0), nativeCurrency);
            const amountAfterTax   = amountBeforeTax + taxedAmount;

            const displayCurrency  = isConverted ? targetCurrency : (nativeCurrency || 'N/A');

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
                displayCurrency,
                this.fmtNum(amountBeforeTax),
                this.fmtNum(taxedAmount),
                this.fmtNum(amountAfterTax),
                this.fmtNum(laterPayable),
                this.fmtNum(totalAmount),
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
        this.addTitle(
            ws,
            `${label} Report`,
            `Total: ${reservations.length}`,
            12
        );

        const cols = 12;
        const hdr = ws.addRow([
            'Booking Code',
            'Property',
            'Guest Name',
            'Email',
            'Phone',
            'Room Type',
            'Check-In',
            'Check-Out',
            'Currency',
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
            { width: 10 },
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
                r.PricingBrakeDown?.currencyCode || r.currencyCode || 'N/A',
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
        const cols = 6;
        this.addTitle(
            ws,
            'Reservation Status Breakdown',
            `Total: ${reservations.length}`,
            cols
        );

        // Group by status + currency
        const statusMap = new Map<string, { count: number; amount: number; currencies: Set<string> }>();
        for (const r of reservations) {
            const s = r.bookingStatus;
            if (!statusMap.has(s)) statusMap.set(s, { count: 0, amount: 0, currencies: new Set() });
            const e = statusMap.get(s)!;
            e.count++;
            e.amount += Number(r.amount);
            const currency = r.PricingBrakeDown?.currencyCode || r.currencyCode;
            if (currency) e.currencies.add(currency);
        }

        const hdr = ws.addRow([
            'Status',
            'Count',
            'Currency',
            'Total Amount',
            '% of Bookings',
            'Avg. Amount',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 18 },
            { width: 12 },
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
                [...e.currencies].join('/') || 'N/A',
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
            const guestInfo = g.PrimaryGuests?.[0];
            const firstName = guestInfo?.firstName || 'N/A';
            const lastName = guestInfo?.lastName || 'N/A';
            const email = g.email || guestInfo?.email || 'N/A';
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

            // Total spend: cross-property sum from spendMap (keyed by email)
            const totalSpend = spendMap.get(g.email) ?? 0;

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
        const cols = 15;
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
            'Currency',
            'Amount Before Tax',
            'Tax Amount',
            'Amount After Tax',
            'Total Amount',
            'Chargeable Now',
            'Later Payable',
            'Paid',
            'Refund',
            'Payment Method',
            'Payment Status',
        ]);
        this.styleHeader(hdr, cols);
        ws.columns = [
            { width: 16 },  //  1 Booking Code
            { width: 24 },  //  2 Property
            { width: 20 },  //  3 Guest Name
            { width: 10 },  //  4 Currency
            { width: 18 },  //  5 Amount Before Tax
            { width: 14 },  //  6 Tax Amount
            { width: 18 },  //  7 Amount After Tax
            { width: 14 },  //  8 Total Amount
            { width: 16 },  //  9 Chargeable Now
            { width: 14 },  // 10 Later Payable
            { width: 12 },  // 11 Paid
            { width: 12 },  // 13 Refund
            { width: 18 },  // 14 Payment Method
            { width: 18 },  // 15 Payment Status
        ];
        const startRow = ws.lastRow!.number + 1;

        for (const r of reservations) {
            const pb = r.PricingBrakeDown;

            const amountBeforeTax  = Number(pb?.amountBeforeTax  ?? 0);
            const taxedAmount      = Number(pb?.taxedAmount      ?? 0);
            const amountAfterTax   = amountBeforeTax + taxedAmount;
            const totalAmount      = Number(pb?.totalAmount      ?? r.amount      ?? 0);
            const chargeableNow    = Number(pb?.currentChargeableAmount ?? 0);
            const laterPayable     = Number(pb?.latterpayableAmount     ?? r.extraAmountToPay ?? 0);
            const paid             = Number(r.paidAmount   ?? 0);
            const refund           = Number(r.refundAmount  ?? 0);
            const currency         = pb?.currencyCode || r.currencyCode || 'N/A';

            let payStatus = 'Unpaid';
            if (refund > 0)                                payStatus = 'Refunded';
            else if (paid >= totalAmount && totalAmount > 0) payStatus = 'Fully Paid';
            else if (paid > 0)                             payStatus = 'Partially Paid';

            ws.addRow([
                r.bookingCode?.split('-').slice(1).join('-') ?? r.bookingCode,
                propertyNames.get(r.propertyId) || r.hotelName,
                r.primaryGuest
                    ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`.trim()
                    : 'N/A',
                currency,
                this.fmtNum(amountBeforeTax),
                this.fmtNum(taxedAmount),
                this.fmtNum(amountAfterTax),
                this.fmtNum(totalAmount),
                this.fmtNum(chargeableNow),
                this.fmtNum(laterPayable),
                this.fmtNum(paid),
                this.fmtNum(refund),
                r.paymentMethod || 'N/A',
                payStatus,
            ]);
        }

        this.addBorders(ws, startRow - 1, ws.lastRow!.number, cols);
        this.styleAltRows(ws, startRow, cols);
        return Buffer.from(await wb.xlsx.writeBuffer());
    }
}
