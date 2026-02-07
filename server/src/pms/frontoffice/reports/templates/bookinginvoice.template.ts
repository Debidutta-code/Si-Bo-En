interface PropertyDetails {
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string;
    image: string[];
    starRating: number | null;
    propertyAddress: {
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        landmark: string;
        location: string;
    } | null;
}

interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    userType: string;
    userIdentityCardType: string | null;
    identityCardNumber: string | null;
}

interface AddOnDetails {
    name: string;
    quantity: number;
    totalPrice: number;
}

interface ReservationDetails {
    bookingCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    bookingSource: string;
    bookingStatus: string;
    amount: number;
    paidAmount: number;
    currencyCode: string;
    createdAt: Date;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    paymentMethod: string;
    guests: any; // JSON field
}

interface PriceBreakdown {
    totalAmount: number;
    totalTax: number;
    baseRatePerNight: number;
    numberOfNights: number;
    additionalGuestCharges: number;
    breakdown: any;
}

interface BookingInvoiceData {
    property: PropertyDetails;
    reservation: ReservationDetails;
    primaryGuest: GuestDetails | null;
    addOns: AddOnDetails[];
    priceBreakdown: PriceBreakdown | null;
}

export const generateBookingInvoiceHTML = (
    data: BookingInvoiceData
): string => {
    const { property, reservation, primaryGuest, addOns, priceBreakdown } =
        data;

    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (date: Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (
        amount: number | string,
        currency: string = 'INR'
    ): string => {
        const numAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(numAmount);
    };

    const formatPaymentMethod = (method: string): string => {
        return method
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Calculate values
    const totalAmount = Number(reservation.amount);
    const paidAmount = Number(reservation.paidAmount);
    const balance = totalAmount - paidAmount;
    const taxAmount = priceBreakdown ? Number(priceBreakdown.totalTax) : 0;
    const amountBeforeTax = totalAmount - taxAmount;
    
    // Calculate nights
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Parse guests from JSON
    const guestsData = reservation.guests || { adults: 1, children: 0, infants: 0 };
    const totalGuests = (guestsData.adults || 0) + (guestsData.children || 0) + (guestsData.infants || 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${reservation.bookingCode}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.5;
            background: #fff;
        }

        .container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 3px solid #1a1a1a;
        }

        .property-info {
            flex: 1;
        }

        .property-logo {
            width: 70px;
            height: 70px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 2px solid #e0e0e0;
        }

        .property-name {
            font-size: 22px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 5px;
        }

        .star-rating {
            color: #ffa500;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .property-contact {
            font-size: 10px;
            color: #555;
            line-height: 1.7;
        }

        .property-contact div {
            margin-bottom: 2px;
        }

        .invoice-title {
            text-align: right;
        }

        .invoice-title h1 {
            font-size: 32px;
            color: #1a1a1a;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-details {
            text-align: right;
            font-size: 10px;
            color: #666;
        }

        .invoice-details div {
            margin-bottom: 4px;
        }

        .booking-code {
            font-size: 14px;
            color: #2563eb;
            font-weight: bold;
            background: #eff6ff;
            padding: 10px 16px;
            border-radius: 6px;
            display: inline-block;
            margin-top: 8px;
            border: 1px solid #2563eb;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
        }

        .status-confirmed {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #22c55e;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #eab308;
        }

        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }

        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e5e7eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }

        .info-row:last-child {
            margin-bottom: 0;
        }

        .info-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .info-value {
            color: #1a1a1a;
            font-weight: 600;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }

        table thead {
            background: #1f2937;
            color: white;
        }

        table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        table tbody tr:hover {
            background: #f9fafb;
        }

        table tbody tr:last-child td {
            border-bottom: 2px solid #1f2937;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: 600;
        }

        .financial-summary {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border: 2px solid #d1d5db;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 11px;
        }

        .summary-row.total {
            font-size: 14px;
            font-weight: bold;
            padding: 12px 0;
            margin-top: 10px;
            border-top: 2px solid #1a1a1a;
            color: #1a1a1a;
        }

        .summary-row.paid {
            color: #166534;
            font-weight: 600;
        }

        .summary-row.balance {
            font-size: 13px;
            font-weight: bold;
            color: ${balance > 0 ? '#dc2626' : '#166534'};
            padding: 12px 0;
            margin-top: 8px;
            border-top: 2px dashed #9ca3af;
        }

        .notes-section {
            margin-top: 30px;
            padding: 15px;
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }

        .notes-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 11px;
        }

        .notes-content {
            color: #78350f;
            font-size: 10px;
            line-height: 1.6;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }

        .terms {
            margin-top: 30px;
            padding: 15px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
        }

        .terms-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 10px;
            color: #1a1a1a;
        }

        .terms-list {
            list-style-position: inside;
            color: #4b5563;
            font-size: 9px;
            line-height: 1.8;
        }

        .terms-list li {
            margin-bottom: 5px;
        }

        @media print {
            .container {
                padding: 0;
            }
            
            body {
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="property-info">
                ${
                    property.image && property.image[0]
                        ? `
                    <img src="${property.image[0]}" alt="${property.propertyName}" class="property-logo">
                `
                        : ''
                }
                <div class="property-name">${property.propertyName}</div>
                ${
                    property.starRating
                        ? `
                    <div class="star-rating">${'★'.repeat(property.starRating)}${'☆'.repeat(5 - property.starRating)}</div>
                `
                        : ''
                }
                <div class="property-contact">
                    ${
                        property.propertyAddress
                            ? `
                        <div><strong>Address:</strong> ${property.propertyAddress.addressLine1}${property.propertyAddress.addressLine2 ? ', ' + property.propertyAddress.addressLine2 : ''}</div>
                        <div>${property.propertyAddress.city}, ${property.propertyAddress.state} ${property.propertyAddress.zipCode}</div>
                        <div>${property.propertyAddress.country}</div>
                    `
                            : ''
                    }
                    <div><strong>Email:</strong> ${property.propertyEmail}</div>
                    <div><strong>Phone:</strong> ${property.propertyContact}</div>
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-details">
                    <div><strong>Invoice Date:</strong> ${formatDate(new Date())}</div>
                    <div><strong>Booking Date:</strong> ${formatDate(reservation.createdAt)}</div>
                </div>
                <div class="booking-code">Booking #${reservation.bookingCode}</div>
                <div class="status-badge status-${reservation.bookingStatus.toLowerCase()}">${reservation.bookingStatus}</div>
            </div>
        </div>

        <!-- Guest and Reservation Info -->
        <div class="two-column">
            <div class="section">
                <div class="section-title">Bill To</div>
                <div class="info-box">
                    ${
                        primaryGuest
                            ? `
                        <div class="info-row">
                            <span class="info-label">Guest Name:</span>
                            <span class="info-value">${primaryGuest.firstName} ${primaryGuest.lastName}</span>
                        </div>
                        ${
                            primaryGuest.email
                                ? `
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${primaryGuest.email}</span>
                            </div>
                        `
                                : ''
                        }
                        ${
                            primaryGuest.phoneNumber
                                ? `
                            <div class="info-row">
                                <span class="info-label">Phone:</span>
                                <span class="info-value">${primaryGuest.phoneNumber}</span>
                            </div>
                        `
                                : ''
                        }
                        ${
                            primaryGuest.userIdentityCardType &&
                            primaryGuest.identityCardNumber
                                ? `
                            <div class="info-row">
                                <span class="info-label">${primaryGuest.userIdentityCardType}:</span>
                                <span class="info-value">${primaryGuest.identityCardNumber}</span>
                            </div>
                        `
                                : ''
                        }
                    `
                            : '<div class="info-value">No guest information available</div>'
                    }
                </div>
            </div>

            <div class="section">
                <div class="section-title">Reservation Details</div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Check-In:</span>
                        <span class="info-value">${formatDate(reservation.checkInDate)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Check-Out:</span>
                        <span class="info-value">${formatDate(reservation.checkOutDate)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Duration:</span>
                        <span class="info-value">${nights} Night${nights > 1 ? 's' : ''}</span>
                    </div>
                    ${
                        reservation.roomTypeCode
                            ? `
                    <div class="info-row">
                        <span class="info-label">Room Type:</span>
                        <span class="info-value">${reservation.roomTypeCode}</span>
                    </div>
                    `
                            : ''
                    }
                    <div class="info-row">
                        <span class="info-label">Guests:</span>
                        <span class="info-value">${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Booking Source:</span>
                        <span class="info-value">${reservation.bookingSource.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Accommodation Charges -->
        <div class="section">
            <div class="section-title">Accommodation Charges</div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Nights</th>
                        <th class="text-center">Guests</th>
                        <th class="text-right">Rate/Night</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="font-bold">${reservation.roomTypeCode || 'Room Charges'}</td>
                        <td class="text-center">${nights}</td>
                        <td class="text-center">${totalGuests}</td>
                        <td class="text-right">${priceBreakdown ? formatCurrency(priceBreakdown.baseRatePerNight, reservation.currencyCode) : '-'}</td>
                        <td class="text-right font-bold">${formatCurrency(amountBeforeTax, reservation.currencyCode)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add-Ons -->
        ${
            addOns && addOns.length > 0
                ? `
            <div class="section">
                <div class="section-title">Additional Services</div>
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addOns
                            .map(
                                addon => `
                            <tr>
                                <td>${addon.name}</td>
                                <td class="text-center">${addon.quantity}</td>
                                <td class="text-right">${formatCurrency(addon.totalPrice, reservation.currencyCode)}</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `
                : ''
        }

        <!-- Payment Information -->
        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${formatPaymentMethod(reservation.paymentMethod)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">${formatCurrency(paidAmount, reservation.currencyCode)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Balance:</span>
                    <span class="info-value" style="color: ${balance > 0 ? '#dc2626' : '#166534'}">
                        ${formatCurrency(Math.abs(balance), reservation.currencyCode)}
                    </span>
                </div>
            </div>
        </div>

        <!-- Financial Summary -->
        <div class="financial-summary">
            <div class="section-title" style="border-bottom: none; margin-bottom: 15px;">Financial Summary</div>
            <div class="summary-row">
                <span>Subtotal (Before Tax):</span>
                <span class="font-bold">${formatCurrency(amountBeforeTax, reservation.currencyCode)}</span>
            </div>
            <div class="summary-row">
                <span>Tax Amount:</span>
                <span class="font-bold">${formatCurrency(taxAmount, reservation.currencyCode)}</span>
            </div>
            <div class="summary-row total">
                <span>Total Amount:</span>
                <span>${formatCurrency(totalAmount, reservation.currencyCode)}</span>
            </div>
            <div class="summary-row paid">
                <span>Total Paid:</span>
                <span>${formatCurrency(paidAmount, reservation.currencyCode)}</span>
            </div>
            <div class="summary-row balance">
                <span>Balance ${balance > 0 ? 'Due' : balance < 0 ? 'Refund' : ''}:</span>
                <span>${formatCurrency(Math.abs(balance), reservation.currencyCode)}</span>
            </div>
        </div>

        ${
            balance > 0
                ? `
            <div class="notes-section">
                <div class="notes-title">⚠ Payment Reminder</div>
                <div class="notes-content">
                    Outstanding balance of ${formatCurrency(balance, reservation.currencyCode)} is due. Please make the payment before check-in or as per the payment policy agreed upon during booking.
                </div>
            </div>
        `
                : ''
        }

        <!-- Terms and Conditions -->
        <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            <ul class="terms-list">
                <li>Check-in time is 2:00 PM and check-out time is 11:00 AM unless otherwise specified.</li>
                <li>Early check-in and late check-out are subject to availability and may incur additional charges.</li>
                <li>Valid government-issued photo ID and credit card required at check-in.</li>
                <li>Prices are inclusive of applicable taxes unless otherwise stated.</li>
                <li>The property reserves the right to pre-authorize credit cards prior to arrival.</li>
                <li>Damage to property or missing items will be charged to the guest's account.</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 8px;">Thank you for choosing ${property.propertyName}. We look forward to welcoming you!</div>
            <div>This is a computer-generated invoice and does not require a signature.</div>
            <div style="margin-top: 8px;">For any queries, please contact us at ${property.propertyEmail} or ${property.propertyContact}</div>
        </div>
    </div>
</body>
</html>
    `;
};