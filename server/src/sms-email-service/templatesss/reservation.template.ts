import { IBookingDetails, IGuestDetail } from "../../pms/frontoffice/reservation/types";
import { CurrencyCode } from "../../tax-system/interfaces";
import { capitalizeFirstLetter } from "../utils/capitalizefirstLetter.util";
 
interface PropertyDetails {
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  description: string;
  image: string[];
  propertyCode: string;
  starRating?: number | null;
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
  image?: string[];
  description?: string;
}
 
interface CancellationPolicy {
  refundPercentage?: number;   // e.g. 100 = full refund
  deadlineDate?: string;       // ISO string
  description?: string;
}
 
interface DepositPolicy {
  depositPercentage?: number;  // e.g. 30 = 30% upfront
  description?: string;
}
 
interface RatePlanPolicies {
  cancellationPolicy?: CancellationPolicy | null;
  depositPolicy?: DepositPolicy | null;
}
 
interface EmailTemplateProps {
  reservation: IBookingDetails;
  property: PropertyDetails;
  propertyAddress: PropertyAddress;
  room: RoomDetails;
  policies?: RatePlanPolicies;
}
 
// ─── Utilities ────────────────────────────────────────────────
 
const RC_TEAL = "#00b5c8";
const RC_TEAL_DARK = "#0096a8";
const RC_TEAL_LIGHT = "#e6f9fb";
 
const formatCurrency = (amount: number, currency: CurrencyCode): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
 
const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
 
const getDay = (d: string | Date) => new Date(d).getDate();
const getMonYr = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
const getWeekday = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long" });
 
const getMapUrl = (lat: number, lng: number) =>
  `https://maps.google.com/?q=${lat},${lng}&z=15&output=embed`;
 
const stars = (n: number | null | undefined) => {
  if (!n) return "";
  return "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "");
};
 
// ─── Shared CSS ───────────────────────────────────────────────
 
const baseCSS = (accentColor: string, accentDark: string, accentLight: string) => `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
    background:#f0f2f5;color:#1a1a2e;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{background:#f0f2f5;padding:20px 0}
  .container{max-width:640px;margin:0 auto;background:#fff;border-radius:10px;
    overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10)}
  /* header */
  .header{background:#0d1b2a;padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
  .logo img{height:28px;display:block}
  .status-badge{font-size:11px;font-weight:700;letter-spacing:1.2px;
    text-transform:uppercase;padding:5px 14px;border-radius:20px}
  /* hero */
  .hero{position:relative;height:200px;overflow:hidden}
  .hero-img{width:100%;height:100%;object-fit:cover;display:block}
  .hero-overlay{position:absolute;inset:0;
    background:linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.65) 100%)}
  .hero-content{position:absolute;bottom:0;left:0;right:0;padding:20px 32px}
  .hero-title{font-size:22px;font-weight:700;color:#fff;margin-bottom:4px}
  .hero-sub{font-size:13px;color:rgba(255,255,255,0.75)}
  .hero-stars{color:#f5c518;font-size:13px;margin-bottom:6px}
  /* booking meta */
  .meta-bar{background:#0d1b2a;padding:14px 32px;display:flex;gap:28px;flex-wrap:wrap}
  .meta-item label{display:block;font-size:10px;letter-spacing:1.2px;
    text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:3px}
  .meta-item span{font-size:13px;font-weight:600;color:#fff}
  .meta-item span.accent{color:${accentColor}}
  /* intro */
  .intro{padding:28px 32px 0;font-size:14px;color:#444;line-height:1.7}
  .intro strong{color:#1a1a2e}
  /* section */
  .section{padding:24px 32px;border-bottom:1px solid #eee}
  .section:last-child{border-bottom:none}
  .section-label{font-size:10px;font-weight:700;letter-spacing:1.8px;
    text-transform:uppercase;color:#aaa;margin-bottom:14px}
  /* dates */
  .dates-grid{display:grid;grid-template-columns:1fr 56px 1fr;gap:0;
    border:1px solid #e8e8e8;border-radius:10px;overflow:hidden}
  .date-box{padding:16px 18px}
  .date-box-label{font-size:10px;letter-spacing:1px;text-transform:uppercase;
    color:#aaa;margin-bottom:5px}
  .date-box-day{font-size:26px;font-weight:700;color:${accentColor};line-height:1}
  .date-box-myr{font-size:13px;font-weight:500;color:#333;margin-top:2px}
  .date-box-wday{font-size:12px;color:#888;margin-top:1px}
  .date-divider{display:flex;align-items:center;justify-content:center;
    flex-direction:column;border-left:1px solid #eee;border-right:1px solid #eee;
    background:#fafafa}
  .date-divider-nights{font-size:18px;font-weight:700;color:${accentColor}}
  .date-divider-label{font-size:10px;color:#aaa;margin-top:2px}
  /* info rows */
  .info-row{display:flex;justify-content:space-between;align-items:center;
    padding:10px 0;border-bottom:1px solid #f5f5f5}
  .info-row:last-child{border-bottom:none}
  .info-row-label{font-size:13px;color:#888}
  .info-row-value{font-size:13px;font-weight:600;color:#1a1a2e;text-align:right;max-width:60%}
  /* room card */
  .room-card{border:1px solid #e8e8e8;border-radius:10px;overflow:hidden}
  .room-img{width:100%;height:140px;object-fit:cover;display:block;background:#c8dce8}
  .room-info{padding:14px 18px}
  .room-name{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px}
  .room-sub{font-size:12px;color:#888;margin-bottom:10px}
  .tags{display:flex;gap:6px;flex-wrap:wrap}
  .tag{font-size:11px;background:#f0f2f5;border:1px solid #e4e4e4;
    color:#555;padding:3px 10px;border-radius:20px}
  /* guest list */
  .guest-item{display:flex;align-items:center;gap:12px;padding:10px 0;
    border-bottom:1px solid #f5f5f5}
  .guest-item:last-child{border-bottom:none}
  .guest-avatar{width:36px;height:36px;border-radius:50%;
    background:${accentLight};display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:700;color:${accentDark};flex-shrink:0}
  .guest-name{font-size:13px;font-weight:600;color:#1a1a2e}
  .guest-meta{font-size:11px;color:#aaa;margin-top:1px}
  .guest-primary-badge{font-size:10px;font-weight:700;letter-spacing:0.8px;
    text-transform:uppercase;background:${accentColor};color:#fff;
    padding:2px 8px;border-radius:10px;margin-left:8px}
  /* price table */
  .price-row{display:flex;justify-content:space-between;align-items:center;
    padding:9px 0;border-bottom:1px solid #f5f5f5;font-size:13px}
  .price-row:last-child{border-bottom:none}
  .price-row-label{color:#666}
  .price-row-val{font-weight:600;color:#1a1a2e}
  .price-row.discount .price-row-label,.price-row.discount .price-row-val{color:#16a34a}
  .price-row.paylater .price-row-label,.price-row.paylater .price-row-val{color:#ea580c}
  .price-divider{border:none;border-top:1px solid #ddd;margin:6px 0}
  .price-total-row{display:flex;justify-content:space-between;align-items:center;
    padding:12px 0 4px}
  .price-total-label{font-size:15px;font-weight:700;color:#1a1a2e}
  .price-total-val{font-size:18px;font-weight:700;color:${accentColor}}
  .pay-pill{display:flex;justify-content:space-between;align-items:center;
    background:${accentLight};border-radius:8px;padding:10px 14px;margin-top:10px}
  .pay-pill-label{font-size:12px;font-weight:700;color:${accentDark}}
  .pay-pill-val{font-size:13px;font-weight:700;color:${accentDark}}
  .paylater-pill{display:flex;justify-content:space-between;align-items:center;
    background:#fff7ed;border-radius:8px;padding:10px 14px;margin-top:8px}
  .paylater-pill-label{font-size:12px;font-weight:700;color:#ea580c}
  .paylater-pill-val{font-size:13px;font-weight:700;color:#ea580c}
  /* policy boxes */
  .policy-box{border-radius:8px;padding:14px 16px;margin-bottom:10px}
  .policy-box.cancel{background:#f0fdf4;border:1px solid #bbf7d0}
  .policy-box.deposit{background:#fefce8;border:1px solid #fde68a}
  .policy-box-title{font-size:12px;font-weight:700;margin-bottom:4px}
  .policy-box.cancel .policy-box-title{color:#15803d}
  .policy-box.deposit .policy-box-title{color:#92400e}
  .policy-box-text{font-size:12px;line-height:1.6}
  .policy-box.cancel .policy-box-text{color:#166534}
  .policy-box.deposit .policy-box-text{color:#78350f}
  /* action buttons */
  .actions-section{background:#f8f9fa;padding:28px 32px;
    display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
  .action-btn{display:inline-block;text-decoration:none;padding:12px 28px;
    border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.3px;text-align:center}
  .action-btn-primary{background:${accentColor};color:#fff}
  .action-btn-secondary{background:#fff;color:#555;border:1px solid #ddd}
  .action-btn-danger{background:#fff;color:#dc2626;border:1px solid #fecaca}
  /* map */
  .map-wrap{border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;margin-top:14px}
  .map-frame{width:100%;height:220px;display:block;border:0}
  /* footer */
  .footer{background:#f0f2f5;padding:24px 32px;text-align:center;
    font-size:12px;color:#aaa;border-top:1px solid #e8e8e8}
  .footer a{color:${accentColor};text-decoration:none}
  .footer-contact{font-size:13px;color:#666;margin-bottom:8px}
  /* notes */
  .notes-box{background:#fffbeb;border-left:3px solid #f59e0b;
    border-radius:4px;padding:14px 16px;margin-top:16px}
  .notes-box-title{font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px}
  .notes-box ul{padding-left:16px}
  .notes-box ul li{font-size:12px;color:#78350f;line-height:1.8}
  /* cancelled styles */
  .cancelled-badge{display:inline-block;background:#dc2626;color:#fff;
    padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;
    letter-spacing:1.2px;text-transform:uppercase}
  .refund-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
    padding:16px 20px;margin-top:12px}
  .refund-box-title{font-size:12px;font-weight:700;color:#15803d;margin-bottom:4px}
  .refund-amount{font-size:22px;font-weight:700;color:#15803d;margin-top:6px}
  .no-refund-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
    padding:16px 20px;margin-top:12px}
  .strikethrough{text-decoration:line-through;opacity:0.5}
  @media only screen and (max-width:600px){
    .container{border-radius:0}
    .header,.section,.meta-bar,.intro,.actions-section,.footer{padding-left:18px;padding-right:18px}
    .hero-content{padding:14px 18px}
    .dates-grid{grid-template-columns:1fr}
    .date-divider{display:none}
  }
`;
 
// ─── CONFIRMATION EMAIL ───────────────────────────────────────
 
export const BookingConfirmationEmail = ({
  reservation,
  property,
  propertyAddress,
  room,
  policies,
}: EmailTemplateProps): string => {
  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];
  const numberOfNights = reservation.numberOfNights || 1;
 
  const propertyHeroImg = property.image?.[0] || "";
  const roomImg = room.image?.[0] || "";
 
  const initials = (g: IGuestDetail) =>
    `${g.firstName[0] || ""}${g.lastName[0] || ""}`.toUpperCase();
 
  const guestTypeLabel = (g: IGuestDetail) => {
    if (g.type === "adult") return "Adult";
    if (g.type === "child") return "Child";
    return "Infant";
  };
 
  const cancellationBlock = (): string => {
    if (!policies?.cancellationPolicy) return "";
    const cp = policies.cancellationPolicy;
    if (cp.description) {
      return `<div class="policy-box cancel">
        <div class="policy-box-title">✓ Cancellation Policy</div>
        <div class="policy-box-text">${cp.description}</div>
      </div>`;
    }
    if (cp.refundPercentage !== undefined && cp.deadlineDate) {
      return `<div class="policy-box cancel">
        <div class="policy-box-title">✓ Free Cancellation</div>
        <div class="policy-box-text">
          Get a ${cp.refundPercentage}% refund if you cancel before
          <strong>${formatDate(cp.deadlineDate)}</strong>.
        </div>
      </div>`;
    }
    return "";
  };
 
  const depositBlock = (): string => {
    if (!policies?.depositPolicy) return "";
    const dp = policies.depositPolicy;
    if (dp.description) {
      return `<div class="policy-box deposit">
        <div class="policy-box-title">⚡ Deposit Required</div>
        <div class="policy-box-text">${dp.description}</div>
      </div>`;
    }
    if (dp.depositPercentage !== undefined) {
      return `<div class="policy-box deposit">
        <div class="policy-box-title">⚡ Deposit Required</div>
        <div class="policy-box-text">
          A deposit of <strong>${dp.depositPercentage}%</strong> of the total amount
          is required to secure your booking.
        </div>
      </div>`;
    }
    return "";
  };
 
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Booking Confirmed – ${property.propertyName}</title>
<style>${baseCSS(RC_TEAL, RC_TEAL_DARK, RC_TEAL_LIGHT)}</style>
</head>
<body>
<div class="wrap">
<div class="container">
 
  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="https://bookings.revchilltech.com/revchill-logo.png" alt="RevChill" />
    </div>
    <span class="status-badge" style="background:#00b5c8;color:#fff;">✓ Confirmed</span>
  </div>
 
  <!-- PROPERTY HERO (property image as background) -->
  <div class="hero">
    ${propertyHeroImg
      ? `<img src="${propertyHeroImg}" alt="${property.propertyName}" class="hero-img" />`
      : `<div class="hero-img" style="background:linear-gradient(135deg,#0d1b2a,#0096a8)"></div>`}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      ${property.starRating ? `<div class="hero-stars">${stars(property.starRating)}</div>` : ""}
      <div class="hero-title">${property.propertyName}</div>
      <div class="hero-sub">${propertyAddress.city}, ${propertyAddress.state} · ${propertyAddress.country}</div>
    </div>
  </div>
 
  <!-- BOOKING META BAR -->
  <div class="meta-bar">
    ${reservation.bookingCode ? `<div class="meta-item"><label>Booking ID</label><span class="accent">${reservation.bookingCode}</span></div>` : ""}
    ${reservation.bookedAt ? `<div class="meta-item"><label>Booked On</label><span>${formatDate(reservation.bookedAt)}</span></div>` : ""}
    <div class="meta-item"><label>Payment</label><span>${reservation.paymentMethod.split("_").map(capitalizeFirstLetter).join(" ")}</span></div>
    <div class="meta-item"><label>Source</label><span>${capitalizeFirstLetter(reservation.bookingSource)}</span></div>
  </div>
 
  <!-- INTRO -->
  <div class="intro">
    <p>Hi <strong>${primaryGuest.firstName} ${primaryGuest.lastName}</strong>,</p>
    <p style="margin-top:8px;">Your booking is <strong>confirmed</strong>. Please find your complete reservation details below. We look forward to welcoming you.</p>
  </div>
 
  <!-- STAY DATES -->
  <div class="section">
    <div class="section-label">Stay Details</div>
    <div class="dates-grid">
      <div class="date-box">
        <div class="date-box-label">Check-in</div>
        <div class="date-box-day">${getDay(startDate)}</div>
        <div class="date-box-myr">${getMonYr(startDate)}</div>
        <div class="date-box-wday">${getWeekday(startDate)}</div>
        <div style="font-size:11px;color:#aaa;margin-top:6px;">After 2:00 PM</div>
      </div>
      <div class="date-divider">
        <div class="date-divider-nights">${numberOfNights}</div>
        <div class="date-divider-label">night${numberOfNights > 1 ? "s" : ""}</div>
      </div>
      <div class="date-box">
        <div class="date-box-label">Check-out</div>
        <div class="date-box-day">${getDay(endDate)}</div>
        <div class="date-box-myr">${getMonYr(endDate)}</div>
        <div class="date-box-wday">${getWeekday(endDate)}</div>
        <div style="font-size:11px;color:#aaa;margin-top:6px;">Before 12:00 PM</div>
      </div>
    </div>
    <div style="margin-top:14px;">
      <div class="info-row">
        <span class="info-row-label">Guests</span>
        <span class="info-row-value">${guests.adults} Adult${guests.adults > 1 ? "s" : ""}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Rooms</span>
        <span class="info-row-value">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? "s" : ""}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Rate Plan</span>
        <span class="info-row-value">${reservation.ratePlanCode}</span>
      </div>
    </div>
  </div>
 
  <!-- ROOM -->
  <div class="section">
    <div class="section-label">Room</div>
    <div class="room-card">
      ${roomImg
        ? `<img src="${roomImg}" alt="${room.roomName}" class="room-img" />`
        : `<div class="room-img" style="background:linear-gradient(135deg,#b8cce0,#7aadc8);display:flex;align-items:center;justify-content:center;font-size:32px;">🛏</div>`}
      <div class="room-info">
        <div class="room-name">${room.roomName}</div>
        <div class="room-sub">${room.roomType}${room.roomView ? ` · ${room.roomView} view` : ""}${room.maxOccupancy ? ` · Max ${room.maxOccupancy} guests` : ""}</div>
        ${room.description ? `<div style="font-size:12px;color:#777;margin-bottom:10px;line-height:1.6">${room.description}</div>` : ""}
        <div class="tags">
          <span class="tag">Room Only</span>
          ${room.maxOccupancy ? `<span class="tag">Up to ${room.maxOccupancy} guests</span>` : ""}
          ${room.roomView ? `<span class="tag">${room.roomView} view</span>` : ""}
        </div>
      </div>
    </div>
  </div>
 
  <!-- GUESTS -->
  <div class="section">
    <div class="section-label">Guest Details</div>
    ${guestDetails.map((g, i) => `
      <div class="guest-item">
        <div class="guest-avatar">${initials(g)}</div>
        <div>
          <div class="guest-name">
            ${g.firstName} ${g.lastName}
            ${i === 0 ? `<span class="guest-primary-badge">Primary</span>` : ""}
          </div>
          <div class="guest-meta">
            ${guestTypeLabel(g)}
            ${g.dateOfBirth ? ` · DOB: ${formatDate(g.dateOfBirth)}` : ""}
            ${g.age ? ` · Age: ${g.age}` : ""}
            ${i === 0 && reservation.bookingUserEmail ? ` · ${reservation.bookingUserEmail}` : ""}
            ${i === 0 && reservation.bookingUserPhone ? ` · ${reservation.bookingUserPhone}` : ""}
          </div>
        </div>
      </div>
    `).join("")}
  </div>
 
  <!-- PROPERTY DETAILS -->
  <div class="section">
    <div class="section-label">Property</div>
    <div class="info-row">
      <span class="info-row-label">Address</span>
      <span class="info-row-value">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">City / State</span>
      <span class="info-row-value">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">Country</span>
      <span class="info-row-value">${propertyAddress.country}</span>
    </div>
    ${propertyAddress.landmark ? `<div class="info-row"><span class="info-row-label">Landmark</span><span class="info-row-value">Near ${propertyAddress.landmark}</span></div>` : ""}
    <div class="info-row">
      <span class="info-row-label">Contact</span>
      <span class="info-row-value">${property.propertyContact}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">Email</span>
      <span class="info-row-value">${property.propertyEmail}</span>
    </div>
    <div class="map-wrap">
      <iframe src="${getMapUrl(propertyAddress.latitude, propertyAddress.longitude)}"
        class="map-frame" allowfullscreen loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
 
  <!-- PRICING -->
  <div class="section">
    <div class="section-label">Price Breakdown</div>
 
    <div class="price-row">
      <span class="price-row-label">Room rate (${numberOfNights} night${numberOfNights > 1 ? "s" : ""} × ${reservation.numberOfRooms} room${reservation.numberOfRooms > 1 ? "s" : ""})</span>
      <span class="price-row-val">${formatCurrency(finalPrice.amountBeforeTax, reservation.currencyCode)}</span>
    </div>
 
    ${finalPrice.totalAddonAmount > 0 && finalPrice.addonBrakeDown?.length
      ? finalPrice.addonBrakeDown.map((a: any) => `
        <div class="price-row">
          <span class="price-row-label">${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ""}</span>
          <span class="price-row-val">+ ${formatCurrency(a.totalAmount, reservation.currencyCode)}</span>
        </div>`).join("")
      : ""}
 
    ${finalPrice.taxBrakeDown?.map((t: any) => `
      <div class="price-row">
        <span class="price-row-label">${t.name}</span>
        <span class="price-row-val">+ ${formatCurrency(t.taxedAmount, reservation.currencyCode)}</span>
      </div>`).join("") || ""}
 
    ${finalPrice.promotionBrakeDown?.map((p: any) => {
      const isPayLater = p.restrictionType === "payLater";
      const label = p.discountType === "percentage"
        ? `${p.discountValue}% off`
        : formatCurrency(p.discountValue, reservation.currencyCode);
      return `<div class="price-row ${isPayLater ? "paylater" : "discount"}">
        <span class="price-row-label">${p.name} (${label})</span>
        <span class="price-row-val">${isPayLater ? "+ " : "− "}${formatCurrency(p.discountAmount, reservation.currencyCode)}</span>
      </div>`;
    }).join("") || ""}
 
    ${finalPrice.promoCodeDiscount > 0 ? `
      <div class="price-row discount">
        <span class="price-row-label">Promo code discount</span>
        <span class="price-row-val">− ${formatCurrency(finalPrice.promoCodeDiscount, reservation.currencyCode)}</span>
      </div>` : ""}
 
    ${finalPrice.loyalityDiscount > 0 ? `
      <div class="price-row discount">
        <span class="price-row-label">Loyalty discount</span>
        <span class="price-row-val">− ${formatCurrency(finalPrice.loyalityDiscount, reservation.currencyCode)}</span>
      </div>` : ""}
 
    <hr class="price-divider" />
 
    <div class="price-total-row">
      <span class="price-total-label">Total Amount</span>
      <span class="price-total-val">${formatCurrency(finalPrice.totalAmount, reservation.currencyCode)}</span>
    </div>
 
    <div class="pay-pill">
      <span class="pay-pill-label">${reservation.paymentMethod === "pay_at_hotel" ? "Pay at Hotel" : "Paid Online"}</span>
      <span class="pay-pill-val">${formatCurrency(finalPrice.currentChargeableAmount, reservation.currencyCode)}</span>
    </div>
 
    ${finalPrice.latterpayableAmount > 0 ? `
      <div class="paylater-pill">
        <span class="paylater-pill-label">Due at Hotel</span>
        <span class="paylater-pill-val">${formatCurrency(finalPrice.latterpayableAmount, reservation.currencyCode)}</span>
      </div>` : ""}
  </div>
 
  <!-- POLICIES -->
  ${policies?.cancellationPolicy || policies?.depositPolicy ? `
  <div class="section">
    <div class="section-label">Policies</div>
    ${cancellationBlock()}
    ${depositBlock()}
  </div>` : ""}
 
  <!-- IMPORTANT NOTES -->
  <div class="section">
    <div class="notes-box">
      <div class="notes-box-title">Important Information</div>
      <ul>
        <li>Please carry a valid government-issued photo ID at check-in (Passport, Aadhaar, Driving License accepted).</li>
        <li>GST invoice can be collected directly from the property.</li>
        <li>Payment method: ${reservation.paymentMethod.split("_").map(capitalizeFirstLetter).join(" ")}</li>
      </ul>
    </div>
  </div>
 
  <!-- ACTION BUTTONS -->
  <div class="actions-section">
    <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode || ""}"
      class="action-btn action-btn-primary">Manage My Booking</a>
    <a href="https://bookings.revchilltech.com/cancel?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode || ""}"
      class="action-btn action-btn-danger">Cancel Booking</a>
  </div>
 
  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-contact">
      Questions? Contact <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a>
      or call ${property.propertyContact}
    </div>
    <div>This is an automated email from ${property.propertyName}. Please do not reply directly.</div>
    <div style="margin-top:10px;font-size:11px;">Powered by <strong style="color:${RC_TEAL}">RevChill</strong></div>
  </div>
 
</div>
</div>
</body>
</html>`;
};
 
// ─── CANCELLATION EMAIL ───────────────────────────────────────
 
export const BookingCancellationEmail = ({
  reservation,
  property,
  propertyAddress,
  room,
  policies,
}: EmailTemplateProps): string => {
  const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
  const primaryGuest = guestDetails[0];
  const numberOfNights = reservation.numberOfNights || 1;
  const propertyHeroImg = property.image?.[0] || "";
  const roomImg = room.image?.[0] || "";
  const hasRefund = reservation.refundAmount && reservation.refundAmount > 0;
 
  const initials = (g: IGuestDetail) =>
    `${g.firstName[0] || ""}${g.lastName[0] || ""}`.toUpperCase();
  const guestTypeLabel = (g: IGuestDetail) =>
    g.type === "adult" ? "Adult" : g.type === "child" ? "Child" : "Infant";
 
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Booking Cancelled – ${property.propertyName}</title>
<style>
${baseCSS("#6b7280", "#4b5563", "#f3f4f6")}
.header{background:#0d1b2a}
.date-box-day{color:#6b7280 !important}
.pay-pill{background:#f3f4f6}
.pay-pill-label,.pay-pill-val{color:#374151}
</style>
</head>
<body>
<div class="wrap">
<div class="container">
 
  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="https://bookings.revchilltech.com/revchill-logo.png" alt="RevChill" />
    </div>
    <span class="cancelled-badge">Cancelled</span>
  </div>
 
  <!-- PROPERTY HERO -->
  <div class="hero">
    ${propertyHeroImg
      ? `<img src="${propertyHeroImg}" alt="${property.propertyName}" class="hero-img" style="filter:grayscale(40%)" />`
      : `<div class="hero-img" style="background:linear-gradient(135deg,#374151,#6b7280)"></div>`}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      ${property.starRating ? `<div class="hero-stars" style="color:#9ca3af">${stars(property.starRating)}</div>` : ""}
      <div class="hero-title">${property.propertyName}</div>
      <div class="hero-sub">${propertyAddress.city}, ${propertyAddress.state} · ${propertyAddress.country}</div>
    </div>
  </div>
 
  <!-- BOOKING META BAR -->
  <div class="meta-bar">
    ${reservation.bookingCode ? `<div class="meta-item"><label>Booking ID</label><span style="color:#9ca3af">${reservation.bookingCode}</span></div>` : ""}
    ${reservation.bookedAt ? `<div class="meta-item"><label>Originally Booked</label><span>${formatDate(reservation.bookedAt)}</span></div>` : ""}
    <div class="meta-item"><label>Status</label><span style="color:#ef4444">Cancelled</span></div>
  </div>
 
  <!-- INTRO -->
  <div class="intro">
    <p>Hi <strong>${primaryGuest.firstName} ${primaryGuest.lastName}</strong>,</p>
    <p style="margin-top:8px;">
      We're confirming the cancellation of your booking at
      <strong>${property.propertyName}</strong>.
      We hope to welcome you another time.
    </p>
    ${hasRefund ? `
    <div class="refund-box" style="margin-top:16px">
      <div class="refund-box-title">Refund Initiated</div>
      <div style="font-size:12px;color:#166534;line-height:1.6">
        Your refund is being processed and will be credited to your original payment method within 5–7 business days.
      </div>
      <div class="refund-amount">${formatCurrency(reservation.refundAmount!, reservation.currencyCode)}</div>
    </div>` : `
    <div class="no-refund-box" style="margin-top:16px">
      <div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:4px">No Refund Applicable</div>
      <div style="font-size:12px;color:#b91c1c;line-height:1.6">
        As per the cancellation policy, no refund is applicable for this cancellation.
      </div>
    </div>`}
  </div>
 
  <!-- CANCELLED STAY DATES -->
  <div class="section">
    <div class="section-label">Cancelled Reservation</div>
    <div class="dates-grid">
      <div class="date-box">
        <div class="date-box-label">Check-in (Was)</div>
        <div class="date-box-day strikethrough">${getDay(startDate)}</div>
        <div class="date-box-myr" style="color:#aaa">${getMonYr(startDate)}</div>
        <div class="date-box-wday">${getWeekday(startDate)}</div>
      </div>
      <div class="date-divider">
        <div class="date-divider-nights" style="color:#9ca3af">${numberOfNights}</div>
        <div class="date-divider-label">night${numberOfNights > 1 ? "s" : ""}</div>
      </div>
      <div class="date-box">
        <div class="date-box-label">Check-out (Was)</div>
        <div class="date-box-day strikethrough">${getDay(endDate)}</div>
        <div class="date-box-myr" style="color:#aaa">${getMonYr(endDate)}</div>
        <div class="date-box-wday">${getWeekday(endDate)}</div>
      </div>
    </div>
    <div style="margin-top:14px;">
      <div class="info-row">
        <span class="info-row-label">Guests</span>
        <span class="info-row-value">${guests.adults} Adult${guests.adults > 1 ? "s" : ""}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Room</span>
        <span class="info-row-value">${room.roomName}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Rooms</span>
        <span class="info-row-value">${reservation.numberOfRooms}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Booking Amount</span>
        <span class="info-row-value">${formatCurrency(finalPrice.totalAmount, reservation.currencyCode)}</span>
      </div>
      ${hasRefund ? `<div class="info-row">
        <span class="info-row-label">Refund Amount</span>
        <span class="info-row-value" style="color:#16a34a">${formatCurrency(reservation.refundAmount!, reservation.currencyCode)}</span>
      </div>` : ""}
      ${reservation.bookingStatus === "cancelled" && (reservation as any).cancellationReason ? `<div class="info-row">
        <span class="info-row-label">Reason</span>
        <span class="info-row-value">${(reservation as any).cancellationReason}</span>
      </div>` : ""}
    </div>
  </div>
 
  <!-- GUEST DETAILS -->
  <div class="section">
    <div class="section-label">Guest Details</div>
    ${guestDetails.map((g, i) => `
      <div class="guest-item">
        <div class="guest-avatar" style="background:#f3f4f6;color:#6b7280">${initials(g)}</div>
        <div>
          <div class="guest-name">
            ${g.firstName} ${g.lastName}
            ${i === 0 ? `<span class="guest-primary-badge" style="background:#6b7280">Primary</span>` : ""}
          </div>
          <div class="guest-meta">
            ${guestTypeLabel(g)}
            ${g.dateOfBirth ? ` · DOB: ${formatDate(g.dateOfBirth)}` : ""}
            ${i === 0 && reservation.bookingUserEmail ? ` · ${reservation.bookingUserEmail}` : ""}
            ${i === 0 && reservation.bookingUserPhone ? ` · ${reservation.bookingUserPhone}` : ""}
          </div>
        </div>
      </div>
    `).join("")}
  </div>
 
  <!-- PROPERTY DETAILS -->
  <div class="section">
    <div class="section-label">Property</div>
    <div class="info-row">
      <span class="info-row-label">Address</span>
      <span class="info-row-value">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">City / State</span>
      <span class="info-row-value">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">Contact</span>
      <span class="info-row-value">${property.propertyContact}</span>
    </div>
    <div class="info-row">
      <span class="info-row-label">Email</span>
      <span class="info-row-value">${property.propertyEmail}</span>
    </div>
  </div>
 
  <!-- ACTION BUTTONS -->
  <div class="actions-section">
    <a href="https://bookings.revchilltech.com/?propertyCode=${property.propertyCode}"
      class="action-btn action-btn-primary" style="background:#00b5c8">Book Again</a>
    <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}"
      class="action-btn action-btn-secondary">My Bookings</a>
  </div>
 
  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-contact">
      Questions about your cancellation?
      <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a>
      or call ${property.propertyContact}
    </div>
    <div>This is an automated cancellation confirmation from ${property.propertyName}. Please do not reply directly.</div>
    <div style="margin-top:10px;font-size:11px;">Powered by <strong style="color:${RC_TEAL}">RevChill</strong></div>
  </div>
 
</div>
</div>
</body>
</html>`;
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
  const numberOfNights = reservation.numberOfNights || 1;

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
              <span class="info-value">${numberOfNights} Night${numberOfNights > 1 ? 's' : ''}</span>
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
                <span class="price-label">Room rate (${numberOfNights} night${numberOfNights > 1 ? 's' : ''})</span>
                <span class="price-value">${formatCurrency(finalPrice.amountBeforeTax, reservation.currencyCode)}</span>
              </div>
              
              ${finalPrice.addonBrakeDown && finalPrice.addonBrakeDown.length > 0 ? finalPrice.addonBrakeDown.map((addon: any) => `
              <div class="price-row">
                <span class="price-label">${addon.name}</span>
                <span class="price-value">${formatCurrency(addon.totalAmount, reservation.currencyCode)}</span>
              </div>
              `).join('') : ''}
              
              ${finalPrice.taxBrakeDown && finalPrice.taxBrakeDown.length > 0 ? finalPrice.taxBrakeDown.map((tax: any) => `
              <div class="price-row">
                <span class="price-label">${tax.name}</span>
                <span class="price-value">${formatCurrency(tax.taxAmount, reservation.currencyCode)}</span>
              </div>
              `).join('') : ''}
              
              ${finalPrice.totalPromotionAmount > 0 ? `
              <div class="price-row discount-row">
                <span class="price-label">Discount</span>
                <span class="price-value">-${formatCurrency(finalPrice.totalPromotionAmount, reservation.currencyCode)}</span>
              </div>
              ` : ''}
              
              ${finalPrice.promoCodeDiscount > 0 ? `
              <div class="price-row discount-row">
                <span class="price-label">Promo Code Discount</span>
                <span class="price-value">-${formatCurrency(finalPrice.promoCodeDiscount, reservation.currencyCode)}</span>
              </div>
              ` : ''}
              
              ${finalPrice.loyalityDiscount > 0 ? `
              <div class="price-row discount-row">
                <span class="price-label">Loyalty Discount</span>
                <span class="price-value">-${formatCurrency(finalPrice.loyalityDiscount, reservation.currencyCode)}</span>
              </div>
              ` : ''}
            </div>
            <div class="price-row-total">
              <span class="price-label">Total Amount</span>
              <span class="price-value">${formatCurrency(finalPrice.totalAmount, reservation.currencyCode)}</span>
            </div>
          </div>
        </div>

 <div class="cta-section">
  <p class="cta-text">Need to make changes to your reservation?</p>
  <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}" class="cta-button">
    Manage Booking
  </a>
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

// // ==================== BOOKING CANCELLATION EMAIL ====================
// export const BookingCancellationEmail = ({
//   reservation,
//   property,
//   propertyAddress,
//   room,
// }: EmailTemplateProps): string => {
//   const { finalPrice, guests, guestDetails, startDate, endDate } = reservation;
//   const primaryGuest = guestDetails[0];
//   const numberOfNights = reservation.numberOfNights || 1;

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Booking Cancelled - ${property.propertyName}</title>
//   <style>
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { 
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//       background-color: #f8f9fa; 
//       color: #212529;
//       line-height: 1.6;
//       -webkit-font-smoothing: antialiased;
//     }
//     .email-wrapper { background-color: #f8f9fa; padding: 20px 0; }
//     .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
//     .header { background: #ffffff; padding: 30px 40px; border-bottom: 3px solid #6c757d; }
//     .property-logo { font-size: 24px; font-weight: 700; color: #6c757d; margin-bottom: 8px; }
//     .confirmation-title { font-size: 32px; font-weight: 700; color: #212529; margin-bottom: 8px; }
//     .confirmation-subtitle { font-size: 16px; color: #6c757d; }
//     .cancelled-badge { display: inline-block; background: #dc3545; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
//     .booking-number { display: inline-block; background: #e9ecef; color: #6c757d; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 16px; font-size: 14px; margin-left: 8px; }
//     .content { padding: 0; }
//     .section { padding: 32px 40px; border-bottom: 1px solid #e9ecef; }
//     .section:last-child { border-bottom: none; }
//     .section-header { display: flex; align-items: center; margin-bottom: 20px; }
//     .section-icon { width: 40px; height: 40px; background: #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 12px; }
//     .section-title { font-size: 20px; font-weight: 700; color: #212529; margin: 0; }
//     .cancellation-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin-bottom: 24px; }
//     .cancellation-notice-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 8px; display: flex; align-items: center; }
//     .cancellation-notice-text { font-size: 14px; color: #495057; line-height: 1.6; }
//     .refund-notice { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px; margin-top: 16px; }
//     .refund-notice-title { font-weight: 700; font-size: 15px; color: #212529; margin-bottom: 8px; display: flex; align-items: center; }
//     .refund-amount { font-size: 24px; font-weight: 700; color: #28a745; margin-top: 8px; }
//     .date-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
//     .date-card { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; opacity: 0.7; }
//     .date-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; font-weight: 600; margin-bottom: 8px; }
//     .date-day { font-size: 28px; font-weight: 700; color: #6c757d; line-height: 1; margin-bottom: 4px; text-decoration: line-through; }
//     .date-month-year { font-size: 14px; color: #495057; font-weight: 500; }
//     .date-weekday { font-size: 13px; color: #6c757d; margin-top: 4px; }
//     .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
//     .info-item { display: flex; flex-direction: column; }
//     .info-label { font-size: 13px; color: #6c757d; font-weight: 500; margin-bottom: 4px; }
//     .info-value { font-size: 16px; font-weight: 600; color: #495057; }
//     .guest-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 12px; }
//     .guest-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
//     .guest-name { font-weight: 700; font-size: 17px; color: #212529; }
//     .guest-badge { display: inline-block; background: #6c757d; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px; }
//     .guest-contact { font-size: 14px; color: #6c757d; margin-top: 4px; }
//     .guest-contact-item { display: flex; align-items: center; margin-bottom: 4px; }
//     .property-name { font-size: 24px; font-weight: 700; color: #212529; margin-bottom: 8px; }
//     .address-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px; margin-top: 20px; }
//     .address-title { font-weight: 700; font-size: 14px; color: #212529; margin-bottom: 12px; display: flex; align-items: center; }
//     .address-line { font-size: 14px; color: #495057; line-height: 1.6; }
//     .contact-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
//     .contact-item { font-size: 14px; color: #495057; display: flex; align-items: center; }
//     .contact-item strong { font-weight: 600; margin-right: 4px; }
//     .cta-section { background: #f8f9fa; text-align: center; padding: 32px 40px; }
//     .cta-button { display: inline-block; background: #6c757d; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 8px; transition: background 0.3s ease; }
//     .cta-button:hover { background: #5a6268; }
//     .cta-text { font-size: 15px; color: #495057; margin-bottom: 8px; }
//     .footer { background: #f8f9fa; padding: 32px 40px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #e9ecef; }
//     .footer-links { margin-bottom: 16px; }
//     .footer a { color: #6c757d; text-decoration: none; font-weight: 500; }
//     .footer a:hover { text-decoration: underline; }
//     .footer-note { margin-top: 16px; font-size: 12px; color: #adb5bd; line-height: 1.5; }
//     @media only screen and (max-width: 600px) {
//       .container { margin: 0; border-radius: 0; }
//       .header, .section, .cta-section, .footer { padding: 24px 20px; }
//       .confirmation-title { font-size: 26px; }
//       .date-cards, .info-grid, .contact-info { grid-template-columns: 1fr; }
//       .date-card { padding: 16px; }
//       .property-name { font-size: 20px; }
//       .booking-number { margin-left: 0; margin-top: 8px; display: block; width: fit-content; }
//     }
//   </style>
// </head>
// <body>
//   <div class="email-wrapper">
//     <div class="container">
//       <div class="header">
//         <div class="property-logo">${property.propertyName}</div>
//         <h1 class="confirmation-title">Booking Cancelled</h1>
//         <p class="confirmation-subtitle">Your reservation has been cancelled</p>
//         <div>
//           <span class="cancelled-badge">CANCELLED</span>
//           ${reservation.bookingCode ? `<span class="booking-number">Booking #${reservation.bookingCode}</span>` : ''}
//         </div>
//       </div>

//       <div class="content">
//         <div class="section">
//           <div class="cancellation-notice">
//             <div class="cancellation-notice-title">⚠️ Cancellation Confirmed</div>
//             <div class="cancellation-notice-text">
//               We're sorry to see you go. Your booking at ${property.propertyName} has been successfully cancelled. 
//               We hope to welcome you in the future.
//             </div>
//           </div>
          
//           ${reservation.refundAmount ? `
//           <div class="refund-notice">
//             <div class="refund-notice-title">💰 Refund Information</div>
//             <div class="cancellation-notice-text">
//               Your refund is being processed and will be credited to your original payment method within 5-7 business days.
//             </div>
//             <div class="refund-amount">${formatCurrency(reservation.refundAmount, reservation.currencyCode)}</div>
//           </div>
//           ` : ''}
          
//           <div class="section-header" style="margin-top: 24px;">
//             <div class="section-icon">📅</div>
//             <h2 class="section-title">Cancelled Reservation</h2>
//           </div>
          
//           <div class="date-cards">
//             <div class="date-card">
//               <div class="date-label">Check-in (Was)</div>
//               <div class="date-day">${new Date(startDate).getDate()}</div>
//               <div class="date-month-year">${new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
//               <div class="date-weekday">${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
//             </div>
//             <div class="date-card">
//               <div class="date-label">Check-out (Was)</div>
//               <div class="date-day">${new Date(endDate).getDate()}</div>
//               <div class="date-month-year">${new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
//               <div class="date-weekday">${new Date(endDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
//             </div>
//           </div>
          
//           <div class="info-grid">
//             <div class="info-item">
//               <span class="info-label">Duration</span>
//               <span class="info-value">${numberOfNights} Night${numberOfNights > 1 ? 's' : ''}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">Guests</span>
//               <span class="info-value">${guests.adults} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">Room Type</span>
//               <span class="info-value">${room.roomName}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">Number of Rooms</span>
//               <span class="info-value">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? 's' : ''}</span>
//             </div>
//           </div>
//         </div>

//         <div class="section">
//           <div class="section-header">
//             <div class="section-icon">👤</div>
//             <h2 class="section-title">Guest Information</h2>
//           </div>
//           <div class="guest-card">
//             <div class="guest-header">
//               <div class="guest-name">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
//               <span class="guest-badge">Primary Guest</span>
//             </div>
//             ${primaryGuest.email || primaryGuest.phone ? `
//             <div class="guest-contact">
//               ${primaryGuest.email ? `<div class="guest-contact-item">📧 ${primaryGuest.email}</div>` : ''}
//               ${primaryGuest.phone ? `<div class="guest-contact-item">📱 ${primaryGuest.phone}</div>` : ''}
//             </div>
//             ` : ''}
//           </div>
//         </div>

//         <div class="section">
//           <div class="section-header">
//             <div class="section-icon">🏨</div>
//             <h2 class="section-title">Property Information</h2>
//           </div>
//           <h3 class="property-name">${property.propertyName}</h3>
//           <div class="address-card">
//             <div class="address-title">📍 Location</div>
//             <div class="address-line">${propertyAddress.addressLine1}</div>
//             ${propertyAddress.addressLine2 ? `<div class="address-line">${propertyAddress.addressLine2}</div>` : ''}
//             <div class="address-line">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</div>
//             <div class="address-line">${propertyAddress.country}</div>
//           </div>
//           <div class="contact-info">
//             <div class="contact-item"><strong>📞</strong> ${property.propertyContact}</div>
//             <div class="contact-item"><strong>📧</strong> ${property.propertyEmail}</div>
//           </div>
//         </div>

//  <div class="cta-section">
//           <p class="cta-text">Changed your mind?</p>
//   <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}" class="cta-button">
//     Manage Booking
//   </a>
// </div>
//       <div class="footer">
//         <div class="footer-links">
//           <p>Questions about your cancellation?</p>
//           <p style="margin-top: 8px;">Contact us at <a href="mailto:${property.propertyEmail}">${property.propertyEmail}</a> or call ${property.propertyContact}</p>
//         </div>
//         <div class="footer-note">
//           This is an automated cancellation confirmation from ${property.propertyName}.<br>
//           Please do not reply directly to this message.
//         </div>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//   `;
// };

// Export all templates
export const EmailTemplates = {
  BookingConfirmation: BookingConfirmationEmail,
  BookingAmendment: BookingAmendmentEmail,
  BookingCancellation: BookingCancellationEmail,
};