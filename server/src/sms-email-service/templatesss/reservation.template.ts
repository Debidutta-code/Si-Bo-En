import { IBookingDetails, IGuestDetail, ITax } from "../../pms/frontoffice/reservation/types";
import { capitalizeFirstLetter } from "../utils/capitalizefirstLetter.util";


interface PropertyDetails {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  description: string;
  image: string[];
}

interface PropertyAddress {
  addressLine1: string;
  addressLine2: string | null;
  country: string;
  state: string;
  city: string;
  location: string;
  landmark: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

interface RoomDetails {
  roomName: string;
  roomType: string;
  roomView?: string;
  maxOccupancy?: number;
}

interface EmailTemplateProps {
  reservation: IBookingDetails;
  property: PropertyDetails;
  propertyAddress: PropertyAddress;
  room: RoomDetails;
}

// Utility function to format currency
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getMapUrl = (latitude: number, longitude: number): string => {
  // This uses the public Google Maps view URL which requires NO API KEY
  return `https://maps.google.com{latitude},${longitude}&z=15&output=embed`;
};


export const BookingConfirmationEmail = ({
  reservation,
  property,
  propertyAddress,
  room
}: EmailTemplateProps): string => {
  console.log("Generating booking confirmation email...");
  console.log(reservation)
  console.log(property)

  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f5f5f5; 
      color: #333;
      line-height: 1.6;
    }
    .container { 
      max-width: 650px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 { 
      font-size: 28px; 
      margin-bottom: 10px;
      font-weight: 600;
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.95;
    }
    .confirmation-badge {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 8px;
      padding: 15px 25px;
      margin: 20px auto 0;
      display: inline-block;
    }
    .confirmation-number {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content { 
      padding: 35px 30px; 
    }
    .section { 
      margin-bottom: 35px; 
    }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .property-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .map-image {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .address-block {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .price-row.total {
      border-bottom: none;
      border-top: 2px solid #667eea;
      margin-top: 10px;
      padding-top: 15px;
      font-weight: bold;
      font-size: 18px;
      color: #667eea;
    }
    .price-label {
      color: #666;
    }
    .price-value {
      font-weight: 600;
      color: #333;
    }
    .guest-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .guest-name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }
    .guest-type {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .highlight-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 25px 20px; }
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Thank you for choosing ${property.propertyName}</p>

    </div>

    <!-- Content -->
    <div class="content">
      <!-- Guest Information -->
      <div class="section">
        <h2 class="section-title">Guest Information</h2>
        <div class="guest-card">
          <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
          <span class="guest-type">Primary Guest</span>
          ${primaryGuest.email ? `<div style="margin-top: 8px; color: #666;">📧 ${primaryGuest.email}</div>` : ''}
          ${primaryGuest.phone ? `<div style="color: #666;">📱 ${primaryGuest.phone}</div>` : ''}
        </div>
        ${guests && guestDetails.slice(1).map((guest: IGuestDetail) => `
          <div class="guest-card">
            <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
            <span class="guest-type">${guest.type}</span>
          </div>
        `).join('')}
      </div>

      <!-- Reservation Details -->
      <div class="section">
        <h2 class="section-title">Reservation Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Check-in</span>
            <span class="info-value">${formatDate(startDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Check-out</span>
            <span class="info-value">${formatDate(endDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nights</span>
            <span class="info-value">${finalPrice.numberOfNights} Night${finalPrice.numberOfNights > 1 ? 's' : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guests</span>
            <span class="info-value">${guests.adults} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Room Type</span>
            <span class="info-value">${room.roomName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Number of Rooms</span>
            <span class="info-value">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <!-- Property Information -->
      <div class="section">
        <h2 class="section-title">Property Information</h2>
        ${property.image && property.image[0] ? `<img src="${property.image[0]}" alt="${property.propertyName}" class="property-image">` : ''}
        <h3 style="font-size: 20px; margin-bottom: 10px;">${property.propertyName}</h3>
        <p style="color: #666; margin-bottom: 15px;">${property.description}</p>
        
        <div class="address-block">
          <div style="font-weight: 600; margin-bottom: 8px;">📍 Address</div>
          <div>${propertyAddress.addressLine1}</div>
          ${propertyAddress.addressLine2 ? `<div>${propertyAddress.addressLine2}</div>` : ''}
          <div>${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
          <div>${propertyAddress.country}</div>
          ${propertyAddress.landmark ? `<div style="margin-top: 5px; font-style: italic; color: #666;">Near ${propertyAddress.landmark}</div>` : ''}
        </div>

<div class="map-container">
  <iframe 
    src="${getMapUrl(propertyAddress.latitude, propertyAddress.longitude)}" 
    width="100%" 
    height="300" 
    style="border:0;" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade"
    class="map-iframe">
  </iframe>
</div>

        <div style="margin-top: 20px;">
          <div style="margin-bottom: 8px;">📞 <strong>Phone:</strong> ${property.propertyContact}</div>
          <div>📧 <strong>Email:</strong> ${property.propertyEmail}</div>
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="section">
        <h2 class="section-title">Price Summary</h2>
        <div class="price-row">
          <span class="price-label">Room Rate (${finalPrice.numberOfNights} night${finalPrice.numberOfNights > 1 ? 's' : ''})</span>
          <span class="price-value">${formatCurrency(finalPrice.breakdown.totalBaseAmount, reservation.currency)}</span>
        </div>
        ${finalPrice.breakdown.totalAdditionalCharges > 0 ? `
        <div class="price-row">
          <span class="price-label">Additional Guest Charges</span>
          <span class="price-value">${formatCurrency(finalPrice.breakdown.totalAdditionalCharges, reservation.currency)}</span>
        </div>
        ` : ''}
        ${finalPrice.addons && finalPrice.addons.length > 0 ? finalPrice.addons.map((addon: any) => `
        <div class="price-row">
          <span class="price-label">${addon.name}</span>
          <span class="price-value">${formatCurrency(addon.totalPrice, reservation.currency)}</span>
        </div>
        `).join('') : ''}
        
        ${finalPrice.taxes.map((tax: ITax) => `
        <div class="price-row">
          <span class="price-label">${tax.name} (${formatCurrency(tax.amount, reservation.currency)})</span>
        </div>
        `).join('')}
        ${finalPrice.promotions && finalPrice.promotions.totalDiscount > 0 ? `
        <div class="price-row" style="color: #28a745;">
          <span class="price-label">Promotional Discount</span>
          <span class="price-value">-${formatCurrency(finalPrice.promotions.totalDiscount, reservation.currency)}</span>
        </div>
        ` : ''}
        <div class="price-row total">
          <span>Total Amount</span>
          <span>${formatCurrency(finalPrice.totalAmount, reservation.currency)}</span>
        </div>
      </div>

      <!-- Important Information -->
      <div class="highlight-box">
        <strong>📋 Important Information:</strong>
        <ul style="margin: 10px 0 0 20px; line-height: 1.8;">
          <li>Valid government-issued photo ID required at check-in</li>
          <li>Payment method: ${reservation.paymentMethod.split("_").map((txt) => capitalizeFirstLetter(txt)).join(" ")}</li>
        </ul> 
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need to make changes? <a href="https://bookings.revchilltech.com/my-trip/">Manage your booking</a></p>
      <p style="margin-top: 10px;">Questions? Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated confirmation email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ==================== BOOKING AMENDMENT EMAIL ====================
export const BookingAmendmentEmail = ({
  reservation,
  property,
  propertyAddress,
  room,
}: EmailTemplateProps): string => {
  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Amendment Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f5f5f5; 
      color: #333;
      line-height: 1.6;
    }
    .container { 
      max-width: 650px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 { 
      font-size: 28px; 
      margin-bottom: 10px;
      font-weight: 600;
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.95;
    }
    .confirmation-badge {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 8px;
      padding: 15px 25px;
      margin: 20px auto 0;
      display: inline-block;
    }
    .confirmation-number {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content { 
      padding: 35px 30px; 
    }
    .section { 
      margin-bottom: 35px; 
    }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      color: #f5576c;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .property-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .map-image {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .address-block {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .price-row.total {
      border-bottom: none;
      border-top: 2px solid #f5576c;
      margin-top: 10px;
      padding-top: 15px;
      font-weight: bold;
      font-size: 18px;
      color: #f5576c;
    }
    .price-label {
      color: #666;
    }
    .price-value {
      font-weight: 600;
      color: #333;
    }
    .guest-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .guest-name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }
    .guest-type {
      display: inline-block;
      background: #f5576c;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .footer a {
      color: #f5576c;
      text-decoration: none;
    }
    .amendment-notice {
      background: #e7f3ff;
      border-left: 4px solid #2196f3;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 25px 20px; }
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✏️ Booking Updated!</h1>
      <p>Your reservation has been successfully Updated!</p>

    </div>

    <!-- Content -->
    <div class="content">
      <!-- Amendment Notice -->
      <div class="amendment-notice">
        <strong>ℹ️ Booking Amendment Notice</strong>
        <p style="margin-top: 8px; line-height: 1.6;">
          Your booking details have been updated as per your request. Please review the updated information below and keep this email for your records.
        </p>
      </div>

      <!-- Guest Information -->
      <div class="section">
        <h2 class="section-title">Guest Information</h2>
        <div class="guest-card">
          <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
          <span class="guest-type">Primary Guest</span>
          ${primaryGuest.email ? `<div style="margin-top: 8px; color: #666;">📧 ${primaryGuest.email}</div>` : ''}
          ${primaryGuest.phone ? `<div style="color: #666;">📱 ${primaryGuest.phone}</div>` : ''}
        </div>
        ${guestDetails.slice(1).map((guest: IGuestDetail) => `
          <div class="guest-card">
            <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
            <span class="guest-type">${guest.type}</span>
          </div>
        `).join('')}
      </div>

      <!-- Updated Reservation Details -->
      <div class="section">
        <h2 class="section-title">Updated Reservation Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Check-in</span>
            <span class="info-value">${formatDate(startDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Check-out</span>
            <span class="info-value">${formatDate(endDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nights</span>
            <span class="info-value">${finalPrice.numberOfNights} Night${finalPrice.numberOfNights > 1 ? 's' : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guests</span>
            <span class="info-value">${guests.adults} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Room Type</span>
            <span class="info-value">${room.roomName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Number of Rooms</span>
            <span class="info-value">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <!-- Property Information -->
      <div class="section">
        <h2 class="section-title">Property Information</h2>
        ${property.image && property.image[0] ? `<img src="${property.image[0]}" alt="${property.propertyName}" class="property-image">` : ''}
        <h3 style="font-size: 20px; margin-bottom: 10px;">${property.propertyName}</h3>
        <p style="color: #666; margin-bottom: 15px;">${property.description}</p>
        
        <div class="address-block">
          <div style="font-weight: 600; margin-bottom: 8px;">📍 Address</div>
          <div>${propertyAddress.addressLine1}</div>
          ${propertyAddress.addressLine2 ? `<div>${propertyAddress.addressLine2}</div>` : ''}
          <div>${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
          <div>${propertyAddress.country}</div>
          ${propertyAddress.landmark ? `<div style="margin-top: 5px; font-style: italic; color: #666;">Near ${propertyAddress.landmark}</div>` : ''}
        </div>

<div class="map-container">
  <iframe 
    src="${getMapUrl(propertyAddress.latitude, propertyAddress.longitude)}" 
    width="100%" 
    height="300" 
    style="border:0;" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade"
    class="map-iframe">
  </iframe>
</div>
        <div style="margin-top: 20px;">
          <div style="margin-bottom: 8px;">📞 <strong>Phone:</strong> ${property.propertyContact}</div>
          <div>📧 <strong>Email:</strong> ${property.propertyEmail}</div>
        </div>
      </div>

      <!-- Updated Price Breakdown -->
      <div class="section">
        <h2 class="section-title">Updated Price Summary</h2>
        <div class="price-row">
          <span class="price-label">Room Rate (${finalPrice.numberOfNights} night${finalPrice.numberOfNights > 1 ? 's' : ''})</span>
          <span class="price-value">${formatCurrency(finalPrice.breakdown.totalBaseAmount, reservation.currency)}</span>
        </div>
        ${finalPrice.breakdown.totalAdditionalCharges > 0 ? `
        <div class="price-row">
          <span class="price-label">Additional Guest Charges</span>
          <span class="price-value">${formatCurrency(finalPrice.breakdown.totalAdditionalCharges, reservation.currency)}</span>
        </div>
        ` : ''}
        ${finalPrice.addons && finalPrice.addons.length > 0 ? finalPrice.addons.map((addon: any) => `
        <div class="price-row">
          <span class="price-label">${addon.name}</span>
          <span class="price-value">${formatCurrency(addon.totalPrice, reservation.currency)}</span>
        </div>
        `).join('') : ''}
        
        ${finalPrice.taxes.map((tax: ITax) => `
        <div class="price-row">
          <span class="price-label">${tax.name} (${formatCurrency(tax.amount, reservation.currency)})</span>
        </div>
        `).join('')}
        ${finalPrice.promotions && finalPrice.promotions.totalDiscount > 0 ? `
        <div class="price-row" style="color: #28a745;">
          <span class="price-label">Promotional Discount</span>
          <span class="price-value">-${formatCurrency(finalPrice.promotions.totalDiscount, reservation.currency)}</span>
        </div>
        ` : ''}
        <div class="price-row total">
          <span>Total Amount</span>
          <span>${formatCurrency(finalPrice.totalAmount, reservation.currency)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need further changes? <a href="https://bookings.revchilltech.com/my-trip">Manage your booking</a></p>
      <p style="margin-top: 10px;">Questions? Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated confirmation email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const BookingCancellationEmail = ({
  reservation,
  property,
  propertyAddress,
  room, }: EmailTemplateProps): string => {
  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancellation Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f5f5f5; 
      color: #333;
      line-height: 1.6;
    }
    .container { 
      max-width: 650px; 
      margin: 40px auto; 
      background: #ffffff; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #8e9eab 0%, #333 100%); 
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 { 
      font-size: 28px; 
      margin-bottom: 10px;
      font-weight: 600;
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.95;
    }
    .confirmation-badge {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 8px;
      padding: 15px 25px;
      margin: 20px auto 0;
      display: inline-block;
    }
    .confirmation-number {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content { 
      padding: 35px 30px; 
    }
    .section { 
      margin-bottom: 35px; 
    }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .guest-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .guest-name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }
    .guest-type {
      display: inline-block;
      background: #666;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .footer a {
      color: #333;
      text-decoration: none;
    }
    .cancellation-notice {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .refund-box {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .cancelled-status {
      background: #dc3545;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      display: inline-block;
      font-weight: 600;
      margin-top: 10px;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 25px 20px; }
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>❌ Booking Cancelled</h1>
      <p>Your reservation has been cancelled</p>
      
      <div class="cancelled-status">CANCELLED</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Cancellation Notice -->
      <div class="cancellation-notice">
        <strong>⚠️ Cancellation Confirmation</strong>
        <p style="margin-top: 8px; line-height: 1.6;">
          We're sorry to see you go! Your booking at ${property.propertyName} has been successfully cancelled. 
          We hope to welcome you in the future.
        </p>
      </div>


      <!-- Guest Information -->
      <div class="section">
        <h2 class="section-title">Guest Information</h2>
        <div class="guest-card">
          <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
          <span class="guest-type">Primary Guest</span>
          ${primaryGuest.email ? `<div style="margin-top: 8px; color: #666;">📧 ${primaryGuest.email}</div>` : ''}
          ${primaryGuest.phone ? `<div style="color: #666;">📱 ${primaryGuest.phone}</div>` : ''}
        </div>
      </div>

      <!-- Cancelled Reservation Details -->
      <div class="section">
        <h2 class="section-title">Cancelled Reservation Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Check-in (Was)</span>
            <span class="info-value">${formatDate(startDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Check-out (Was)</span>
            <span class="info-value">${formatDate(endDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nights</span>
            <span class="info-value">${finalPrice.numberOfNights} Night${finalPrice.numberOfNights > 1 ? 's' : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guests</span>
            <span class="info-value">${guests.adults} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Room Type</span>
            <span class="info-value">${room.roomName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Number of Rooms</span>
            <span class="info-value">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <!-- Property Information -->
      <div class="section">
        <h2 class="section-title">Property Information</h2>
        <h3 style="font-size: 20px; margin-bottom: 10px;">${property.propertyName}</h3>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
          <div style="font-weight: 600; margin-bottom: 8px;">📍 Address</div>
          <div>${propertyAddress.addressLine1}</div>
          ${propertyAddress.addressLine2 ? `<div>${propertyAddress.addressLine2}</div>` : ''}
          <div>${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
          <div>${propertyAddress.country}</div>
        </div>

        <div style="margin-top: 20px;">
          <div style="margin-bottom: 8px;">📞 <strong>Phone:</strong> ${property.propertyContact}</div>
      <div>📧 <strong>Email:</strong> ${property.propertyEmail}</div>
        </div>
      </div>
      <!-- Cancelled Amount Summary -->
${reservation.refundAmount && `  
  <div class="section">
    <h2 class="section-title">Refund Amount</h2>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #28a745;">
        <span>Total Refund</span>
        <span>${formatCurrency(reservation.refundAmount, reservation.currency)}</span>
      </div>
    </div>
  </div>
  `
    }
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Want to book again? <a href="https://bookings.revchilltech.com/my-trip/">Browse available rooms</a></p>
      <p style="margin-top: 10px;">Questions about your cancellation? Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated cancellation confirmation. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};


// Export all templates
export const EmailTemplates = {
  BookingConfirmation: BookingConfirmationEmail,
  BookingAmendment: BookingAmendmentEmail,
  BookingCancellation: BookingCancellationEmail,
};