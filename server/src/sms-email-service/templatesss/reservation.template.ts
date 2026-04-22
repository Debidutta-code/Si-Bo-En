import { ICReservationPayloadForEmail, IGuestDetail } from "../../pms/frontoffice/reservation/types";
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
  id: string;
  roomName: string;
  roomType: string;
  roomView?: string;
  maxOccupancy: number;
  image?: string[];
  description: string | null;
  numberOfBedrooms?: number;
}

interface CancellationPolicy {
  refundPercentage?: number;
  deadlineDate?: string;
  description?: string;
}

interface DepositPolicy {
  depositPercentage?: number;
  description?: string;
}

interface RatePlanPolicies {
  cancellationPolicy?: CancellationPolicy | null;
  depositPolicy?: DepositPolicy | null;
}

interface EmailTemplateProps {
  reservation: ICReservationPayloadForEmail;
  property: PropertyDetails;
  propertyAddress: PropertyAddress;
  room: RoomDetails;
  policies?: RatePlanPolicies;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeDate = (d: string | Date | undefined | null): Date | null => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
};
const getMapUrl = (lat: number, lng: number) =>
  `https://maps.google.com/?q=${lat},${lng}&z=15&output=embed`;
const formatCurrency = (
  amount: number | undefined | null,
  currency: CurrencyCode | string | undefined | null
): string => {
  const safeAmount = typeof amount === "number" && isFinite(amount) ? amount : 0;
  const safeCurrency = currency && String(currency).length === 3 ? String(currency) : "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount.toFixed(2)}`;
  }
};

const formatDate = (d: string | Date | undefined | null): string => {
  const dt = safeDate(d);
  if (!dt) return "—";
  return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const getDay = (d: string | Date | undefined | null) => safeDate(d)?.getDate()?.toString() ?? "—";
const getMonYr = (d: string | Date | undefined | null) => safeDate(d)?.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) ?? "";
const getWeekday = (d: string | Date | undefined | null) => safeDate(d)?.toLocaleDateString("en-IN", { weekday: "long" }) ?? "";

const starsHtml = (n: number | null | undefined) =>
  n ? `${"★".repeat(Math.floor(n))}${n % 1 >= 0.5 ? "½" : ""}` : "";

const initials = (g: IGuestDetail) =>
  `${g.firstName?.[0] ?? ""}${g.lastName?.[0] ?? ""}`.toUpperCase();

const guestLabel = (g: IGuestDetail) =>
  g.type === "adult" ? "Adult" : g.type === "child" ? "Child" : "Infant";

// ─── Policy helpers ───────────────────────────────────────────────────────────

const cancellationBlock = (policies?: RatePlanPolicies): string => {
  const cp = policies?.cancellationPolicy;
  if (!cp) return "";
  const text = cp.description
    ? cp.description
    : cp.refundPercentage !== undefined && cp.deadlineDate
      ? `Get a <strong>${cp.refundPercentage}%</strong> refund if you cancel before <strong>${formatDate(cp.deadlineDate)}</strong>.`
      : "";
  if (!text) return "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:9px;">
    <tr><td style="padding:13px 15px;">
      <div style="font-size:12px;font-weight:700;color:#15803d;margin-bottom:3px;">&#10003; Cancellation Policy</div>
      <div style="font-size:12px;line-height:1.6;color:#166534;">${text}</div>
    </td></tr>
  </table>`;
};


const depositBlock = (policies?: RatePlanPolicies): string => {
  const dp = policies?.depositPolicy;
  if (!dp) return "";
  const text = dp.description
    ? dp.description
    : dp.depositPercentage !== undefined
      ? `A deposit of <strong>${dp.depositPercentage}%</strong> of the total is required to secure your booking.`
      : "";
  if (!text) return "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;">
    <tr><td style="padding:13px 15px;">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:3px;">&#9889; Deposit Required</div>
      <div style="font-size:12px;line-height:1.6;color:#78350f;">${text}</div>
    </td></tr>
  </table>`;
};

// ─── Main Email Function ──────────────────────────────────────────────────────

export const BookingConfirmationEmail = ({
  reservation,
  property,
  propertyAddress,
  room,
  policies,
}: EmailTemplateProps): string => {

  const { finalPrice, guests, guestDetails, reservationStartDate, reservationEndDate } = reservation;
  const currency = reservation.currencyCode || finalPrice?.currencyCode || "INR";
  const primaryGuest = guestDetails?.[0];
  const numberOfNights = reservation.numberOfNights || 1;
  const propertyImg = property.image?.[0] ?? "";
  const roomImg = room.image?.[0] ?? "";
const lat = propertyAddress.latitude;
const lng = propertyAddress.longitude;

const mapLinkUrl = `https://maps.google.com/?q=${lat},${lng}`;


const guestRows = (guestDetails ?? []).map((g, i) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="${i < (guestDetails?.length ?? 0) - 1 ? "border-bottom:1px solid #f5f5f5;padding-bottom:10px;margin-bottom:10px;" : ""}">
    <tr>
      <td width="40" style="vertical-align:top;padding-top:2px;">
        <div style="width:36px;height:36px;border-radius:50%;background-color:#e0f7fa;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#0096a8;">
          ${initials(g)}
        </div>
      </td>
      <td style="padding-left:12px;vertical-align:top;">
        <div style="font-size:13px;font-weight:600;color:#1a1a2e;">
          ${g.firstName ?? ""} ${g.lastName ?? ""}
          ${i === 0 ? `<span style="background-color:#00b5c8;color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-left:6px;display:inline-block;vertical-align:middle;">Primary</span>` : ""}
        </div>
        <div style="font-size:11px;color:#aaaaaa;margin-top:2px;line-height:1.5;">
          ${guestLabel(g)}${"age" in g && (g as any).age ? ` &middot; Age ${(g as any).age}` : ""}${g.dateOfBirth ? ` &middot; DOB: ${formatDate(g.dateOfBirth)}` : ""}
          ${i === 0 && reservation.bookingUserEmail ? `<br>${reservation.bookingUserEmail}` : ""}
          ${i === 0 && reservation.bookingUserPhone ? ` &middot; ${reservation.bookingUserPhone}` : ""}
        </div>
      </td>
    </tr>
  </table>`).join("");

  // ── Add-on rows ─────────────────────────────────────────────
  const addonRows = (finalPrice?.totalAddonAmount ?? 0) > 0
    ? (finalPrice?.addonBrakeDown ?? []).map((a: any) => `
  <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;color:#666666;">
        ${a.name}${(a.quantity ?? 1) > 1 ? ` &times;${a.quantity}` : ""}
        ${a.date ? `<span style="font-size:11px;color:#aaaaaa;"> &middot; ${new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>` : ""}
      </td>
      <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(a.totalAmount, currency)}</td>
    </tr></table>
  </td></tr>`).join("")
    : "";

  // ── Tax rows ────────────────────────────────────────────────
  const taxRows = (finalPrice?.taxBrakeDown ?? []).map((t: any) => `
  <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;color:#666666;">${t.name}</td>
      <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(t.taxedAmount, currency)}</td>
    </tr></table>
  </td></tr>`).join("");

  // ── Promo rows ──────────────────────────────────────────────
  const promoRows = (finalPrice?.promotionBrakeDown ?? []).map((p: any) => {
    const isPayLater = p.restrictionType === "payLater";
    const label = p.discountType === "percentage"
      ? `${p.discountValue}% off`
      : formatCurrency(p.discountValue, currency);
    const color = isPayLater ? "#ea580c" : "#16a34a";
    const prefix = isPayLater ? "+" : "&minus;";
    return `
  <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;color:${color};">${p.name} (${label})${isPayLater ? " &mdash; Pay Later" : ""}</td>
      <td align="right" style="font-size:13px;font-weight:600;color:${color};">${prefix} ${formatCurrency(p.discountAmount, currency)}</td>
    </tr></table>
  </td></tr>`;
  }).join("");

 // ── Promo code & loyalty rows ───────────────────────────────
  const promoCodeRow = (finalPrice?.promoCodeDiscount ?? 0) > 0 ? `
  <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;color:#16a34a;">Promo code discount</td>
      <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(finalPrice?.promoCodeDiscount, currency)}</td>
    </tr></table>
  </td></tr>` : "";

  const loyaltyRow = (finalPrice?.loyalityDiscount ?? 0) > 0 ? `
  <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;color:#16a34a;">Loyalty discount</td>
      <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(finalPrice?.loyalityDiscount, currency)}</td>
    </tr></table>
  </td></tr>` : "";

  // ── Pay later pill ──────────────────────────────────────────
  const payLaterPill = (finalPrice?.latterpayableAmount ?? 0) > 0 ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#fff7ed;border-radius:8px;margin-top:8px;">
    <tr><td style="padding:10px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:12px;font-weight:700;color:#ea580c;">&#8987; Amount Due at Hotel</td>
        <td align="right" style="font-size:13px;font-weight:700;color:#ea580c;">${formatCurrency(finalPrice?.latterpayableAmount, currency)}</td>
      </tr></table>
    </td></tr>
  </table>` : "";

  // ── Policies section ────────────────────────────────────────
  const cancelBlock = cancellationBlock(policies);
  const depositBlk = depositBlock(policies);
  const policiesSection = (cancelBlock || depositBlk) ? `
  <tr>
    <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
      <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Policies</div>
      ${cancelBlock}
      ${depositBlk}
    </td>
  </tr>` : "";

  // ── Guest count string ──────────────────────────────────────
  const guestCountStr = [
    (guests?.adults ?? 0) > 0 ? `${guests.adults} Adult${guests.adults !== 1 ? "s" : ""}` : "",
    (guests?.children ?? 0) > 0 ? `${guests.children} Child${guests.children !== 1 ? "ren" : ""}` : "",
  ].filter(Boolean).join(", ");



  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Booking Confirmed &ndash; ${property.propertyName}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; display:block; }
    @media only screen and (max-width:600px) {
      .mobile-pad { padding-left:16px !important; padding-right:16px !important; }
      .mobile-hide { display:none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background-color:#0d1b2a;padding:18px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <img src="https://extranet.revchilltech.com/revchill.png" alt="RevChill" height="36" style="height:36px;display:block;" />
                </td>
                <td align="right">
                  <span style="background-color:#00b5c8;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;display:inline-block;">&#10003; Confirmed</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── HERO IMAGE ── -->
        <tr>
          <td style="padding:0;position:relative;">
            ${propertyImg
      ? `<img src="${propertyImg}" alt="${property.propertyName}" width="620" style="width:100%;max-width:620px;height:200px;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#0d1b2a 0%,#0096a8 100%);display:block;"></div>`
    }
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.68) 100%);">
              <tr>
                <td style="padding:20px 32px 18px;">
                  ${property.starRating ? `<div style="color:#f5c518;font-size:13px;margin-bottom:5px;">${starsHtml(property.starRating)}</div>` : ""}
                  <div style="font-size:21px;font-weight:700;color:#ffffff;margin-bottom:3px;text-shadow:0 1px 4px rgba(0,0,0,0.4);">${property.propertyName}</div>
                  <div style="font-size:13px;color:rgba(255,255,255,0.75);">${propertyAddress.city}, ${propertyAddress.state} &middot; ${propertyAddress.country}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── META BAR ── -->
        <tr>
          <td style="background-color:#111d2e;padding:13px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${reservation.bookingCode ? `
                <td style="padding-right:20px;">
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booking ID</div>
                  <div style="font-size:12px;font-weight:600;color:#00b5c8;">${reservation.bookingCode.split("-")[1]}</div>
                </td>` : ""}
                ${reservation.bookedAt ? `
                <td style="padding-right:20px;">
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booked On</div>
                  <div style="font-size:12px;font-weight:600;color:#ffffff;">${formatDate(reservation.bookedAt)}</div>
                </td>` : ""}
                <td style="padding-right:20px;">
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Payment</div>
                  <div style="font-size:12px;font-weight:600;color:#ffffff;">${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</div>
                </td>
                <td>
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Source</div>
                  <div style="font-size:12px;font-weight:600;color:#ffffff;">${capitalizeFirstLetter(reservation.bookingSource ?? "direct")}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── INTRO ── -->
        <tr>
          <td style="padding:26px 32px 10px;">
            <p style="margin:0;font-size:14px;color:#444444;line-height:1.75;">Hi <strong style="color:#1a1a2e;">${primaryGuest?.firstName ?? ""} ${primaryGuest?.lastName ?? ""}</strong>,</p>
            <p style="margin:8px 0 0;font-size:14px;color:#444444;line-height:1.75;">Your booking is <strong style="color:#00b5c8;">Confirmed</strong>. All the details are below &mdash; we look forward to welcoming you.</p>
          </td>
        </tr>

        <!-- ── STAY DETAILS ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Stay Details</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
              <tr>
                <td width="44%" style="padding:14px 16px;vertical-align:top;">
                  <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-in</div>
                  <div style="font-size:28px;font-weight:700;color:#00b5c8;line-height:1;">${getDay(reservationStartDate)}</div>
                  <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(reservationStartDate)}</div>
                  <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(reservationStartDate)}</div>
                  <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">After 2:00 PM</div>
                </td>
                <td width="12%" style="border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;background-color:#fafafa;text-align:center;vertical-align:middle;padding:8px 0;">
                  <div style="font-size:18px;font-weight:700;color:#00b5c8;">${numberOfNights}</div>
                  <div style="font-size:9px;color:#bbbbbb;margin-top:1px;">night${numberOfNights > 1 ? "s" : ""}</div>
                </td>
                <td width="44%" style="padding:14px 16px;vertical-align:top;">
                  <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-out</div>
                  <div style="font-size:28px;font-weight:700;color:#00b5c8;line-height:1;">${getDay(reservationEndDate)}</div>
                  <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(reservationEndDate)}</div>
                  <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(reservationEndDate)}</div>
                  <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">Before 12:00 PM</div>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Guests</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${guestCountStr}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Rooms</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? "s" : ""}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Rate Plan</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${reservation.ratePlanName ?? ""}</td>
                </tr></table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- ── ROOM ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Room</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
              ${roomImg ? `
              <tr>
                <td style="padding:0;">
                  <img src="${roomImg}" alt="${room.roomName}" width="620"
                       style="width:100%;max-width:620px;height:150px;object-fit:cover;display:block;" />
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">${room.roomName}</div>
                  <div style="font-size:12px;color:#999999;margin-bottom:9px;">
                    ${room.roomType}${room.roomView ? ` &middot; ${room.roomView} view` : ""}${room.maxOccupancy ? ` &middot; Max ${room.maxOccupancy} guests` : ""}
                  </div>
                  ${room.description ? `<p style="font-size:12px;color:#777777;line-height:1.6;margin-bottom:9px;">${room.description}</p>` : ""}
                  <table role="presentation" cellpadding="0" cellspacing="4" border="0">
                    <tr>
                      <td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">Room Only</span></td>
                      ${room.numberOfBedrooms ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">${room.numberOfBedrooms} Bedroom${room.numberOfBedrooms > 1 ? "s" : ""}</span></td>` : ""}
                      ${room.roomView ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">${room.roomView} view</span></td>` : ""}
                      ${room.maxOccupancy ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">Max ${room.maxOccupancy} guests</span></td>` : ""}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── GUEST DETAILS ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Guest Details</div>
            ${guestRows}
          </td>
        </tr>

        <!-- ── PROPERTY ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Property</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Address</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">City &amp; State</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Country</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.country}</td>
                </tr></table>
              </td></tr>
              ${propertyAddress.landmark ? `
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Landmark</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">Near ${propertyAddress.landmark.replace(/\n/g, " ").trim()}</td>
                </tr></table>
              </td></tr>` : ""}
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Phone</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${property.propertyContact}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Email</td>
                  <td align="right" style="font-size:12px;font-weight:600;">
                    <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a>
                  </td>
                </tr></table>
              </td></tr>
            </table>

            <!-- Static map (replace API key via env) -->
           <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
  <tr>
    <td style="border-radius:8px;background-color:#f0f9fa;border:1px solid #cceef2;">
      <a href="${mapLinkUrl}" target="_blank"
         style="display:inline-block;padding:11px 20px;font-size:12px;font-weight:700;color:#0096a8;text-decoration:none;letter-spacing:0.2px;">
        &#x1F4CD;&nbsp; View Location on Google Maps &rarr;
      </a>
    </td>
  </tr>
</table>
          </td>
        </tr>

        <!-- ── PRICE BREAKDOWN ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Price Breakdown</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

              <!-- Base room rate -->
              <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:13px;color:#666666;">Room rate (${numberOfNights} night${numberOfNights > 1 ? "s" : ""} &times; ${reservation.numberOfRooms} room${reservation.numberOfRooms > 1 ? "s" : ""})</td>
                  <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">${formatCurrency(finalPrice?.amountBeforeTax, currency)}</td>
                </tr></table>
              </td></tr>

              ${addonRows}
              ${taxRows}
              ${promoRows}
              ${promoCodeRow}
              ${loyaltyRow}

              <!-- Divider -->
              <tr><td style="padding:4px 0;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:4px 0;" /></td></tr>

              <!-- Total -->
              <tr><td style="padding:8px 0 6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:15px;font-weight:700;color:#1a1a2e;">Total Amount</td>
                  <td align="right" style="font-size:19px;font-weight:700;color:#00b5c8;">${formatCurrency(finalPrice?.totalAmount, currency)}</td>
                </tr></table>
              </td></tr>
            </table>

            <!-- Pay pill -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#e0f7fa;border-radius:8px;margin-top:10px;">
              <tr><td style="padding:10px 14px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;font-weight:700;color:#0096a8;">
                    ${reservation.paymentMethod === "pay_at_hotel" ? "&#127968; Pay at Hotel" : "&#10003; Paid Online"}
                  </td>
                  <td align="right" style="font-size:13px;font-weight:700;color:#0096a8;">${formatCurrency(finalPrice?.currentChargeableAmount, currency)}</td>
                </tr></table>
              </td></tr>
            </table>

            ${payLaterPill}
          </td>
        </tr>

        ${policiesSection}

        <!-- ── IMPORTANT NOTES ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;">
              <tr><td style="padding:13px 15px;">
                <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:7px;">IMPORTANT INFORMATION</div>
                <ul style="padding-left:16px;margin:0;">
                  <li style="font-size:12px;color:#78350f;line-height:1.8;">Please carry a valid government-issued photo ID at check-in (Passport, Aadhaar, Driving Licence accepted).</li>
                  <li style="font-size:12px;color:#78350f;line-height:1.8;">GST invoice can be collected directly from the property.</li>
                  <li style="font-size:12px;color:#78350f;line-height:1.8;">Payment method: ${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</li>
                </ul>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- ── ACTION BUTTONS ── -->
        <tr>
          <td style="background-color:#f7f8fa;padding:24px 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode.split("-")[1] ?? ""}"
                     style="display:inline-block;background-color:#00b5c8;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.2px;">
                    Manage My Booking
                  </a>
                </td>
                <td>
                  <a href="https://bookings.revchilltech.com/cancel?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode.split("-")[1] ?? ""}"
                     style="display:inline-block;background-color:#ffffff;color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;border:1px solid #fecaca;letter-spacing:0.2px;">
                    Cancel Booking
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background-color:#f3f4f6;padding:22px 32px;text-align:center;border-top:1px solid #e8e8e8;">
            <p style="margin:0 0 6px;font-size:13px;color:#555555;">
              Questions? <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a> &middot; ${property.propertyContact}
            </p>
            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;line-height:1.6;">
              This is an automated email from ${property.propertyName}. Please do not reply directly to this message.
            </p>
            <p style="margin:0;font-size:11px;color:#bbbbbb;">
              Powered by <strong style="color:#00b5c8;">RevChill</strong>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
};
export const BookingCancellationEmail = ({
  reservation,
  property,
  propertyAddress,
  room,
}: EmailTemplateProps): string => {

  const { finalPrice, guests, guestDetails, reservationStartDate, reservationEndDate } = reservation;
  const currency = reservation.currencyCode || finalPrice?.currencyCode || "INR";
  const primaryGuest = guestDetails?.[0];
  const numberOfNights = reservation.numberOfNights || 1;
  const propertyImg = property.image?.[0] ?? "";
  const hasRefund = (reservation.finalPrice?.totalAmount ?? 0) > 0;

  const guestRows = (guestDetails ?? []).map((g, i) => `
    <div class="g-item">
      <div class="g-avatar" style="background:#f3f4f6;color:#6b7280">${initials(g)}</div>
      <div style="flex:1;min-width:0">
        <div class="g-name">
          ${g.firstName ?? ""} ${g.lastName ?? ""}
          ${i === 0 ? `<span class="g-badge" style="background:#6b7280">Primary</span>` : ""}
        </div>
        <div class="g-meta">
          ${guestLabel(g)}${g.dateOfBirth ? ` &middot; DOB: ${formatDate(g.dateOfBirth)}` : ""}
          ${i === 0 && reservation.bookingUserEmail ? `<br>${reservation.bookingUserEmail}` : ""}
          ${i === 0 && reservation.bookingUserPhone ? ` &middot; ${reservation.bookingUserPhone}` : ""}
        </div>
      </div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Booking Cancelled – {{PROPERTY_NAME}}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
    @media only screen and (max-width: 600px) {
      .mobile-full { width: 100% !important; }
      .mobile-pad  { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<!-- ===================== OUTER WRAPPER ===================== -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
  <tr>
    <td align="center" style="padding:24px 16px;">

      <!-- ===================== EMAIL CARD ===================== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background-color:#0d1b2a;padding:18px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <img src="{{LOGO_URL}}" alt="RevChill" height="36" style="height:36px;display:block;" />
                </td>
                <td align="right">
                  <span style="background-color:#dc2626;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;display:inline-block;">Cancelled</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── HERO IMAGE (greyscale for cancellation) ── -->
        <tr>
          <td style="padding:0;position:relative;">
            <!--
              Use property image — will appear slightly muted via opacity overlay.
              If no image available, delete this <img> tag.
            -->
            <img src="{{PROPERTY_IMAGE_URL}}"
                 alt="{{PROPERTY_NAME}}"
                 width="620"
                 style="width:100%;max-width:620px;height:200px;object-fit:cover;display:block;opacity:0.65;" />
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.72) 100%);">
              <tr>
                <td style="padding:20px 32px 18px;">
                  <div style="color:#9ca3af;font-size:13px;margin-bottom:5px;">{{STAR_RATING_HTML}}</div>
                  <div style="font-size:21px;font-weight:700;color:rgba(255,255,255,0.75);margin-bottom:3px;">{{PROPERTY_NAME}}</div>
                  <div style="font-size:13px;color:rgba(255,255,255,0.60);">{{PROPERTY_CITY}}, {{PROPERTY_STATE}} &middot; {{PROPERTY_COUNTRY}}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── META BAR ── -->
        <tr>
          <td style="background-color:#111d2e;padding:13px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:24px;">
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booking ID</div>
                  <div style="font-size:12px;font-weight:600;color:#9ca3af;">{{BOOKING_CODE}}</div>
                </td>
                <td style="padding-right:24px;">
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Originally Booked</div>
                  <div style="font-size:12px;font-weight:600;color:#ffffff;">{{BOOKED_AT_DATE}}</div>
                </td>
                <td>
                  <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Status</div>
                  <div style="font-size:12px;font-weight:600;color:#ef4444;">Cancelled</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── INTRO ── -->
        <tr>
          <td style="padding:26px 32px 10px;">
            <p style="margin:0;font-size:14px;color:#444444;line-height:1.75;">Hi <strong style="color:#1a1a2e;">{{GUEST_FIRST_NAME}} {{GUEST_LAST_NAME}}</strong>,</p>
            <p style="margin:8px 0 16px;font-size:14px;color:#444444;line-height:1.75;">We&rsquo;ve confirmed the cancellation of your booking at <strong>{{PROPERTY_NAME}}</strong>. We hope to welcome you another time.</p>

            <!--
              REFUND BOX: show this green box if a refund is applicable.
              Replace with the NO REFUND box below if not applicable. Delete whichever you don't need.
            -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
              <tr>
                <td style="padding:15px 18px;">
                  <div style="font-size:11px;font-weight:700;color:#15803d;margin-bottom:3px;">REFUND INITIATED</div>
                  <p style="margin:0 0 7px;font-size:12px;color:#166534;line-height:1.6;">
                    Your refund is being processed and will be credited to your original payment method within 5&ndash;7 business days.
                  </p>
                  <div style="font-size:22px;font-weight:700;color:#15803d;">{{REFUND_AMOUNT}}</div>
                </td>
              </tr>
            </table>

            <!--
              NO REFUND BOX: use this instead of the green box above when no refund.
              Delete whichever block is not needed.
            -->
            <!--
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
              <tr>
                <td style="padding:15px 18px;">
                  <div style="font-size:11px;font-weight:700;color:#991b1b;margin-bottom:3px;">NO REFUND APPLICABLE</div>
                  <div style="font-size:12px;color:#b91c1c;line-height:1.6;">As per the cancellation policy, no refund is applicable for this cancellation.</div>
                </td>
              </tr>
            </table>
            -->

          </td>
        </tr>

        <!-- ── CANCELLED RESERVATION ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Cancelled Reservation</div>

            <!-- Greyed-out date grid -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;opacity:0.6;">
              <tr>
                <td width="44%" style="padding:14px 16px;vertical-align:top;">
                  <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-in (Was)</div>
                  <div style="font-size:28px;font-weight:700;color:#9ca3af;line-height:1;text-decoration:line-through;">{{CHECKIN_DAY}}</div>
                  <div style="font-size:12px;font-weight:500;color:#aaaaaa;margin-top:2px;">{{CHECKIN_MON_YR}}</div>
                  <div style="font-size:11px;color:#bbbbbb;margin-top:1px;">{{CHECKIN_WEEKDAY}}</div>
                </td>
                <td width="12%" style="border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;background-color:#fafafa;text-align:center;vertical-align:middle;padding:8px 0;">
                  <div style="font-size:18px;font-weight:700;color:#9ca3af;">{{NUMBER_OF_NIGHTS}}</div>
                  <div style="font-size:9px;color:#bbbbbb;margin-top:1px;">night{{NIGHTS_PLURAL}}</div>
                </td>
                <td width="44%" style="padding:14px 16px;vertical-align:top;">
                  <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-out (Was)</div>
                  <div style="font-size:28px;font-weight:700;color:#9ca3af;line-height:1;text-decoration:line-through;">{{CHECKOUT_DAY}}</div>
                  <div style="font-size:12px;font-weight:500;color:#aaaaaa;margin-top:2px;">{{CHECKOUT_MON_YR}}</div>
                  <div style="font-size:11px;color:#bbbbbb;margin-top:1px;">{{CHECKOUT_WEEKDAY}}</div>
                </td>
              </tr>
            </table>

            <!-- Info rows -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Room</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{ROOM_NAME}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Guests</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{GUEST_COUNT}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Booking Amount</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{TOTAL_AMOUNT}}</td>
                </tr></table>
              </td></tr>
              <!--
                CANCELLATION REASON: remove this row if no reason provided
              -->
              <tr><td style="padding:9px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Reason</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{CANCELLATION_REASON}}</td>
                </tr></table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- ── GUEST DETAILS ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Guest Details</div>

            <!-- PRIMARY GUEST -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-bottom:1px solid #f5f5f5;padding-bottom:10px;margin-bottom:10px;">
              <tr>
                <td width="40" style="vertical-align:top;padding-top:2px;">
                  <div style="width:36px;height:36px;border-radius:50%;background-color:#f3f4f6;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#6b7280;">{{GUEST1_INITIALS}}</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <div style="font-size:13px;font-weight:600;color:#1a1a2e;">
                    {{GUEST1_FIRST_NAME}} {{GUEST1_LAST_NAME}}
                    <span style="background-color:#6b7280;color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-left:6px;display:inline-block;vertical-align:middle;">Primary</span>
                  </div>
                  <div style="font-size:11px;color:#aaaaaa;margin-top:2px;line-height:1.5;">
                    Adult &middot; {{GUEST1_EMAIL}}<br>{{GUEST1_PHONE}}
                  </div>
                </td>
              </tr>
            </table>

            <!--
              ADDITIONAL GUESTS: repeat for each extra guest. Remove if only 1 guest.
            -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="40" style="vertical-align:top;padding-top:2px;">
                  <div style="width:36px;height:36px;border-radius:50%;background-color:#f3f4f6;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#6b7280;">{{GUEST2_INITIALS}}</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <div style="font-size:13px;font-weight:600;color:#1a1a2e;">{{GUEST2_FIRST_NAME}} {{GUEST2_LAST_NAME}}</div>
                  <div style="font-size:11px;color:#aaaaaa;margin-top:2px;">Adult</div>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── PROPERTY ── -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
            <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Property</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Name</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{PROPERTY_NAME}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Address</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{PROPERTY_ADDRESS_LINE1}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">City &amp; State</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{PROPERTY_CITY}}, {{PROPERTY_STATE}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Phone</td>
                  <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">{{PROPERTY_PHONE}}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:9px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:12px;color:#999999;">Email</td>
                  <td align="right" style="font-size:12px;font-weight:600;"><a href="mailto:{{PROPERTY_EMAIL}}" style="color:#00b5c8;text-decoration:none;">{{PROPERTY_EMAIL}}</a></td>
                </tr></table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- ── ACTION BUTTONS ── -->
        <tr>
          <td style="background-color:#f7f8fa;padding:24px 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://bookings.revchilltech.com/?propertyCode={{PROPERTY_CODE}}"
                     style="display:inline-block;background-color:#00b5c8;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.2px;">
                    Book Again
                  </a>
                </td>
                <td>
                  <a href="https://bookings.revchilltech.com/my-trip?propertyCode={{PROPERTY_CODE}}"
                     style="display:inline-block;background-color:#ffffff;color:#555555;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;border:1px solid #dddddd;letter-spacing:0.2px;">
                    My Bookings
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background-color:#f3f4f6;padding:22px 32px;text-align:center;border-top:1px solid #e8e8e8;">
            <p style="margin:0 0 6px;font-size:13px;color:#555555;">
              Questions about your cancellation? <a href="mailto:{{PROPERTY_EMAIL}}" style="color:#00b5c8;text-decoration:none;">{{PROPERTY_EMAIL}}</a> &middot; {{PROPERTY_PHONE}}
            </p>
            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;line-height:1.6;">
              This is an automated cancellation confirmation from {{PROPERTY_NAME}}. Please do not reply directly.
            </p>
            <p style="margin:0;font-size:11px;color:#bbbbbb;">
              Powered by <strong style="color:#00b5c8;">RevChill</strong>
            </p>
          </td>
        </tr>

      </table>
      <!-- /EMAIL CARD -->

    </td>
  </tr>
</table>
<!-- /OUTER WRAPPER -->

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
  const { finalPrice, guests, guestDetails, reservationStartDate, reservationEndDate } = reservation;
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
              <div class="date-day">${new Date(reservationStartDate).getDate()}</div>
              <div class="date-month-year">${new Date(reservationStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(reservationStartDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
            <div class="date-card">
              <div class="date-label">Check-out</div>
              <div class="date-day">${new Date(reservationEndDate).getDate()}</div>
              <div class="date-month-year">${new Date(reservationEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              <div class="date-weekday">${new Date(reservationEndDate).toLocaleDateString('en-US', { weekday: 'long' })}</div>
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
            ${reservation.bookingUserEmail || reservation.bookingUserPhone ? `
            <div class="guest-contact">
              ${reservation.bookingUserEmail ? `<div class="guest-contact-item">📧 ${reservation.bookingUserEmail}</div>` : ''}
              ${reservation.bookingUserPhone ? `<div class="guest-contact-item">📱 ${reservation.bookingUserPhone}</div>` : ''}
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