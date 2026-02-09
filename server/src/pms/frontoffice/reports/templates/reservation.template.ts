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
    propertyAmenities: {
        amenity: {
            amenityName: string;
            icon: string | null;
        };
    }[];
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
    numberOfGuests: number; // Calculated from guests JSON
    bookingSource: string;
    bookingStatus: string;
    amount: number;
    currencyCode: string;
    createdAt: Date;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    guests: any; // JSON field
}

interface PriceBreakdown {
    totalAmount: number;
    totalTax: number;
    baseRatePerNight: number;
    numberOfNights: number;
}

interface BookingVoucherData {
    property: PropertyDetails;
    reservation: ReservationDetails;
    primaryGuest: GuestDetails | null;
    addOns: AddOnDetails[];
    priceBreakdown: PriceBreakdown | null;
}

export const generateBookingVoucherHTML = (
    data: BookingVoucherData
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

    const formatTime = (date: Date): string => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number, currency: string): string => {
        const currencySymbols: Record<string, string> = {
            INR: '₹',
            USD: '$',
            EUR: '€',
        };
        return `${currencySymbols[currency] || currency} ${amount.toFixed(2)}`;
    };

    // Calculate nights
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Parse guests from JSON
    const guestsData = reservation.guests || { adults: 1, children: 0, infants: 0 };
    const totalGuests = (guestsData.adults || 0) + (guestsData.children || 0) + (guestsData.infants || 0);

    // Calculate tax and subtotal
    const totalAmount = Number(reservation.amount);
    const taxAmount = priceBreakdown ? Number(priceBreakdown.totalTax) : 0;
    const amountBeforeTax = totalAmount - taxAmount;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Voucher - ${reservation.bookingCode}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
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
            padding-bottom: 12px;
            border-bottom: 3px solid #2c3e50;
            margin-bottom: 15px;
        }

        .property-info {
            flex: 1;
        }

        .property-logo {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            margin-bottom: 8px;
        }

        .property-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 4px;
        }

        .star-rating {
            color: #f39c12;
            font-size: 14px;
            margin-bottom: 6px;
        }

        .property-contact {
            font-size: 10px;
            color: #555;
            line-height: 1.6;
        }

        .voucher-title {
            text-align: right;
            flex: 0 0 auto;
        }

        .voucher-title h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 8px;
        }

        .booking-code {
            font-size: 13px;
            color: #3498db;
            font-weight: bold;
            background: #ecf0f1;
            padding: 8px 15px;
            border-radius: 5px;
            display: inline-block;
        }

        .section {
            margin-bottom: 15px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 2px solid #ecf0f1;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }

        .info-item {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #3498db;
        }

        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .info-value {
            color: #2c3e50;
            font-size: 13px;
            font-weight: 600;
        }

        .address-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid #27ae60;
            margin-bottom: 15px;
        }

        .address-text {
            color: #2c3e50;
            line-height: 1.8;
        }

        .amenities-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }

        .amenity-badge {
            background: #e8f4f8;
            color: #2980b9;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid #d0e8f2;
        }

        .addon-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .addon-table th {
            background: #8e44ad;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .addon-table td {
            padding: 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 12px;
        }

        .addon-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .financial-summary {
            background: #f9f9f9;
            color: #333;
            padding: 20px;
            border-radius: 8px;
            margin-top: 25px;
        }

        .financial-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .financial-row:last-child {
            border-bottom: none;
            padding-top: 15px;
            margin-top: 10px;
            border-top: 2px solid rgba(0,0,0,0.2);
        }

        .financial-label {
            font-size: 14px;
            font-weight: 500;
        }

        .financial-value {
            font-size: 14px;
            font-weight: bold;
        }

        .total-row .financial-label,
        .total-row .financial-value {
            font-size: 18px;
            color: #f39c12;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-confirmed {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status-pending {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        .status-cancelled {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 11px;
        }

        .footer-note {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: left;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                margin: 0;
                padding: 15mm;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <div class="property-info">
                ${
                    property.image && property.image.length > 0
                        ? `
                <img src="${property.image[0]}" alt="${property.propertyName}" class="property-logo">
                `
                        : ''
                }
                <div class="property-name">${property.propertyName}</div>
                ${
                    property.starRating
                        ? `
                <div class="star-rating">${'★'.repeat(Math.floor(property.starRating))}${'☆'.repeat(5 - Math.floor(property.starRating))}</div>
                `
                        : ''
                }
                <div class="property-contact">
                    <div><strong>Email:</strong> ${property.propertyEmail}</div>
                    <div><strong>Phone:</strong> ${property.propertyContact}</div>
                    <div><strong>Property Code:</strong> ${property.propertyCode}</div>
                </div>
            </div>
            <div class="voucher-title">
                <h1>BOOKING VOUCHER</h1>
                <div class="booking-code">${reservation.bookingCode}</div>
            </div>
        </div>

        <!-- Property Address -->
        ${
            property.propertyAddress
                ? `
        <div class="section">
            <div class="section-title">Property Location</div>
            <div class="address-box">
                <div class="address-text">
                    ${property.propertyAddress.addressLine1}${property.propertyAddress.addressLine2 ? ', ' + property.propertyAddress.addressLine2 : ''}<br>
                    ${property.propertyAddress.location}, ${property.propertyAddress.landmark}<br>
                    ${property.propertyAddress.city}, ${property.propertyAddress.state} - ${property.propertyAddress.zipCode}<br>
                    ${property.propertyAddress.country}
                </div>
            </div>
        </div>
        `
                : ''
        }

        <!-- Reservation Details -->
        <div class="section">
            <div class="section-title">Reservation Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Check-In Date</div>
                    <div class="info-value">${formatDate(reservation.checkInDate)} at ${formatTime(reservation.checkInDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Check-Out Date</div>
                    <div class="info-value">${formatDate(reservation.checkOutDate)} at ${formatTime(reservation.checkOutDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Number of Nights</div>
                    <div class="info-value">${nights} Night${nights > 1 ? 's' : ''}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Guests</div>
                    <div class="info-value">${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</div>
                </div>
                ${
                    reservation.roomTypeCode
                        ? `
                <div class="info-item">
                    <div class="info-label">Room Type</div>
                    <div class="info-value">${reservation.roomTypeCode}</div>
                </div>
                `
                        : ''
                }
                ${
                    reservation.ratePlanCode
                        ? `
                <div class="info-item">
                    <div class="info-label">Rate Plan</div>
                    <div class="info-value">${reservation.ratePlanCode}</div>
                </div>
                `
                        : ''
                }
                <div class="info-item">
                    <div class="info-label">Booking Status</div>
                    <div class="info-value">
                        <span class="status-badge status-${reservation.bookingStatus.toLowerCase()}">${reservation.bookingStatus}</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Booking Source</div>
                    <div class="info-value">${reservation.bookingSource.toString().replace('_', ' ')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Booking Date</div>
                    <div class="info-value">${formatDate(reservation.createdAt)}</div>
                </div>
            </div>
        </div>

        <!-- Primary Guest Information -->
        ${
            primaryGuest
                ? `
        <div class="section">
            <div class="section-title">Primary Guest Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Guest Name</div>
                    <div class="info-value">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${primaryGuest.email || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${primaryGuest.phoneNumber || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Guest Type</div>
                    <div class="info-value">${primaryGuest.userType}</div>
                </div>
                ${
                    primaryGuest.userIdentityCardType &&
                    primaryGuest.identityCardNumber
                        ? `
                <div class="info-item">
                    <div class="info-label">Identity</div>
                    <div class="info-value">${primaryGuest.userIdentityCardType.replace('_', ' ').toUpperCase()}: ${primaryGuest.identityCardNumber}</div>
                </div>
                `
                        : ''
                }
            </div>
        </div>
        `
                : ''
        }

        <!-- Add-ons -->
        ${
            addOns && addOns.length > 0
                ? `
        <div class="section">
            <div class="section-title">Add-Ons & Services</div>
            <table class="addon-table">
                <thead>
                    <tr>
                        <th>Service Name</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${addOns
                        .map(
                            addon => `
                        <tr>
                            <td>${addon.name}</td>
                            <td>${addon.quantity}</td>
                            <td>${formatCurrency(addon.totalPrice, reservation.currencyCode)}</td>
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

        <!-- Property Amenities -->
        ${
            property.propertyAmenities && property.propertyAmenities.length > 0
                ? `
        <div class="section">
            <div class="section-title">Property Amenities</div>
            <div class="amenities-container">
                ${property.propertyAmenities
                    .map(
                        amenity => `
                    <span class="amenity-badge">${amenity.amenity.icon || '•'} ${amenity.amenity.amenityName}</span>
                `
                    )
                    .join('')}
            </div>
        </div>
        `
                : ''
        }

        <!-- Financial Summary -->
        <div class="financial-summary">
            <div class="financial-row">
                <span class="financial-label">Subtotal (Before Tax)</span>
                <span class="financial-value">${formatCurrency(amountBeforeTax, reservation.currencyCode)}</span>
            </div>
            <div class="financial-row">
                <span class="financial-label">Tax Amount</span>
                <span class="financial-value">${formatCurrency(taxAmount, reservation.currencyCode)}</span>
            </div>
            <div class="financial-row total-row">
                <span class="financial-label">TOTAL AMOUNT</span>
                <span class="financial-value">${formatCurrency(totalAmount, reservation.currencyCode)}</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-note">
                <strong>Important Notes:</strong><br>
                • Please carry a valid government-issued photo ID for check-in<br>
                • Check-in time: ${formatTime(reservation.checkInDate)} | Check-out time: ${formatTime(reservation.checkOutDate)}<br>
                • Early check-in or late check-out is subject to availability and may incur additional charges<br>
                • For any queries or modifications, please contact the property directly
            </div>
            <div style="margin-top: 20px; color: #95a5a6;">
                This is an electronically generated voucher. Generated on ${formatDate(new Date())} at ${formatTime(new Date())}
            </div>
        </div>
    </div>
</body>
</html>
    `;
};