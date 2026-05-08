// import { IBookingTemplate, ICReservationPayloadForEmail, IGuestDetail, IReservationUpdatePayload, IReservationWithAllDetails } from "../../reservation/types";
// import { CurrencyCode } from "../../tax-system/interfaces";
// import { capitalizeFirstLetter } from "../utils/capitalizefirstLetter.util";

// interface PropertyDetails {
//   propertyName: string;
//   propertyEmail: string;
//   propertyContact: string;
//   description: string;
//   image: string[];
//   propertyCode: string;
//   starRating?: number | null;
// }

// interface PropertyAddress {
//   addressLine1: string;
//   addressLine2: string | null;
//   country: string;
//   state: string;
//   city: string;
//   location: string;
//   landmark: string;
//   zipCode: string;
//   latitude: number;
//   longitude: number;
// }

// interface RoomDetails {
//   id: string;
//   roomName: string;
//   roomType: string;
//   roomView?: string;
//   maxOccupancy: number;
//   image?: string[];
//   description: string | null;
//   numberOfBedrooms?: number;
// }

// interface CancellationPolicy {
//   refundPercentage?: number;
//   deadlineDate?: string;
//   description?: string;
// }

// interface DepositPolicy {
//   depositPercentage?: number;
//   description?: string;
// }
// interface GuarenteePolicy {
//   description?: string;
// }

// interface RatePlanPolicies {
//   cancellationPolicy?: CancellationPolicy | null;
//   depositPolicy?: DepositPolicy | null;
//   guarenteePolicy?: GuarenteePolicy | null;
// }

// interface EmailTemplateProps {
//   reservation: IBookingTemplate;
//   property: PropertyDetails;
//   propertyAddress: PropertyAddress;
//   room: RoomDetails;
//   policies?: RatePlanPolicies;
// }


// interface UpdateReservationPayload {
//   property: PropertyDetails;
//   propertyAddress: PropertyAddress;
//   room: RoomDetails;
//   updatedPayload: IReservationUpdatePayload;
//   reservation: IReservationWithAllDetails;
//   policies?: RatePlanPolicies;
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const safeDate = (d: string | Date | undefined | null): Date | null => {
//   if (!d) return null;
//   const dt = new Date(d);
//   return isNaN(dt.getTime()) ? null : dt;
// };
// const getMapUrl = (lat: number, lng: number) =>
//   `https://maps.google.com/?q=${lat},${lng}&z=15&output=embed`;
// const formatCurrency = (
//   amount: number | undefined | null,
//   currency: CurrencyCode | string | undefined | null
// ): string => {
//   const safeAmount = typeof amount === "number" && isFinite(amount) ? amount : 0;
//   const safeCurrency = currency && String(currency).length === 3 ? String(currency) : "INR";
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: safeCurrency,
//       minimumFractionDigits: 2,
//     }).format(safeAmount);
//   } catch {
//     return `${safeCurrency} ${safeAmount.toFixed(2)}`;
//   }
// };

// const formatDate = (d: string | Date | undefined | null): string => {
//   const dt = safeDate(d);
//   if (!dt) return "—";
//   return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
// };

// const getDay = (d: string | Date | undefined | null) => safeDate(d)?.getDate()?.toString() ?? "—";
// const getMonYr = (d: string | Date | undefined | null) => safeDate(d)?.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) ?? "";
// const getWeekday = (d: string | Date | undefined | null) => safeDate(d)?.toLocaleDateString("en-IN", { weekday: "long" }) ?? "";

// const starsHtml = (n: number | null | undefined) =>
//   n ? `${"★".repeat(Math.floor(n))}${n % 1 >= 0.5 ? "½" : ""}` : "";

// const initials = (g: IGuestDetail) =>
//   `${g.firstName?.[0] ?? ""}${g.lastName?.[0] ?? ""}`.toUpperCase();

// const guestLabel = (g: IGuestDetail) =>
//   g.type === "adult" ? "Adult" : g.type === "child" ? "Child" : "Infant";

// // ─── Policy helpers ───────────────────────────────────────────────────────────

// const cancellationBlock = (policies?: RatePlanPolicies): string => {
//   const cp = policies?.cancellationPolicy;
//   if (!cp) return "";
//   const text = cp.description
//     ? cp.description
//     : cp.refundPercentage !== undefined && cp.deadlineDate
//       ? `Get a <strong>${cp.refundPercentage}%</strong> refund if you cancel before <strong>${formatDate(cp.deadlineDate)}</strong>.`
//       : "";
//   if (!text) return "";
//   return `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:9px;">
//     <tr><td style="padding:13px 15px;">
//       <div style="font-size:12px;font-weight:700;color:#15803d;margin-bottom:3px;">&#10003; Cancellation Policy</div>
//       <div style="font-size:12px;line-height:1.6;color:#166534;">${text}</div>
//     </td></tr>
//   </table>`;
// };


// const depositBlock = (policies?: RatePlanPolicies): string => {
//   const dp = policies?.depositPolicy;
//   if (!dp) return "";
//   const text = dp.description
//     ? dp.description
//     : dp.depositPercentage !== undefined
//       ? `A deposit of <strong>${dp.depositPercentage}%</strong> of the total is required to secure your booking.`
//       : "";
//   if (!text) return "";
//   return `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;">
//     <tr><td style="padding:13px 15px;">
//       <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:3px;">&#9889; Deposit Required</div>
//       <div style="font-size:12px;line-height:1.6;color:#78350f;">${text}</div>
//     </td></tr>
//   </table>`;
// };


// export const BookingConfirmationEmail = ({
//   reservation,
//   property,
//   propertyAddress,
//   room,
//   policies,
// }: EmailTemplateProps): string => {

//   const { guests, guestDetails, reservationStartDate, reservationEndDate } = reservation;
//   const currency = reservation.currencyCode || "AED";
//   const primaryGuest = guestDetails?.[0];
//   const numberOfNights = reservation.numberOfNights || 1;
//   const propertyImg = property.image?.[0] ?? "";
//   const roomImg = room.image?.[0] ?? "";
//   const lat = propertyAddress.latitude;
//   const lng = propertyAddress.longitude;

//   const mapLinkUrl = `https://maps.google.com/?q=${lat},${lng}`;


//   const guestRows = (guestDetails ?? []).map((g, i) => `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="${i < (guestDetails?.length ?? 0) - 1 ? "border-bottom:1px solid #f5f5f5;padding-bottom:10px;margin-bottom:10px;" : ""}">
//     <tr>
//       <td width="40" style="vertical-align:top;padding-top:2px;">
//         <div style="width:36px;height:36px;border-radius:50%;background-color:#e0f7fa;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#0096a8;">
//           ${initials(g)}
//         </div>
//       </td>
//       <td style="padding-left:12px;vertical-align:top;">
//         <div style="font-size:13px;font-weight:600;color:#1a1a2e;">
//           ${g.firstName ?? ""} ${g.lastName ?? ""}
//           ${i === 0 ? `<span style="background-color:#00b5c8;color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-left:6px;display:inline-block;vertical-align:middle;">Primary</span>` : ""}
//         </div>
//         <div style="font-size:11px;color:#aaaaaa;margin-top:2px;line-height:1.5;">
//           ${guestLabel(g)}${"age" in g && (g as any).age ? ` &middot; Age ${(g as any).age}` : ""}${g.dateOfBirth ? ` &middot; DOB: ${formatDate(g.dateOfBirth)}` : ""}
//           ${i === 0 && reservation.bookingUserEmail ? `<br>${reservation.bookingUserEmail}` : ""}
//           ${i === 0 && reservation.bookingUserPhone ? ` &middot; ${reservation.bookingUserPhone}` : ""}
//         </div>
//       </td>
//     </tr>
//   </table>`).join("");

//   // ── Add-on rows ─────────────────────────────────────────────
//   const addonRows = (reservation.PricingBrakeDown?.totalAddonAmount ?? 0) > 0
//     ? (reservation.PricingBrakeDown?.AddonBrakeDowns ?? []).map((a: any) => `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#666666;">
//         ${a.name}${(a.quantity ?? 1) > 1 ? ` &times;${a.quantity}` : ""}
//         ${a.date ? `<span style="font-size:11px;color:#aaaaaa;"> &middot; ${new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>` : ""}
//       </td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(a.totalAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`).join("")
//     : "";

//   // ── Tax rows ────────────────────────────────────────────────
//   const taxRows = (reservation.PricingBrakeDown?.taxBrakeDown ?? []).map((t: any) => `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#666666;">${t.name}</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(t.taxedAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`).join("");

//   // ── Promo rows ──────────────────────────────────────────────
//   const promoRows = (reservation.PricingBrakeDown?.promotionBrakeDown ?? []).map((p: any) => {
//     const isPayLater = p.restrictionType === "payLater";
//     const label = p.discountType === "percentage"
//       ? `${p.discountValue}% off`
//       : formatCurrency(p.discountValue, currency);
//     const color = isPayLater ? "#ea580c" : "#16a34a";
//     const prefix = isPayLater ? "+" : "&minus;";
//     return `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:${color};">${p.name} (${label})${isPayLater ? " &mdash; Pay Later" : ""}</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:${color};">${prefix} ${formatCurrency(p.discountAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`;
//   }).join("");

//   // ── Promo code & loyalty rows ───────────────────────────────
//   const promoCodeRow = (reservation.PricingBrakeDown?.promoCodeDiscount ?? 0) > 0 ? `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#16a34a;">Promo code discount</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(reservation.PricingBrakeDown?.promoCodeDiscount, currency)}</td>
//     </tr></table>
//   </td></tr>` : "";

//   const loyaltyRow = (reservation.PricingBrakeDown?.loyalityDiscount ?? 0) > 0 ? `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#16a34a;">Loyalty discount</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(reservation.PricingBrakeDown?.loyalityDiscount, currency)}</td>
//     </tr></table>
//   </td></tr>` : "";

//   // ── Pay later pill ──────────────────────────────────────────
//   const payLaterPill = (reservation.PricingBrakeDown?.latterpayableAmount ?? 0) > 0 ? `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#fff7ed;border-radius:8px;margin-top:8px;">
//     <tr><td style="padding:10px 14px;">
//       <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//         <td style="font-size:12px;font-weight:700;color:#ea580c;">&#8987; Amount Due at Hotel</td>
//         <td align="right" style="font-size:13px;font-weight:700;color:#ea580c;">${formatCurrency(reservation.PricingBrakeDown?.latterpayableAmount, currency)}</td>
//       </tr></table>
//     </td></tr>
//   </table>` : "";

//   // ── Policies section ────────────────────────────────────────
//   const cancelBlock = cancellationBlock(policies);
//   const depositBlk = depositBlock(policies);
//   const policiesSection = (cancelBlock || depositBlk) ? `
//   <tr>
//     <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//       <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Policies</div>
//       ${cancelBlock}
//       ${depositBlk}
//     </td>
//   </tr>` : "";

//   // ── Guest count string ──────────────────────────────────────
//   const guestCountStr = [
//     (guests?.adults ?? 0) > 0 ? `${guests?.adults} Adult${guests?.adults !== 1 ? "s" : ""}` : "",
//     (guests?.children ?? 0) > 0 ? `${guests?.children} Child${guests?.children !== 1 ? "ren" : ""}` : "",
//   ].filter(Boolean).join(", ");



//   return `<!DOCTYPE html>
// <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <meta http-equiv="X-UA-Compatible" content="IE=edge">
//   <meta name="x-apple-disable-message-reformatting">
//   <title>Booking Confirmed &ndash; ${property.propertyName}</title>
//   <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
//   <style>
//     body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
//     table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
//     img { -ms-interpolation-mode:bicubic; border:0; display:block; }
//     @media only screen and (max-width:600px) {
//       .mobile-pad { padding-left:16px !important; padding-right:16px !important; }
//       .mobile-hide { display:none !important; }
//     }
//   </style>
// </head>
// <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
//   <tr>
//     <td align="center" style="padding:24px 16px;">
//       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

//         <!-- ── HEADER ── -->
//         <tr>
//           <td style="background-color:#0d1b2a;padding:18px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 <td>
//                   <img src="https://extranet.revchilltech.com/revchill.png" alt="RevChill" height="36" style="height:36px;display:block;" />
//                 </td>
//                 <td align="right">
//                   <span style="background-color:#00b5c8;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;display:inline-block;">&#10003; Confirmed</span>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── HERO IMAGE ── -->
//         <tr>
//           <td style="padding:0;position:relative;">
//             ${propertyImg
//       ? `<img src="${propertyImg}" alt="${property.propertyName}" width="620" style="width:100%;max-width:620px;height:200px;object-fit:cover;display:block;" />`
//       : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#0d1b2a 0%,#0096a8 100%);display:block;"></div>`
//     }
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.68) 100%);">
//               <tr>
//                 <td style="padding:20px 32px 18px;">
//                   ${property.starRating ? `<div style="color:#f5c518;font-size:13px;margin-bottom:5px;">${starsHtml(property.starRating)}</div>` : ""}
//                   <div style="font-size:21px;font-weight:700;color:#ffffff;margin-bottom:3px;text-shadow:0 1px 4px rgba(0,0,0,0.4);">${property.propertyName}</div>
//                   <div style="font-size:13px;color:rgba(255,255,255,0.75);">${propertyAddress.city}, ${propertyAddress.state} &middot; ${propertyAddress.country}</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── META BAR ── -->
//         <tr>
//           <td style="background-color:#111d2e;padding:13px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 ${reservation.bookingCode ? `
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booking ID</div>
//                   <div style="font-size:12px;font-weight:600;color:#00b5c8;">${reservation.bookingCode.split("-")[1]}</div>
//                 </td>` : ""}
//                 ${reservation.bookedAt ? `
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booked On</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${formatDate(reservation.bookedAt)}</div>
//                 </td>` : ""}
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Payment</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</div>
//                 </td>
//                 <td>
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Source</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${capitalizeFirstLetter(reservation.bookingSource ?? "direct")}</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── INTRO ── -->
//         <tr>
//           <td style="padding:26px 32px 10px;">
//             <p style="margin:0;font-size:14px;color:#444444;line-height:1.75;">Hi <strong style="color:#1a1a2e;">${primaryGuest?.firstName ?? ""} ${primaryGuest?.lastName ?? ""}</strong>,</p>
//             <p style="margin:8px 0 0;font-size:14px;color:#444444;line-height:1.75;">Your booking is <strong style="color:#00b5c8;">Confirmed</strong>. All the details are below &mdash; we look forward to welcoming you.</p>
//           </td>
//         </tr>

//         <!-- ── STAY DETAILS ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Stay Details</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
//               <tr>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-in</div>
//                   <div style="font-size:28px;font-weight:700;color:#00b5c8;line-height:1;">${getDay(reservationStartDate)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(reservationStartDate)}</div>
//                   <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(reservationStartDate)}</div>
//                   <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">After 2:00 PM</div>
//                 </td>
//                 <td width="12%" style="border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;background-color:#fafafa;text-align:center;vertical-align:middle;padding:8px 0;">
//                   <div style="font-size:18px;font-weight:700;color:#00b5c8;">${numberOfNights}</div>
//                   <div style="font-size:9px;color:#bbbbbb;margin-top:1px;">night${numberOfNights > 1 ? "s" : ""}</div>
//                 </td>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-out</div>
//                   <div style="font-size:28px;font-weight:700;color:#00b5c8;line-height:1;">${getDay(reservationEndDate)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(reservationEndDate)}</div>
//                   <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(reservationEndDate)}</div>
//                   <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">Before 12:00 PM</div>
//                 </td>
//               </tr>
//             </table>

//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Guests</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${guestCountStr}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Rooms</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${reservation.numberOfRooms} Room${reservation.numberOfRooms > 1 ? "s" : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Rate Plan</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${reservation.ratePlanName ?? ""}</td>
//                 </tr></table>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── ROOM ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Room</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
//               ${roomImg ? `
//               <tr>
//                 <td style="padding:0;">
//                   <img src="${roomImg}" alt="${room.roomName}" width="620"
//                        style="width:100%;max-width:620px;height:150px;object-fit:cover;display:block;" />
//                 </td>
//               </tr>` : ""}
//               <tr>
//                 <td style="padding:14px 18px;">
//                   <div style="font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">${room.roomName}</div>
//                   <div style="font-size:12px;color:#999999;margin-bottom:9px;">
//                     ${room.roomType}${room.roomView ? ` &middot; ${room.roomView} view` : ""}${room.maxOccupancy ? ` &middot; Max ${room.maxOccupancy} guests` : ""}
//                   </div>
//                   ${room.description ? `<p style="font-size:12px;color:#777777;line-height:1.6;margin-bottom:9px;">${room.description}</p>` : ""}
//                   <table role="presentation" cellpadding="0" cellspacing="4" border="0">
//                     <tr>
//                       <td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">Room Only</span></td>
//                       ${room.numberOfBedrooms ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">${room.numberOfBedrooms} Bedroom${room.numberOfBedrooms > 1 ? "s" : ""}</span></td>` : ""}
//                       ${room.roomView ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">${room.roomView} view</span></td>` : ""}
//                       ${room.maxOccupancy ? `<td><span style="font-size:11px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555555;padding:3px 10px;border-radius:20px;display:inline-block;">Max ${room.maxOccupancy} guests</span></td>` : ""}
//                     </tr>
//                   </table>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── GUEST DETAILS ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Guest Details</div>
//             ${guestRows}
//           </td>
//         </tr>

//         <!-- ── PROPERTY ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Property</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Address</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">City &amp; State</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Country</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.country}</td>
//                 </tr></table>
//               </td></tr>
//               ${propertyAddress.landmark ? `
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Landmark</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">Near ${propertyAddress.landmark.replace(/\n/g, " ").trim()}</td>
//                 </tr></table>
//               </td></tr>` : ""}
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Phone</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${property.propertyContact}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Email</td>
//                   <td align="right" style="font-size:12px;font-weight:600;">
//                     <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a>
//                   </td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             <!-- Static map (replace API key via env) -->
//            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
//   <tr>
//     <td style="border-radius:8px;background-color:#f0f9fa;border:1px solid #cceef2;">
//       <a href="${mapLinkUrl}" target="_blank"
//          style="display:inline-block;padding:11px 20px;font-size:12px;font-weight:700;color:#0096a8;text-decoration:none;letter-spacing:0.2px;">
//         &#x1F4CD;&nbsp; View Location on Google Maps &rarr;
//       </a>
//     </td>
//   </tr>
// </table>
//           </td>
//         </tr>

//         <!-- ── PRICE BREAKDOWN ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Price Breakdown</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

//               <!-- Base room rate -->
//               <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:13px;color:#666666;">Room rate (${numberOfNights} night${numberOfNights > 1 ? "s" : ""} &times; ${reservation.numberOfRooms} room${reservation.numberOfRooms > 1 ? "s" : ""})</td>
//                   <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">${formatCurrency(reservation.PricingBrakeDown?.amountBeforeTax, currency)}</td>
//                 </tr></table>
//               </td></tr>

//               ${addonRows}
//               ${taxRows}
//               ${promoRows}
//               ${promoCodeRow}
//               ${loyaltyRow}

//               <!-- Divider -->
//               <tr><td style="padding:4px 0;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:4px 0;" /></td></tr>

//               <!-- Total -->
//               <tr><td style="padding:8px 0 6px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:15px;font-weight:700;color:#1a1a2e;">Total Amount</td>
//                   <td align="right" style="font-size:19px;font-weight:700;color:#00b5c8;">${formatCurrency(reservation.PricingBrakeDown?.totalAmount, currency)}</td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             <!-- Pay pill -->
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#e0f7fa;border-radius:8px;margin-top:10px;">
//               <tr><td style="padding:10px 14px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;font-weight:700;color:#0096a8;">
//                     ${reservation.paymentMethod === "pay_at_hotel" ? "&#127968; Pay at Hotel" : "&#10003; Paid Online"}
//                   </td>
//                   <td align="right" style="font-size:13px;font-weight:700;color:#0096a8;">${formatCurrency(reservation.PricingBrakeDown?.currentChargeableAmount, currency)}</td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             ${payLaterPill}
//           </td>
//         </tr>

//         ${policiesSection}

//         <!-- ── IMPORTANT NOTES ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;">
//               <tr><td style="padding:13px 15px;">
//                 <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:7px;">IMPORTANT INFORMATION</div>
//                 <ul style="padding-left:16px;margin:0;">
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">Please carry a valid government-issued photo ID at check-in (Passport, Aadhaar, Driving Licence accepted).</li>
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">GST invoice can be collected directly from the property.</li>
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">Payment method: ${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</li>
//                 </ul>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── ACTION BUTTONS ── -->
//         <tr>
//           <td style="background-color:#f7f8fa;padding:24px 32px;text-align:center;">
//             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
//               <tr>
//                 <td style="padding-right:12px;">
//                   <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode.split("-")[1] ?? ""}"
//                      style="display:inline-block;background-color:#00b5c8;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.2px;">
//                     Manage My Booking
//                   </a>
//                 </td>
//                 <td>
//                   <a href="https://bookings.revchilltech.com/cancel?propertyCode=${property.propertyCode}&bookingCode=${reservation.bookingCode.split("-")[1] ?? ""}"
//                      style="display:inline-block;background-color:#ffffff;color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;border:1px solid #fecaca;letter-spacing:0.2px;">
//                     Cancel Booking
//                   </a>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── FOOTER ── -->
//         <tr>
//           <td style="background-color:#f3f4f6;padding:22px 32px;text-align:center;border-top:1px solid #e8e8e8;">
//             <p style="margin:0 0 6px;font-size:13px;color:#555555;">
//               Questions? <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a> &middot; ${property.propertyContact}
//             </p>
//             <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;line-height:1.6;">
//               This is an automated email from ${property.propertyName}. Please do not reply directly to this message.
//             </p>
//             <p style="margin:0;font-size:11px;color:#bbbbbb;">
//               Powered by <strong style="color:#00b5c8;">RevChill</strong>
//             </p>
//           </td>
//         </tr>

//       </table>
//     </td>
//   </tr>
// </table>

// </body>
// </html>`;
// };
// export const BookingCancellationEmail = ({
//   reservation,
//   property,
//   propertyAddress,
//   room,
//   policies,
// }: EmailTemplateProps): string => {

//   const {  guestDetails, reservationStartDate, reservationEndDate } = reservation;
//   const currency = reservation.currencyCode 
//   const primaryGuest = guestDetails?.[0];
//   const numberOfNights = reservation.numberOfNights || 1;
//   const propertyImg = property.image?.[0] ?? "";

//   // ── Derive guest counts from guestDetails (since guests object may be missing) ──
//   const adults = (guestDetails ?? []).filter(g => g.type === "adult").length;
//   const children = (guestDetails ?? []).filter(g => g.type === "child").length;
//   const guestCountStr = [
//     adults > 0 ? `${adults} Adult${adults !== 1 ? "s" : ""}` : "",
//     children > 0 ? `${children} Child${children !== 1 ? "ren" : ""}` : "",
//   ].filter(Boolean).join(", ");

//   // ── Derive number of rooms from finalPrice breakdown ──
//   const numberOfRooms = reservation.numberOfRooms
//     ?? (reservation.PricingBrakeDown?.AddonBrakeDowns?.length ? 1 : 1); // fallback to 1

//   const hasRefund =
//     Number(reservation?.refundAmount || 0) > 0 &&
//     reservation.paymentMethod !== "pay_at_hotel";

//   const guestRows = (guestDetails ?? []).map((g, i) => `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="${i < (guestDetails?.length ?? 0) - 1 ? "border-bottom:1px solid #f5f5f5;padding-bottom:10px;margin-bottom:10px;" : ""}">
//     <tr>
//       <td width="40" style="vertical-align:top;padding-top:2px;">
//         <div style="width:36px;height:36px;border-radius:50%;background-color:#f3f4f6;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#6b7280;">
//           ${initials(g)}
//         </div>
//       </td>
//       <td style="padding-left:12px;vertical-align:top;">
//         <div style="font-size:13px;font-weight:600;color:#1a1a2e;">
//           ${g.firstName ?? ""} ${g.lastName ?? ""}
//           ${i === 0 ? `<span style="background-color:#6b7280;color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-left:6px;display:inline-block;vertical-align:middle;">Primary</span>` : ""}
//         </div>
//         <div style="font-size:11px;color:#aaaaaa;margin-top:2px;line-height:1.5;">
//           ${guestLabel(g)}${g.dateOfBirth ? ` &middot; DOB: ${formatDate(g.dateOfBirth)}` : ""}
//           ${i === 0 && reservation.bookingUserEmail ? `<br>${reservation.bookingUserEmail}` : ""}
//           ${i === 0 && reservation.bookingUserPhone ? ` &middot; ${reservation.bookingUserPhone}` : ""}
//         </div>
//       </td>
//     </tr>
//   </table>`).join("");

//   return `<!DOCTYPE html>
// <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <meta http-equiv="X-UA-Compatible" content="IE=edge">
//   <meta name="x-apple-disable-message-reformatting">
//   <title>Booking Cancelled &ndash; ${property.propertyName}</title>
//   <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
//   <style>
//     body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
//     table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
//     img { -ms-interpolation-mode:bicubic; border:0; display:block; }
//     @media only screen and (max-width:600px) {
//       .mobile-pad { padding-left:16px !important; padding-right:16px !important; }
//       .mobile-hide { display:none !important; }
//     }
//   </style>
// </head>
// <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
//   <tr>
//     <td align="center" style="padding:24px 16px;">
//       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

//         <!-- ── HEADER ── -->
//         <tr>
//           <td style="background-color:#0d1b2a;padding:18px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 <td>
//                   <img src="https://extranet.revchilltech.com/revchill.png" alt="RevChill" height="36" style="height:36px;display:block;" />
//                 </td>
//                 <td align="right">
//                   <span style="background-color:#dc2626;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;display:inline-block;">Cancelled</span>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── HERO IMAGE ── -->
//         <tr>
//           <td style="padding:0;position:relative;">
//             ${propertyImg
//       ? `<img src="${propertyImg}" alt="${property.propertyName}" width="620" style="width:100%;max-width:620px;height:200px;object-fit:cover;display:block;opacity:0.65;" />`
//       : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#1a1a2e 0%,#4b5563 100%);display:block;"></div>`
//     }
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.72) 100%);">
//               <tr>
//                 <td style="padding:20px 32px 18px;">
//                   ${property.starRating ? `<div style="color:#9ca3af;font-size:13px;margin-bottom:5px;">${starsHtml(property.starRating)}</div>` : ""}
//                   <div style="font-size:21px;font-weight:700;color:rgba(255,255,255,0.75);margin-bottom:3px;">${property.propertyName}</div>
//                   <div style="font-size:13px;color:rgba(255,255,255,0.60);">${propertyAddress.city}, ${propertyAddress.state} &middot; ${propertyAddress.country}</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── META BAR ── -->
//         <tr>
//           <td style="background-color:#111d2e;padding:13px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 ${reservation.bookingCode ? `
//                 <td style="padding-right:24px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booking ID</div>
//                   <div style="font-size:12px;font-weight:600;color:#9ca3af;">${reservation.bookingCode.split("-")[1]}</div>
//                 </td>` : ""}
//                 ${reservation.bookedAt ? `
//                 <td style="padding-right:24px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Originally Booked</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${formatDate(reservation.bookedAt)}</div>
//                 </td>` : ""}
//                 <td>
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Status</div>
//                   <div style="font-size:12px;font-weight:600;color:#ef4444;">Cancelled</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── INTRO ── -->
//         <tr>
//           <td style="padding:26px 32px 10px;">
//             <p style="margin:0;font-size:14px;color:#444444;line-height:1.75;">Hi <strong style="color:#1a1a2e;">${primaryGuest?.firstName ?? ""} ${primaryGuest?.lastName ?? ""}</strong>,</p>
//             <p style="margin:8px 0 16px;font-size:14px;color:#444444;line-height:1.75;">We&rsquo;ve confirmed the cancellation of your booking at <strong>${property.propertyName}</strong>. We hope to welcome you another time.</p>

//             ${hasRefund ? `
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
//               <tr>
//                 <td style="padding:15px 18px;">
//                   <div style="font-size:11px;font-weight:700;color:#15803d;margin-bottom:3px;">REFUND INITIATED</div>
//                   <p style="margin:0 0 7px;font-size:12px;color:#166534;line-height:1.6;">
//                     Your refund is being processed and will be credited to your original payment method within 5&ndash;7 business days.
//                   </p>
//                   <div style="font-size:22px;font-weight:700;color:#15803d;">${formatCurrency(reservation?.refundAmount, currency)}</div>
//                 </td>
//               </tr>
//             </table>` : `
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
//               <tr>
//                 <td style="padding:15px 18px;">
//                   <div style="font-size:11px;font-weight:700;color:#991b1b;margin-bottom:3px;">NO REFUND APPLICABLE</div>
//                   <div style="font-size:12px;color:#b91c1c;line-height:1.6;">As per the cancellation policy, no refund is applicable for this cancellation.</div>
//                 </td>
//               </tr>
//             </table>`}
//           </td>
//         </tr>

//         <!-- ── CANCELLED RESERVATION ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Cancelled Reservation</div>

//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;opacity:0.6;">
//               <tr>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-in (Was)</div>
//                   <div style="font-size:28px;font-weight:700;color:#9ca3af;line-height:1;text-decoration:line-through;">${getDay(reservationStartDate)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#aaaaaa;margin-top:2px;">${getMonYr(reservationStartDate)}</div>
//                   <div style="font-size:11px;color:#bbbbbb;margin-top:1px;">${getWeekday(reservationStartDate)}</div>
//                 </td>
//                 <td width="12%" style="border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;background-color:#fafafa;text-align:center;vertical-align:middle;padding:8px 0;">
//                   <div style="font-size:18px;font-weight:700;color:#9ca3af;">${numberOfNights}</div>
//                   <div style="font-size:9px;color:#bbbbbb;margin-top:1px;">night${numberOfNights > 1 ? "s" : ""}</div>
//                 </td>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-out (Was)</div>
//                   <div style="font-size:28px;font-weight:700;color:#9ca3af;line-height:1;text-decoration:line-through;">${getDay(reservationEndDate)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#aaaaaa;margin-top:2px;">${getMonYr(reservationEndDate)}</div>
//                   <div style="font-size:11px;color:#bbbbbb;margin-top:1px;">${getWeekday(reservationEndDate)}</div>
//                 </td>
//               </tr>
//             </table>

//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Room</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${room.roomName}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Guests</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${guestCountStr}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Rooms</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${numberOfRooms} Room${numberOfRooms > 1 ? "s" : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Booking Amount</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${formatCurrency(reservation.PricingBrakeDown?.totalAmount, currency)}</td>
//                 </tr></table>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── GUEST DETAILS ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Guest Details</div>
//             ${guestRows}
//           </td>
//         </tr>

//         <!-- ── PROPERTY ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Property</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Name</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${property.propertyName}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Address</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">City &amp; State</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Phone</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${property.propertyContact}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Email</td>
//                   <td align="right" style="font-size:12px;font-weight:600;">
//                     <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a>
//                   </td>
//                 </tr></table>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── ACTION BUTTONS ── -->
//         <tr>
//           <td style="background-color:#f7f8fa;padding:24px 32px;text-align:center;">
//             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
//               <tr>
//                 <td style="padding-right:12px;">
//                   <a href="https://bookings.revchilltech.com/?propertyCode=${property.propertyCode}"
//                      style="display:inline-block;background-color:#00b5c8;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.2px;">
//                     Book Again
//                   </a>
//                 </td>
//                 <td>
//                   <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}"
//                      style="display:inline-block;background-color:#ffffff;color:#555555;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;border:1px solid #dddddd;letter-spacing:0.2px;">
//                     My Bookings
//                   </a>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── FOOTER ── -->
//         <tr>
//           <td style="background-color:#f3f4f6;padding:22px 32px;text-align:center;border-top:1px solid #e8e8e8;">
//             <p style="margin:0 0 6px;font-size:13px;color:#555555;">
//               Questions about your cancellation? <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a> &middot; ${property.propertyContact}
//             </p>
//             <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;line-height:1.6;">
//               This is an automated cancellation confirmation from ${property.propertyName}. Please do not reply directly.
//             </p>
//             <p style="margin:0;font-size:11px;color:#bbbbbb;">
//               Powered by <strong style="color:#00b5c8;">RevChill</strong>
//             </p>
//           </td>
//         </tr>

//       </table>
//     </td>
//   </tr>
// </table>

// </body>
// </html>`;
// };

// export const BookingAmendmentEmail = ({
//   property,
//   propertyAddress,
//   room,
//   updatedPayload,
//   reservation,
// }: UpdateReservationPayload): string => {

//   const finalPrice = updatedPayload.finalPrice;
//   const guestDetails = updatedPayload.guests;           
//   const currency = updatedPayload.currencyCode || reservation.currencyCode || "INR";

//   // ── Dates: old = reservation, new = updatedPayload ──────────────
//   const oldCheckIn = reservation.reservationStartDate;
//   const oldCheckOut = reservation.reservationEndDate;
//   const newCheckIn = new Date(updatedPayload.checkInDate);
//   const newCheckOut = new Date(updatedPayload.checkOutDate);

//   // ── Nights ──────────────────────────────────────────────────────
//   const oldNights = Math.max(1, Math.ceil(
//     (new Date(oldCheckOut).getTime() - new Date(oldCheckIn).getTime()) / 86400000
//   ));
//   const newNights = Math.max(1, Math.ceil(
//     (new Date(newCheckOut).getTime() - new Date(newCheckIn).getTime()) / 86400000
//   ));

//   // ── Rooms ────────────────────────────────────────────────────────
//   const oldRooms = updatedPayload.previousRooms || 1;
//   const newRooms = updatedPayload.requestedRooms || 1;

//   // ── Guests ───────────────────────────────────────────────────────
//   const primaryGuest = guestDetails?.[0] ?? reservation.reservationGuests?.[0];
//   const newAdults = (guestDetails ?? []).filter(g => g.type === "adult").length;
//   const newChildren = (guestDetails ?? []).filter(g => g.type !== "adult").length;
//   const oldAdults = (reservation.reservationGuests ?? []).filter(g => g.type === "adult").length || newAdults;
//   const oldChildren = (reservation.reservationGuests ?? []).filter(g => g.type !== "adult").length || newChildren;

//   // ── Old vs new amounts ───────────────────────────────────────────
//   const oldTotal = reservation.amount || 0;
//   const newTotal = finalPrice.totalAmount || 0;
//   const diff = newTotal - oldTotal;

//   const propertyImg = property.image?.[0] ?? "";
//   const mapLinkUrl = `https://maps.google.com/?q=${propertyAddress.latitude},${propertyAddress.longitude}`;

//   // ── Guest rows ───────────────────────────────────────────────────
//   const guestRows = (guestDetails ?? []).map((g, i) => `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="${i < (guestDetails?.length ?? 0) - 1 ? "border-bottom:1px solid #f5f5f5;padding-bottom:10px;margin-bottom:10px;" : ""}">
//     <tr>
//       <td width="40" style="vertical-align:top;padding-top:2px;">
//         <div style="width:36px;height:36px;border-radius:50%;background-color:#e0f7fa;text-align:center;line-height:36px;font-size:12px;font-weight:700;color:#0096a8;">
//           ${`${g.firstName?.[0] ?? ""}${g.lastName?.[0] ?? ""}`.toUpperCase()}
//         </div>
//       </td>
//       <td style="padding-left:12px;vertical-align:top;">
//         <div style="font-size:13px;font-weight:600;color:#1a1a2e;">
//           ${g.firstName ?? ""} ${g.lastName ?? ""}
//           ${i === 0 ? `<span style="background-color:#00b5c8;color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-left:6px;display:inline-block;vertical-align:middle;">Primary</span>` : ""}
//         </div>
//         <div style="font-size:11px;color:#aaaaaa;margin-top:2px;line-height:1.5;">
//           ${g.type === "adult" ? "Adult" : g.type === "child" ? "Child" : "Infant"}
//           ${g.dateOfBirth ? ` &middot; DOB: ${formatDate(g.dateOfBirth)}` : ""}
//           ${i === 0 && updatedPayload.bookingUserEmail ? `<br>${updatedPayload.bookingUserEmail}` : ""}
//           ${i === 0 && updatedPayload.bookingUserPhone ? ` &middot; ${updatedPayload.bookingUserPhone}` : ""}
//         </div>
//       </td>
//     </tr>
//   </table>`).join("");

//   // ── Add-on rows ──────────────────────────────────────────────────
//   const addonRows = (finalPrice?.totalAddonAmount ?? 0) > 0
//     ? (finalPrice?.addonBrakeDown ?? []).map((a: any) => `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#666666;">
//         ${a.name}${(a.quantity ?? 1) > 1 ? ` &times;${a.quantity}` : ""}
//         ${a.date ? `<span style="font-size:11px;color:#aaaaaa;"> &middot; ${new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>` : ""}
//       </td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(a.totalAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`).join("")
//     : "";

//   // ── Tax rows ─────────────────────────────────────────────────────
//   const taxRows = (finalPrice?.taxBrakeDown ?? []).map((t: any) => `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#666666;">${t.name}</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">+ ${formatCurrency(t.taxedAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`).join("");

//   // ── Promo rows ───────────────────────────────────────────────────
//   const promoRows = (finalPrice?.promotionBrakeDown ?? []).map((p: any) => {
//     const isPayLater = p.restrictionType === "payLater";
//     const label = p.discountType === "percentage"
//       ? `${p.discountValue}% off`
//       : formatCurrency(p.discountValue, currency);
//     const color = isPayLater ? "#ea580c" : "#16a34a";
//     const prefix = isPayLater ? "+" : "&minus;";
//     return `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:${color};">${p.name} (${label})${isPayLater ? " &mdash; Pay Later" : ""}</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:${color};">${prefix} ${formatCurrency(p.discountAmount, currency)}</td>
//     </tr></table>
//   </td></tr>`;
//   }).join("");

//   const promoCodeRow = (finalPrice?.promoCodeDiscount ?? 0) > 0 ? `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#16a34a;">Promo code discount</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(finalPrice?.promoCodeDiscount, currency)}</td>
//     </tr></table>
//   </td></tr>` : "";

//   const loyaltyRow = (finalPrice?.loyalityDiscount ?? 0) > 0 ? `
//   <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//       <td style="font-size:13px;color:#16a34a;">Loyalty discount</td>
//       <td align="right" style="font-size:13px;font-weight:600;color:#16a34a;">&minus; ${formatCurrency(finalPrice?.loyalityDiscount, currency)}</td>
//     </tr></table>
//   </td></tr>` : "";

//   // ── Pay-later pill ───────────────────────────────────────────────
//   const payLaterPill = (finalPrice?.latterpayableAmount ?? 0) > 0 ? `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#fff7ed;border-radius:8px;margin-top:8px;">
//     <tr><td style="padding:10px 14px;">
//       <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//         <td style="font-size:12px;font-weight:700;color:#ea580c;">&#8987; Amount Due at Hotel</td>
//         <td align="right" style="font-size:13px;font-weight:700;color:#ea580c;">${formatCurrency(finalPrice?.latterpayableAmount, currency)}</td>
//       </tr></table>
//     </td></tr>
//   </table>` : "";

//   // ── Extra to pay / Refund banner ─────────────────────────────────
//   const financialBanner = diff > 0 ? `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:16px;">
//     <tr><td style="padding:14px 18px;">
//       <div style="font-size:11px;font-weight:700;color:#991b1b;margin-bottom:3px;">ADDITIONAL PAYMENT REQUIRED</div>
//       <p style="margin:0 0 6px;font-size:12px;color:#b91c1c;line-height:1.6;">
//         Your updated booking costs more than the original. Please arrange payment of the difference.
//       </p>
//       <div style="font-size:22px;font-weight:700;color:#dc2626;">${formatCurrency(diff, currency)}</div>
//     </td></tr>
//   </table>` : diff < 0 ? `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//          style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:16px;">
//     <tr><td style="padding:14px 18px;">
//       <div style="font-size:11px;font-weight:700;color:#15803d;margin-bottom:3px;">REFUND INITIATED</div>
//       <p style="margin:0 0 6px;font-size:12px;color:#166534;line-height:1.6;">
//         Your updated booking costs less than the original. A refund will be credited within 5&ndash;7 business days.
//       </p>
//       <div style="font-size:22px;font-weight:700;color:#15803d;">${formatCurrency(Math.abs(diff), currency)}</div>
//     </td></tr>
//   </table>` : "";

//   // ── Date changed helper ──────────────────────────────────────────
//   const dateChanged = (oldCheckIn !== newCheckIn || oldCheckOut !== newCheckOut);
//   const roomsChanged = oldRooms !== newRooms;
//   const nightsChanged = oldNights !== newNights;

//   return `<!DOCTYPE html>
// <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <meta http-equiv="X-UA-Compatible" content="IE=edge">
//   <meta name="x-apple-disable-message-reformatting">
//   <title>Booking Updated &ndash; ${property.propertyName}</title>
//   <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
//   <style>
//     body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
//     table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
//     img { -ms-interpolation-mode:bicubic; border:0; display:block; }
//     @media only screen and (max-width:600px) {
//       .mobile-pad { padding-left:16px !important; padding-right:16px !important; }
//       .mobile-hide { display:none !important; }
//     }
//   </style>
// </head>
// <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

// <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
//   <tr>
//     <td align="center" style="padding:24px 16px;">
//       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

//         <!-- ── HEADER ── -->
//         <tr>
//           <td style="background-color:#0d1b2a;padding:18px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 <td>
//                   <img src="https://extranet.revchilltech.com/revchill.png" alt="RevChill" height="36" style="height:36px;display:block;" />
//                 </td>
//                 <td align="right">
//                   <span style="background-color:#2563eb;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;display:inline-block;">&#9998; Modified</span>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── HERO IMAGE ── -->
//         <tr>
//           <td style="padding:0;position:relative;">
//             ${propertyImg
//       ? `<img src="${propertyImg}" alt="${property.propertyName}" width="620" style="width:100%;max-width:620px;height:200px;object-fit:cover;display:block;" />`
//       : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#0d1b2a 0%,#1d4ed8 100%);display:block;"></div>`
//     }
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.68) 100%);">
//               <tr>
//                 <td style="padding:20px 32px 18px;">
//                   <div style="font-size:21px;font-weight:700;color:#ffffff;margin-bottom:3px;text-shadow:0 1px 4px rgba(0,0,0,0.4);">${property.propertyName}</div>
//                   <div style="font-size:13px;color:rgba(255,255,255,0.75);">${propertyAddress.city}, ${propertyAddress.state} &middot; ${propertyAddress.country}</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── META BAR ── -->
//         <tr>
//           <td style="background-color:#111d2e;padding:13px 32px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr>
//                 ${reservation.bookingCode ? `
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Booking ID</div>
//                   <div style="font-size:12px;font-weight:600;color:#60a5fa;">${reservation.bookingCode.split("-")[1] ?? reservation.bookingCode}</div>
//                 </td>` : ""}
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Originally Booked</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${formatDate(reservation.bookedAt)}</div>
//                 </td>
//                 <td style="padding-right:20px;">
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Payment</div>
//                   <div style="font-size:12px;font-weight:600;color:#ffffff;">${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</div>
//                 </td>
//                 <td>
//                   <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:3px;">Status</div>
//                   <div style="font-size:12px;font-weight:600;color:#60a5fa;">Modified</div>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── INTRO + FINANCIAL BANNER ── -->
//         <tr>
//           <td style="padding:26px 32px 10px;">
//             <p style="margin:0;font-size:14px;color:#444444;line-height:1.75;">Hi <strong style="color:#1a1a2e;">${primaryGuest?.firstName ?? ""} ${primaryGuest?.lastName ?? ""}</strong>,</p>
//             <p style="margin:8px 0 18px;font-size:14px;color:#444444;line-height:1.75;">Your booking at <strong>${property.propertyName}</strong> has been <strong style="color:#2563eb;">successfully updated</strong>. Please review the changes below.</p>
//             ${financialBanner}
//           </td>
//         </tr>

//         <!-- ── WHAT CHANGED ── -->
//         <tr>
//           <td style="padding:0 32px 22px;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
//               <tr><td style="padding:14px 18px;">
//                 <div style="font-size:11px;font-weight:700;color:#1e40af;margin-bottom:10px;letter-spacing:0.5px;">WHAT CHANGED</div>
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//                   ${dateChanged ? `
//                   <tr>
//                     <td style="font-size:12px;color:#1e40af;padding:3px 0;">&#128197; Dates</td>
//                     <td align="right" style="font-size:12px;color:#1e40af;">
//                       <span style="text-decoration:line-through;color:#93c5fd;">${formatDate(oldCheckIn)} &rarr; ${formatDate(oldCheckOut)}</span>
//                       &nbsp;&rarr;&nbsp;
//                       <strong>${formatDate(newCheckIn)} &rarr; ${formatDate(newCheckOut)}</strong>
//                     </td>
//                   </tr>` : ""}
//                   ${nightsChanged ? `
//                   <tr>
//                     <td style="font-size:12px;color:#1e40af;padding:3px 0;">&#127769; Nights</td>
//                     <td align="right" style="font-size:12px;color:#1e40af;">
//                       <span style="text-decoration:line-through;color:#93c5fd;">${oldNights} night${oldNights !== 1 ? "s" : ""}</span>
//                       &nbsp;&rarr;&nbsp;
//                       <strong>${newNights} night${newNights !== 1 ? "s" : ""}</strong>
//                     </td>
//                   </tr>` : ""}
//                   ${roomsChanged ? `
//                   <tr>
//                     <td style="font-size:12px;color:#1e40af;padding:3px 0;">&#127968; Rooms</td>
//                     <td align="right" style="font-size:12px;color:#1e40af;">
//                       <span style="text-decoration:line-through;color:#93c5fd;">${oldRooms} room${oldRooms !== 1 ? "s" : ""}</span>
//                       &nbsp;&rarr;&nbsp;
//                       <strong>${newRooms} room${newRooms !== 1 ? "s" : ""}</strong>
//                     </td>
//                   </tr>` : ""}
//                   <tr>
//                     <td style="font-size:12px;color:#1e40af;padding:3px 0;">&#128176; Total Amount</td>
//                     <td align="right" style="font-size:12px;color:#1e40af;">
//                       <span style="text-decoration:line-through;color:#93c5fd;">${formatCurrency(oldTotal, currency)}</span>
//                       &nbsp;&rarr;&nbsp;
//                       <strong>${formatCurrency(newTotal, currency)}</strong>
//                     </td>
//                   </tr>
//                 </table>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── UPDATED STAY DETAILS ── -->
//         <tr>
//           <td style="padding:22px 32px;border-top:1px solid #efefef;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Updated Stay Details</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
//               <tr>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-in</div>
//                   <div style="font-size:28px;font-weight:700;color:#2563eb;line-height:1;">${getDay(newCheckIn)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(newCheckIn)}</div>
//                   <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(newCheckIn)}</div>
//                   <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">After 2:00 PM</div>
//                 </td>
//                 <td width="12%" style="border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;background-color:#fafafa;text-align:center;vertical-align:middle;padding:8px 0;">
//                   <div style="font-size:18px;font-weight:700;color:#2563eb;">${newNights}</div>
//                   <div style="font-size:9px;color:#bbbbbb;margin-top:1px;">night${newNights > 1 ? "s" : ""}</div>
//                 </td>
//                 <td width="44%" style="padding:14px 16px;vertical-align:top;">
//                   <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#bbbbbb;margin-bottom:5px;">Check-out</div>
//                   <div style="font-size:28px;font-weight:700;color:#2563eb;line-height:1;">${getDay(newCheckOut)}</div>
//                   <div style="font-size:12px;font-weight:500;color:#333333;margin-top:2px;">${getMonYr(newCheckOut)}</div>
//                   <div style="font-size:11px;color:#999999;margin-top:1px;">${getWeekday(newCheckOut)}</div>
//                   <div style="font-size:10px;color:#bbbbbb;margin-top:5px;">Before 12:00 PM</div>
//                 </td>
//               </tr>
//             </table>

//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Guests</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">
//                     ${newAdults > 0 ? `${newAdults} Adult${newAdults !== 1 ? "s" : ""}` : ""}
//                     ${newChildren > 0 ? `, ${newChildren} Child${newChildren !== 1 ? "ren" : ""}` : ""}
//                   </td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Rooms</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${newRooms} Room${newRooms > 1 ? "s" : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Room</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${room.roomName}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Rate Plan</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${reservation.ratePlanName ?? ""}</td>
//                 </tr></table>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── GUEST DETAILS ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Guest Details</div>
//             ${guestRows}
//           </td>
//         </tr>

//         <!-- ── PROPERTY ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Property</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Address</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.addressLine1}${propertyAddress.addressLine2 ? ", " + propertyAddress.addressLine2 : ""}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">City &amp; State</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Country</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${propertyAddress.country}</td>
//                 </tr></table>
//               </td></tr>
//               ${propertyAddress.landmark ? `
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Landmark</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">Near ${propertyAddress.landmark.replace(/\n/g, " ").trim()}</td>
//                 </tr></table>
//               </td></tr>` : ""}
//               <tr><td style="padding:9px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Phone</td>
//                   <td align="right" style="font-size:12px;font-weight:600;color:#1a1a2e;">${property.propertyContact}</td>
//                 </tr></table>
//               </td></tr>
//               <tr><td style="padding:9px 0;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;color:#999999;">Email</td>
//                   <td align="right" style="font-size:12px;font-weight:600;">
//                     <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a>
//                   </td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
//               <tr>
//                 <td style="border-radius:8px;background-color:#f0f9fa;border:1px solid #cceef2;">
//                   <a href="${mapLinkUrl}" target="_blank"
//                      style="display:inline-block;padding:11px 20px;font-size:12px;font-weight:700;color:#0096a8;text-decoration:none;letter-spacing:0.2px;">
//                     &#x1F4CD;&nbsp; View Location on Google Maps &rarr;
//                   </a>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── PRICE BREAKDOWN ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;margin-bottom:14px;">Updated Price Breakdown</div>
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

//               <!-- Base room rate -->
//               <tr><td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:13px;color:#666666;">Room rate (${newNights} night${newNights > 1 ? "s" : ""} &times; ${newRooms} room${newRooms > 1 ? "s" : ""})</td>
//                   <td align="right" style="font-size:13px;font-weight:600;color:#1a1a2e;">${formatCurrency(finalPrice?.amountBeforeTax, currency)}</td>
//                 </tr></table>
//               </td></tr>

//               ${addonRows}
//               ${taxRows}
//               ${promoRows}
//               ${promoCodeRow}
//               ${loyaltyRow}

//               <!-- Divider -->
//               <tr><td style="padding:4px 0;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:4px 0;" /></td></tr>

//               <!-- Total -->
//               <tr><td style="padding:8px 0 6px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:15px;font-weight:700;color:#1a1a2e;">Updated Total</td>
//                   <td align="right" style="font-size:19px;font-weight:700;color:#2563eb;">${formatCurrency(finalPrice?.totalAmount, currency)}</td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             <!-- Pay pill -->
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#eff6ff;border-radius:8px;margin-top:10px;">
//               <tr><td style="padding:10px 14px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
//                   <td style="font-size:12px;font-weight:700;color:#1d4ed8;">
//                     ${reservation.paymentMethod === "pay_at_hotel" ? "&#127968; Pay at Hotel" : "&#10003; Paid Online"}
//                   </td>
//                   <td align="right" style="font-size:13px;font-weight:700;color:#1d4ed8;">${formatCurrency(finalPrice?.currentChargeableAmount, currency)}</td>
//                 </tr></table>
//               </td></tr>
//             </table>

//             ${payLaterPill}
//           </td>
//         </tr>

//         <!-- ── IMPORTANT NOTES ── -->
//         <tr>
//           <td style="padding:22px 32px;border-bottom:1px solid #efefef;">
//             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
//                    style="background-color:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;">
//               <tr><td style="padding:13px 15px;">
//                 <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:7px;">IMPORTANT INFORMATION</div>
//                 <ul style="padding-left:16px;margin:0;">
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">Please carry a valid government-issued photo ID at check-in.</li>
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">This email reflects your most recent booking changes. Previous confirmation emails are no longer valid.</li>
//                   <li style="font-size:12px;color:#78350f;line-height:1.8;">Payment method: ${(reservation.paymentMethod ?? "").split("_").map(capitalizeFirstLetter).join(" ")}</li>
//                 </ul>
//               </td></tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── ACTION BUTTONS ── -->
//         <tr>
//           <td style="background-color:#f7f8fa;padding:24px 32px;text-align:center;">
//             <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
//               <tr>
//                 <td style="padding-right:12px;">
//                   <a href="https://bookings.revchilltech.com/my-trip?propertyCode=${property.propertyCode}&bookingCode=${(reservation.bookingCode ?? "").split("-")[1] ?? ""}"
//                      style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.2px;">
//                     View My Booking
//                   </a>
//                 </td>
//                 <td>
//                   <a href="https://bookings.revchilltech.com/cancel?propertyCode=${property.propertyCode}&bookingCode=${(reservation.bookingCode ?? "").split("-")[1] ?? ""}"
//                      style="display:inline-block;background-color:#ffffff;color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:8px;border:1px solid #fecaca;letter-spacing:0.2px;">
//                     Cancel Booking
//                   </a>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>

//         <!-- ── FOOTER ── -->
//         <tr>
//           <td style="background-color:#f3f4f6;padding:22px 32px;text-align:center;border-top:1px solid #e8e8e8;">
//             <p style="margin:0 0 6px;font-size:13px;color:#555555;">
//               Questions? <a href="mailto:${property.propertyEmail}" style="color:#00b5c8;text-decoration:none;">${property.propertyEmail}</a> &middot; ${property.propertyContact}
//             </p>
//             <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;line-height:1.6;">
//               This is an automated email from ${property.propertyName}. Please do not reply directly to this message.
//             </p>
//             <p style="margin:0;font-size:11px;color:#bbbbbb;">
//               Powered by <strong style="color:#00b5c8;">RevChill</strong>
//             </p>
//           </td>
//         </tr>

//       </table>
//     </td>
//   </tr>
// </table>

// </body>
// </html>`;
// };


// export const EmailTemplates = {
//   BookingConfirmation: BookingConfirmationEmail,
//   BookingAmendment: BookingAmendmentEmail,
//   BookingCancellation: BookingCancellationEmail,
// };