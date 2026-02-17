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

// Utility function to format short date
const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getMapUrl = (latitude: number, longitude: number): string => {
  return `https://maps.google.com/?q=${latitude},${longitude}&z=15&output=embed`;
};

export const BookingConfirmationEmail = ({
  reservation,
  property,
  propertyAddress,
  room
}: EmailTemplateProps): string => {
  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${property.propertyName}</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa; 
      color: #212529;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper { 
      background-color: #f8f9fa;
      padding: 20px 0;
    }
    
    .container { 
      max-width: 680px; 
      margin: 0 auto; 
      background: #ffffff; 
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    /* Header Styles */
    .header { 
      background: #ffffff;
      padding: 30px 40px;
      border-bottom: 3px solid #0066cc;
    }
    
    .property-logo {
      font-size: 24px;
      font-weight: 700;
      color: #0066cc;
      margin-bottom: 8px;
    }
    
    .confirmation-title {
      font-size: 32px;
      font-weight: 700;
      color: #212529;
      margin-bottom: 8px;
    }
    
    .confirmation-subtitle {
      font-size: 16px;
      color: #6c757d;
    }
    
    .booking-number {
      display: inline-block;
      background: #e7f3ff;
      color: #0066cc;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 16px;
      font-size: 14px;
    }
    
    /* Content Styles */
    .content { 
      padding: 0;
    }
    
    .section { 
      padding: 32px 40px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      background: #e7f3ff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-right: 12px;
    }
    
    .section-title { 
      font-size: 20px; 
      font-weight: 700; 
      color: #212529;
      margin: 0;
    }
    
    /* Date Card Styles */
    .date-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .date-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .date-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6c757d;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .date-day {
      font-size: 28px;
      font-weight: 700;
      color: #0066cc;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .date-month-year {
      font-size: 14px;
      color: #495057;
      font-weight: 500;
    }
    
    .date-weekday {
      font-size: 13px;
      color: #6c757d;
      margin-top: 4px;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 24px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 13px;
      color: #6c757d;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #212529;
    }
    
    .info-item-full {
      grid-column: 1 / -1;
    }
    
    /* Guest Card */
    .guest-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
    }
    
    .guest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .guest-name {
      font-weight: 700;
      font-size: 17px;
      color: #212529;
    }
    
    .guest-badge {
      display: inline-block;
      background: #0066cc;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .guest-contact {
      font-size: 14px;
      color: #6c757d;
      margin-top: 4px;
    }
    
    .guest-contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    
    /* Property Image */
    .property-image-container {
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .property-image {
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
    }
    
    .property-name {
      font-size: 24px;
      font-weight: 700;
      color: #212529;
      margin-bottom: 8px;
    }
    
    .property-description {
      font-size: 15px;
      color: #6c757d;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    /* Address Block */
    .address-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .address-title {
      font-weight: 700;
      font-size: 14px;
      color: #212529;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .address-line {
      font-size: 14px;
      color: #495057;
      line-height: 1.6;
    }
    
    .landmark {
      font-style: italic;
      color: #6c757d;
      margin-top: 8px;
    }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    
    .contact-item {
      font-size: 14px;
      color: #495057;
      display: flex;
      align-items: center;
    }
    
    .contact-item strong {
      font-weight: 600;
      margin-right: 4px;
    }
    
    /* Map */
    .map-container {
      margin-top: 20px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .map-iframe {
      width: 100%;
      height: 300px;
      display: block;
      border: 0;
    }
    
    /* Price Table */
    .price-table {
      width: 100%;
      margin-top: 20px;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #e9ecef;
    }
    
    .price-row:last-child {
      border-bottom: none;
    }
    
    .price-label {
      font-size: 14px;
      color: #495057;
      font-weight: 500;
    }
    
    .price-value {
      font-size: 15px;
      font-weight: 600;
      color: #212529;
    }
    
    .price-row-subtotal {
      padding-top: 16px;
      margin-top: 8px;
      border-top: 1px solid #dee2e6;
    }
    
    .price-row-total {
      background: #e7f3ff;
      margin: 16px -20px -20px -20px;
      padding: 20px;
      border-top: 2px solid #0066cc;
    }
    
    .price-row-total .price-label {
      font-size: 17px;
      font-weight: 700;
      color: #0066cc;
    }
    
    .price-row-total .price-value {
      font-size: 24px;
      font-weight: 700;
      color: #0066cc;
    }
    
    .price-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .discount-row {
      color: #28a745 !important;
    }
    
    .discount-row .price-label,
    .discount-row .price-value {
      color: #28a745;
    }
    
    /* Important Notes */
    .notes-box {
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 4px;
      margin-top: 24px;
    }
    
    .notes-title {
      font-weight: 700;
      font-size: 15px;
      color: #212529;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .notes-list {
      margin: 0;
      padding-left: 20px;
    }
    
    .notes-list li {
      font-size: 14px;
      color: #495057;
      line-height: 1.8;
      margin-bottom: 6px;
    }
    
    /* Call to Action */
    .cta-section {
      background: #f8f9fa;
      text-align: center;
      padding: 32px 40px;
    }
    
    .cta-button {
      display: inline-block;
      background: #0066cc;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin-top: 8px;
      transition: background 0.3s ease;
    }
    
    .cta-button:hover {
      background: #0052a3;
    }
    
    .cta-text {
      font-size: 15px;
      color: #495057;
      margin-bottom: 8px;
    }
    
    /* Footer */
    .footer {
      background: #f8f9fa;
      padding: 32px 40px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    
    .footer-links {
      margin-bottom: 16px;
    }
    
    .footer a {
      color: #0066cc;
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .footer-note {
      margin-top: 16px;
      font-size: 12px;
      color: #adb5bd;
      line-height: 1.5;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container { 
        margin: 0;
        border-radius: 0;
      }
      
      .header,
      .section,
      .cta-section,
      .footer {
        padding: 24px 20px;
      }
      
      .confirmation-title {
        font-size: 26px;
      }
      
      .date-cards,
      .info-grid,
      .contact-info {
        grid-template-columns: 1fr;
      }
      
      .date-card {
        padding: 16px;
      }
      
      .property-name {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="property-logo">${property.propertyName}</div>
        <h1 class="confirmation-title">Booking Confirmed</h1>
        <p class="confirmation-subtitle">Thank you for your reservation</p>
        ${reservation.bookingCode ? `<div class="booking-number">Booking #${reservation.bookingCode}</div>` : ''}
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Reservation Summary -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📅</div>
            <h2 class="section-title">Reservation Summary</h2>
          </div>
          
          <div class="date-cards">
            <div class="date-card">
              <div class="date-label">Check-in</div>
              <div class="date-day">${new Date(startDate).getDate()}</div>
              <div class="date-month-year">${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
            
            <div class="date-card">
              <div class="date-label">Check-out</div>
              <div class="date-day">${new Date(endDate).getDate()}</div>
              <div class="date-month-year">${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(endDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Duration</span>
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

        <!-- Guest Details -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h2 class="section-title">Guest Information</h2>
          </div>
          
          <div class="guest-card">
            <div class="guest-header">
              <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
              <span class="guest-badge">Primary Guest</span>
            </div>
            ${primaryGuest.email || primaryGuest.phone ? `
            <div class="guest-contact">
              ${primaryGuest.email ? `<div class="guest-contact-item">📧 ${primaryGuest.email}</div>` : ''}
              ${primaryGuest.phone ? `<div class="guest-contact-item">📱 ${primaryGuest.phone}</div>` : ''}
            </div>
            ` : ''}
          </div>
          
          ${guestDetails.slice(1).map((guest: IGuestDetail) => `
            <div class="guest-card">
              <div class="guest-header">
                <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
                <span class="guest-badge">${guest.type}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Property Information -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">🏨</div>
            <h2 class="section-title">Property Details</h2>
          </div>
          
          ${property.image && property.image[0] ? `
          <div class="property-image-container">
            <img src="${property.image[0]}" alt="${property.propertyName}" class="property-image">
          </div>
          ` : ''}
          
          <h3 class="property-name">${property.propertyName}</h3>
          ${property.description ? `<p class="property-description">${property.description}</p>` : ''}
          
          <div class="address-card">
            <div class="address-title">📍 Location</div>
            <div class="address-line">${propertyAddress.addressLine1}</div>
            ${propertyAddress.addressLine2 ? `<div class="address-line">${propertyAddress.addressLine2}</div>` : ''}
            <div class="address-line">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
            <div class="address-line">${propertyAddress.country}</div>
            ${propertyAddress.landmark ? `<div class="address-line landmark">Near ${propertyAddress.landmark}</div>` : ''}
          </div>
          
          <div class="contact-info">
            <div class="contact-item">
              <strong>📞</strong> ${property.propertyContact}
            </div>
            <div class="contact-item">
              <strong>📧</strong> ${property.propertyEmail}
            </div>
          </div>
          
          <div class="map-container">
            <iframe 
              src="${getMapUrl(propertyAddress.latitude, propertyAddress.longitude)}" 
              class="map-iframe"
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Price Details</h2>
          </div>
          
          <div class="price-card">
            <div class="price-table">
              <div class="price-row">
                <span class="price-label">Room rate (${finalPrice.numberOfNights} night${finalPrice.numberOfNights > 1 ? 's' : ''})</span>
                <span class="price-value">${formatCurrency(finalPrice.breakdown.totalBaseAmount, reservation.currency)}</span>
              </div>
              
              ${finalPrice.breakdown.totalAdditionalCharges > 0 ? `
              <div class="price-row">
                <span class="price-label">Additional guest charges</span>
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
                <span class="price-label">${tax.name}</span>
                <span class="price-value">${formatCurrency(tax.amount, reservation.currency)}</span>
              </div>
              `).join('')}
              
              ${finalPrice.promotions && finalPrice.promotions.totalDiscount > 0 ? `
              <div class="price-row discount-row">
                <span class="price-label">Discount</span>
                <span class="price-value">-${formatCurrency(finalPrice.promotions.totalDiscount, reservation.currency)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="price-row-total">
              <span class="price-label">Total Amount</span>
              <span class="price-value">${formatCurrency(finalPrice.totalAmount, reservation.currency)}</span>
            </div>
          </div>
          
          <div class="notes-box">
            <div class="notes-title">📋 Important Information</div>
            <ul class="notes-list">
              <li>Please bring a valid government-issued photo ID at check-in</li>
              <li>Payment method: ${reservation.paymentMethod.split("_").map((txt) => capitalizeFirstLetter(txt)).join(" ")}</li>
            </ul>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section">
          <p class="cta-text">Need to make changes to your reservation?</p>
          <a href="https://bookings.revchilltech.com/my-trip/" class="cta-button">Manage Booking</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-links">
          <p>Questions about your reservation?</p>
          <p style="margin-top: 8px;">Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a> or call ${property.propertyContact}</p>
        </div>
        
        <div class="footer-note">
          This is an automated confirmation email from ${property.propertyName}.<br>
          Please do not reply directly to this message.
        </div>
      </div>
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
  <title>Booking Updated - ${property.propertyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa; 
      color: #212529;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper { background-color: #f8f9fa; padding: 20px 0; }
    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #ffffff; padding: 30px 40px; border-bottom: 3px solid #ff6b35; }
    .property-logo { font-size: 24px; font-weight: 700; color: #ff6b35; margin-bottom: 8px; }
    .confirmation-title { font-size: 32px; font-weight: 700; color: #212529; margin-bottom: 8px; }
    .confirmation-subtitle { font-size: 16px; color: #6c757d; }
    .booking-number { display: inline-block; background: #ffe8df; color: #ff6b35; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 16px; font-size: 14px; }
    .content { padding: 0; }
    .section { padding: 32px 40px; border-bottom: 1px solid #e9ecef; }
    .section:last-child { border-bottom: none; }
    .section-header { display: flex; align-items: center; margin-bottom: 20px; }
    .section-icon { width: 40px; height: 40px; background: #ffe8df; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 12px; }
    .section-title { font-size: 20px; font-weight: 700; color: #212529; margin: 0; }
    .amendment-notice { background: #e7f3ff; border-left: 4px solid #0066cc; padding: 20px; border-radius: 4px; margin-bottom: 24px; }
    .amendment-notice-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 8px; display: flex; align-items: center; }
    .amendment-notice-text { font-size: 14px; color: #495057; line-height: 1.6; }
    .date-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .date-card { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
    .date-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; font-weight: 600; margin-bottom: 8px; }
    .date-day { font-size: 28px; font-weight: 700; color: #ff6b35; line-height: 1; margin-bottom: 4px; }
    .date-month-year { font-size: 14px; color: #495057; font-weight: 500; }
    .date-weekday { font-size: 13px; color: #6c757d; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 13px; color: #6c757d; font-weight: 500; margin-bottom: 4px; }
    .info-value { font-size: 16px; font-weight: 600; color: #212529; }
    .guest-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 12px; }
    .guest-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .guest-name { font-weight: 700; font-size: 17px; color: #212529; }
    .guest-badge { display: inline-block; background: #ff6b35; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px; }
    .guest-contact { font-size: 14px; color: #6c757d; margin-top: 4px; }
    .guest-contact-item { display: flex; align-items: center; margin-bottom: 4px; }
    .property-image-container { margin-bottom: 24px; border-radius: 8px; overflow: hidden; }
    .property-image { width: 100%; height: 280px; object-fit: cover; display: block; }
    .property-name { font-size: 24px; font-weight: 700; color: #212529; margin-bottom: 8px; }
    .property-description { font-size: 15px; color: #6c757d; line-height: 1.6; margin-bottom: 20px; }
    .address-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .address-title { font-weight: 700; font-size: 14px; color: #212529; margin-bottom: 12px; display: flex; align-items: center; }
    .address-line { font-size: 14px; color: #495057; line-height: 1.6; }
    .landmark { font-style: italic; color: #6c757d; margin-top: 8px; }
    .contact-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
    .contact-item { font-size: 14px; color: #495057; display: flex; align-items: center; }
    .contact-item strong { font-weight: 600; margin-right: 4px; }
    .map-container { margin-top: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #e9ecef; }
    .map-iframe { width: 100%; height: 300px; display: block; border: 0; }
    .price-table { width: 100%; margin-top: 20px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #e9ecef; }
    .price-row:last-child { border-bottom: none; }
    .price-label { font-size: 14px; color: #495057; font-weight: 500; }
    .price-value { font-size: 15px; font-weight: 600; color: #212529; }
    .price-row-total { background: #ffe8df; margin: 16px -20px -20px -20px; padding: 20px; border-top: 2px solid #ff6b35; }
    .price-row-total .price-label { font-size: 17px; font-weight: 700; color: #ff6b35; }
    .price-row-total .price-value { font-size: 24px; font-weight: 700; color: #ff6b35; }
    .price-card { background: #f8f9fa; border-radius: 8px; padding: 20px; }
    .discount-row { color: #28a745 !important; }
    .discount-row .price-label, .discount-row .price-value { color: #28a745; }
    .notes-box { background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin-top: 24px; }
    .notes-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 12px; display: flex; align-items: center; }
    .notes-list { margin: 0; padding-left: 20px; }
    .notes-list li { font-size: 14px; color: #495057; line-height: 1.8; margin-bottom: 6px; }
    .cta-section { background: #f8f9fa; text-align: center; padding: 32px 40px; }
    .cta-button { display: inline-block; background: #ff6b35; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 8px; transition: background 0.3s ease; }
    .cta-button:hover { background: #e55a28; }
    .cta-text { font-size: 15px; color: #495057; margin-bottom: 8px; }
    .footer { background: #f8f9fa; padding: 32px 40px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #e9ecef; }
    .footer-links { margin-bottom: 16px; }
    .footer a { color: #ff6b35; text-decoration: none; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    .footer-note { margin-top: 16px; font-size: 12px; color: #adb5bd; line-height: 1.5; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .section, .cta-section, .footer { padding: 24px 20px; }
      .confirmation-title { font-size: 26px; }
      .date-cards, .info-grid, .contact-info { grid-template-columns: 1fr; }
      .date-card { padding: 16px; }
      .property-name { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="property-logo">${property.propertyName}</div>
        <h1 class="confirmation-title">Booking Updated</h1>
        <p class="confirmation-subtitle">Your reservation has been modified</p>
        ${reservation.bookingCode ? `<div class="booking-number">Booking #${reservation.bookingCode}</div>` : ''}
      </div>

      <div class="content">
        <div class="section">
          <div class="amendment-notice">
            <div class="amendment-notice-title">ℹ️ Your booking has been updated</div>
            <div class="amendment-notice-text">
              Your booking details have been successfully modified as per your request. Please review the updated information below.
            </div>
          </div>
          
          <div class="section-header">
            <div class="section-icon">📅</div>
            <h2 class="section-title">Updated Reservation Summary</h2>
          </div>
          
          <div class="date-cards">
            <div class="date-card">
              <div class="date-label">Check-in</div>
              <div class="date-day">${new Date(startDate).getDate()}</div>
              <div class="date-month-year">${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
            <div class="date-card">
              <div class="date-label">Check-out</div>
              <div class="date-day">${new Date(endDate).getDate()}</div>
              <div class="date-month-year">${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(endDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Duration</span>
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

        <div class="section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h2 class="section-title">Guest Information</h2>
          </div>
          <div class="guest-card">
            <div class="guest-header">
              <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
              <span class="guest-badge">Primary Guest</span>
            </div>
            ${primaryGuest.email || primaryGuest.phone ? `
            <div class="guest-contact">
              ${primaryGuest.email ? `<div class="guest-contact-item">📧 ${primaryGuest.email}</div>` : ''}
              ${primaryGuest.phone ? `<div class="guest-contact-item">📱 ${primaryGuest.phone}</div>` : ''}
            </div>
            ` : ''}
          </div>
          ${guestDetails.slice(1).map((guest: IGuestDetail) => `
            <div class="guest-card">
              <div class="guest-header">
                <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
                <span class="guest-badge">${guest.type}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-header">
            <div class="section-icon">🏨</div>
            <h2 class="section-title">Property Details</h2>
          </div>
          ${property.image && property.image[0] ? `
          <div class="property-image-container">
            <img src="${property.image[0]}" alt="${property.propertyName}" class="property-image">
          </div>
          ` : ''}
          <h3 class="property-name">${property.propertyName}</h3>
          ${property.description ? `<p class="property-description">${property.description}</p>` : ''}
          <div class="address-card">
            <div class="address-title">📍 Location</div>
            <div class="address-line">${propertyAddress.addressLine1}</div>
            ${propertyAddress.addressLine2 ? `<div class="address-line">${propertyAddress.addressLine2}</div>` : ''}
            <div class="address-line">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
            <div class="address-line">${propertyAddress.country}</div>
            ${propertyAddress.landmark ? `<div class="address-line landmark">Near ${propertyAddress.landmark}</div>` : ''}
          </div>
          <div class="contact-info">
            <div class="contact-item"><strong>📞</strong> ${property.propertyContact}</div>
            <div class="contact-item"><strong>📧</strong> ${property.propertyEmail}</div>
          </div>
          <div class="map-container">
            <iframe src="${getMapUrl(propertyAddress.latitude, propertyAddress.longitude)}" class="map-iframe" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Updated Price Details</h2>
          </div>
          <div class="price-card">
            <div class="price-table">
              <div class="price-row">
                <span class="price-label">Room rate (${finalPrice.numberOfNights} night${finalPrice.numberOfNights > 1 ? 's' : ''})</span>
                <span class="price-value">${formatCurrency(finalPrice.breakdown.totalBaseAmount, reservation.currency)}</span>
              </div>
              ${finalPrice.breakdown.totalAdditionalCharges > 0 ? `
              <div class="price-row">
                <span class="price-label">Additional guest charges</span>
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
                <span class="price-label">${tax.name}</span>
                <span class="price-value">${formatCurrency(tax.amount, reservation.currency)}</span>
              </div>
              `).join('')}
              ${finalPrice.promotions && finalPrice.promotions.totalDiscount > 0 ? `
              <div class="price-row discount-row">
                <span class="price-label">Discount</span>
                <span class="price-value">-${formatCurrency(finalPrice.promotions.totalDiscount, reservation.currency)}</span>
              </div>
              ` : ''}
            </div>
            <div class="price-row-total">
              <span class="price-label">Total Amount</span>
              <span class="price-value">${formatCurrency(finalPrice.totalAmount, reservation.currency)}</span>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <p class="cta-text">Need further changes?</p>
          <a href="https://bookings.revchilltech.com/my-trip/" class="cta-button">Manage Booking</a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-links">
          <p>Questions about your reservation?</p>
          <p style="margin-top: 8px;">Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a> or call ${property.propertyContact}</p>
        </div>
        <div class="footer-note">
          This is an automated confirmation email from ${property.propertyName}.<br>
          Please do not reply directly to this message.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// ==================== BOOKING CANCELLATION EMAIL ====================
export const BookingCancellationEmail = ({
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
  <title>Booking Cancelled - ${property.propertyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa; 
      color: #212529;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper { background-color: #f8f9fa; padding: 20px 0; }
    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #ffffff; padding: 30px 40px; border-bottom: 3px solid #6c757d; }
    .property-logo { font-size: 24px; font-weight: 700; color: #6c757d; margin-bottom: 8px; }
    .confirmation-title { font-size: 32px; font-weight: 700; color: #212529; margin-bottom: 8px; }
    .confirmation-subtitle { font-size: 16px; color: #6c757d; }
    .cancelled-badge { display: inline-block; background: #dc3545; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .booking-number { display: inline-block; background: #e9ecef; color: #6c757d; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 16px; font-size: 14px; margin-left: 8px; }
    .content { padding: 0; }
    .section { padding: 32px 40px; border-bottom: 1px solid #e9ecef; }
    .section:last-child { border-bottom: none; }
    .section-header { display: flex; align-items: center; margin-bottom: 20px; }
    .section-icon { width: 40px; height: 40px; background: #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 12px; }
    .section-title { font-size: 20px; font-weight: 700; color: #212529; margin: 0; }
    .cancellation-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin-bottom: 24px; }
    .cancellation-notice-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 8px; display: flex; align-items: center; }
    .cancellation-notice-text { font-size: 14px; color: #495057; line-height: 1.6; }
    .refund-notice { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px; margin-top: 16px; }
    .refund-notice-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 8px; display: flex; align-items: center; }
    .refund-amount { font-size: 24px; font-weight: 700; color: #28a745; margin-top: 8px; }
    .date-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .date-card { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; opacity: 0.7; }
    .date-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; font-weight: 600; margin-bottom: 8px; }
    .date-day { font-size: 28px; font-weight: 700; color: #6c757d; line-height: 1; margin-bottom: 4px; text-decoration: line-through; }
    .date-month-year { font-size: 14px; color: #495057; font-weight: 500; }
    .date-weekday { font-size: 13px; color: #6c757d; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 13px; color: #6c757d; font-weight: 500; margin-bottom: 4px; }
    .info-value { font-size: 16px; font-weight: 600; color: #495057; }
    .guest-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 12px; }
    .guest-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .guest-name { font-weight: 700; font-size: 17px; color: #212529; }
    .guest-badge { display: inline-block; background: #6c757d; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px; }
    .guest-contact { font-size: 14px; color: #6c757d; margin-top: 4px; }
    .guest-contact-item { display: flex; align-items: center; margin-bottom: 4px; }
    .property-name { font-size: 24px; font-weight: 700; color: #212529; margin-bottom: 8px; }
    .address-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px; margin-top: 20px; }
    .address-title { font-weight: 700; font-size: 14px; color: #212529; margin-bottom: 12px; display: flex; align-items: center; }
    .address-line { font-size: 14px; color: #495057; line-height: 1.6; }
    .contact-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
    .contact-item { font-size: 14px; color: #495057; display: flex; align-items: center; }
    .contact-item strong { font-weight: 600; margin-right: 4px; }
    .cta-section { background: #f8f9fa; text-align: center; padding: 32px 40px; }
    .cta-button { display: inline-block; background: #6c757d; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 8px; transition: background 0.3s ease; }
    .cta-button:hover { background: #5a6268; }
    .cta-text { font-size: 15px; color: #495057; margin-bottom: 8px; }
    .footer { background: #f8f9fa; padding: 32px 40px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #e9ecef; }
    .footer-links { margin-bottom: 16px; }
    .footer a { color: #6c757d; text-decoration: none; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    .footer-note { margin-top: 16px; font-size: 12px; color: #adb5bd; line-height: 1.5; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .section, .cta-section, .footer { padding: 24px 20px; }
      .confirmation-title { font-size: 26px; }
      .date-cards, .info-grid, .contact-info { grid-template-columns: 1fr; }
      .date-card { padding: 16px; }
      .property-name { font-size: 20px; }
      .booking-number { margin-left: 0; margin-top: 8px; display: block; width: fit-content; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="property-logo">${property.propertyName}</div>
        <h1 class="confirmation-title">Booking Cancelled</h1>
        <p class="confirmation-subtitle">Your reservation has been cancelled</p>
        <div>
          <span class="cancelled-badge">CANCELLED</span>
          ${reservation.bookingCode ? `<span class="booking-number">Booking #${reservation.bookingCode}</span>` : ''}
        </div>
      </div>

      <div class="content">
        <div class="section">
          <div class="cancellation-notice">
            <div class="cancellation-notice-title">⚠️ Cancellation Confirmed</div>
            <div class="cancellation-notice-text">
              We're sorry to see you go. Your booking at ${property.propertyName} has been successfully cancelled. 
              We hope to welcome you in the future.
            </div>
          </div>
          
          ${reservation.refundAmount ? `
          <div class="refund-notice">
            <div class="refund-notice-title">💰 Refund Information</div>
            <div class="cancellation-notice-text">
              Your refund is being processed and will be credited to your original payment method within 5-7 business days.
            </div>
            <div class="refund-amount">${formatCurrency(reservation.refundAmount, reservation.currency)}</div>
          </div>
          ` : ''}
          
          <div class="section-header" style="margin-top: 24px;">
            <div class="section-icon">📅</div>
            <h2 class="section-title">Cancelled Reservation</h2>
          </div>
          
          <div class="date-cards">
            <div class="date-card">
              <div class="date-label">Check-in (Was)</div>
              <div class="date-day">${new Date(startDate).getDate()}</div>
              <div class="date-month-year">${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
            <div class="date-card">
              <div class="date-label">Check-out (Was)</div>
              <div class="date-day">${new Date(endDate).getDate()}</div>
              <div class="date-month-year">${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(endDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Duration</span>
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

        <div class="section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h2 class="section-title">Guest Information</h2>
          </div>
          <div class="guest-card">
            <div class="guest-header">
              <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
              <span class="guest-badge">Primary Guest</span>
            </div>
            ${primaryGuest.email || primaryGuest.phone ? `
            <div class="guest-contact">
              ${primaryGuest.email ? `<div class="guest-contact-item">📧 ${primaryGuest.email}</div>` : ''}
              ${primaryGuest.phone ? `<div class="guest-contact-item">📱 ${primaryGuest.phone}</div>` : ''}
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <div class="section-icon">🏨</div>
            <h2 class="section-title">Property Information</h2>
          </div>
          <h3 class="property-name">${property.propertyName}</h3>
          <div class="address-card">
            <div class="address-title">📍 Location</div>
            <div class="address-line">${propertyAddress.addressLine1}</div>
            ${propertyAddress.addressLine2 ? `<div class="address-line">${propertyAddress.addressLine2}</div>` : ''}
            <div class="address-line">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
            <div class="address-line">${propertyAddress.country}</div>
          </div>
          <div class="contact-info">
            <div class="contact-item"><strong>📞</strong> ${property.propertyContact}</div>
            <div class="contact-item"><strong>📧</strong> ${property.propertyEmail}</div>
          </div>
        </div>

        <div class="cta-section">
          <p class="cta-text">Changed your mind?</p>
          <a href="https://bookings.revchilltech.com/my-trip/" class="cta-button">Book Again</a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-links">
          <p>Questions about your cancellation?</p>
          <p style="margin-top: 8px;">Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a> or call ${property.propertyContact}</p>
        </div>
        <div class="footer-note">
          This is an automated cancellation confirmation from ${property.propertyName}.<br>
          Please do not reply directly to this message.
        </div>
      </div>
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