interface PropertyDetails {
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string;
    image: string[];
    logo: string | null;
    primaryColor: string;
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

interface RoomDetails {
    roomName: string;
    roomType: string;
    image: string[];
    description: string | null;
    maxOccupancy: number;
    roomSize: number;
    roomUnit: string;
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

interface ReservationGuest {
    firstName: string;
    lastName: string;
    type: string;
    age: number | null;
}

interface AddOnDetails {
    name: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
    date: Date;
    type: string;
    images: string[];
}

interface ReservationDetails {
    bookingCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    bookingSource: string;
    bookingStatus: string;
    amount: number;
    currencyCode: string;
    createdAt: Date;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    guests: any;
    paymentMethod: string;
    paidAmount: number;
}

interface PriceBreakdown {
    totalAmount: number;
    totalTax: number;
    baseRatePerNight: number;
    numberOfNights: number;
    requestedRooms: number;
    dailyBreakdown: any[];
    breakdown: any;
    tax: any[];
}

interface BookingVoucherData {
    property: PropertyDetails;
    room: RoomDetails | null;
    ratePlanName: string | null;
    reservation: ReservationDetails;
    reservationGuests: ReservationGuest[];
    primaryGuest: GuestDetails | null;
    addOns: AddOnDetails[];
    priceBreakdown: PriceBreakdown | null;
    finalPrice: any;
}

const toTitleCase = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const formatCurrency = (amount: any, currency: string): string => {
    const num = Number(amount);
    if (isNaN(num) || !currency) return `0.00`;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return `${currency} ${num.toFixed(2)}`;
    }
};
export const generateBookingVoucherHTML = (data: any): string => {
    const {
        property,
        room,
        reservation,
        primaryGuest,
        addOns,
        priceBreakdown,
        finalPrice,
        reservationGuests,
        ratePlanName,
    } = data;
    const formatDate = (date: Date): string =>
        new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const formatCurrency = (
        amount: number,
        currency: string = 'EUR'
    ): string => {
        const symbols: Record<string, string> = {
            INR: '₹',
            USD: '$',
            EUR: '€',
            GBP: '£',
        };
        return `${symbols[currency] || currency} ${Number(amount).toFixed(2)}`;
    };

    const formatPaymentMethod = (method: string): string =>
        method
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const guests = Array.isArray(reservation.guests) ? reservation.guests : [];
    const adults = guests.filter((g: any) => g.type === 'adult');
    const children = guests.filter((g: any) => g.type === 'child');

    const totalAmount = Number(reservation.amount);
    const paidAmount = Number(reservation.paidAmount);
    const balance = totalAmount - paidAmount;
    const taxAmount = priceBreakdown ? Number(priceBreakdown.totalTax) : 0;
    const baseAmount = finalPrice?.amountBeforeTax ?? totalAmount - taxAmount;
    const addonAmount = finalPrice?.totalAddonAmount ?? 0;
    const promoDiscount = finalPrice?.totalPromotionAmount ?? 0;
    const laterPayable = finalPrice?.latterpayableAmount ?? 0;
    const currentChargeable =
        finalPrice?.currentChargeableAmount ?? totalAmount;

    // Group daily breakdown by date for clean display
    const dailyByDate: Record<string, any[]> = {};
    if (priceBreakdown?.dailyBreakdown) {
        for (const day of priceBreakdown.dailyBreakdown) {
            if (!dailyByDate[day.date]) dailyByDate[day.date] = [];
            dailyByDate[day.date].push(day);
        }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Booking Voucher - ${reservation.bookingCode}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size:11px; color:#222; background:#fff; line-height:1.6; }
  .page { width:210mm; margin:0 auto; padding:12mm 14mm; background:#fff; }

  /* ── Header ── */
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1e293b; padding-bottom:14px; margin-bottom:18px; }
  .prop-name { font-size:22px; font-weight:700; color:#1e293b; margin-bottom:3px; }
  .stars { color:#f59e0b; font-size:15px; margin-bottom:6px; }
  .prop-contact { font-size:10px; color:#64748b; line-height:1.8; }
  .voucher-right { text-align:right; }
  .voucher-label { font-size:28px; font-weight:800; color:#1e293b; letter-spacing:1px; text-transform:uppercase; }
  .booking-pill { display:inline-block; margin-top:8px; background:#eff6ff; color:#2563eb; border:1px solid #93c5fd; border-radius:6px; padding:6px 14px; font-size:13px; font-weight:700; }
  .status-badge { display:inline-block; margin-top:6px; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; }
  .status-confirmed { background:#dcfce7; color:#166534; border:1px solid #86efac; }
  .status-pending   { background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
  .status-cancelled { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }

  /* ── Section ── */
  .section { margin-bottom:18px; }
  .section-title { font-size:11px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:0.6px; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-bottom:10px; }

  /* ── Info grid ── */
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .info-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; }
  .info-label { font-size:9px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:3px; }
  .info-value { font-size:12px; font-weight:600; color:#1e293b; }

  /* ── Room ── */
  .room-card { border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
  .room-images { display:flex; gap:6px; padding:10px; background:#f8fafc; overflow-x:auto; }
  .room-img { width:160px; height:105px; object-fit:cover; border-radius:5px; flex-shrink:0; border:1px solid #e2e8f0; }
  .room-info { padding:10px 12px; }
  .room-name { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:3px; }
  .room-meta { font-size:10px; color:#64748b; margin-bottom:5px; }
  .room-desc { font-size:10px; color:#475569; }

  /* ── Guests ── */
  .guest-list { display:flex; flex-wrap:wrap; gap:6px; }
  .guest-chip { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:20px; padding:4px 12px; font-size:10px; color:#334155; font-weight:500; }
  .guest-chip.adult { border-left:3px solid #3b82f6; }
  .guest-chip.child { border-left:3px solid #f59e0b; }

  /* ── Addons ── */
  .addon-card { display:flex; gap:10px; align-items:flex-start; border:1px solid #e2e8f0; border-radius:7px; padding:10px; margin-bottom:8px; background:#fafafa; }
  .addon-img { width:64px; height:64px; object-fit:cover; border-radius:5px; flex-shrink:0; border:1px solid #e2e8f0; }
  .addon-img-placeholder { width:64px; height:64px; border-radius:5px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .addon-name { font-size:12px; font-weight:600; color:#1e293b; margin-bottom:2px; }
  .addon-meta { font-size:10px; color:#64748b; margin-bottom:4px; }
  .addon-price { font-size:11px; font-weight:600; color:#2563eb; }
  .tag { display:inline-block; padding:1px 7px; border-radius:10px; font-size:9px; font-weight:700; text-transform:uppercase; margin-left:6px; }
  .tag-included { background:#dcfce7; color:#166534; }
  .tag-selected  { background:#dbeafe; color:#1e40af; }

  /* ── Daily breakdown ── */
  .day-block { border:1px solid #e2e8f0; border-radius:7px; margin-bottom:8px; overflow:hidden; }
  .day-header { background:#1e293b; color:#fff; padding:7px 12px; font-size:11px; font-weight:600; display:flex; justify-content:space-between; }
  .day-row { display:flex; justify-content:space-between; padding:6px 12px; border-bottom:1px solid #f1f5f9; font-size:10px; }
  .day-row:last-child { border-bottom:none; }
  .day-row-label { color:#64748b; }
  .day-row-value { font-weight:600; color:#1e293b; }

  /* ── Tax breakdown ── */
  .tax-list { display:flex; gap:8px; flex-wrap:wrap; }
  .tax-chip { background:#fef3c7; border:1px solid #fcd34d; border-radius:5px; padding:4px 10px; font-size:10px; color:#92400e; font-weight:600; }

  /* ── Financial summary ── */
  .summary-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; }
  .sum-row { display:flex; justify-content:space-between; padding:5px 0; font-size:11px; border-bottom:1px solid #f1f5f9; }
  .sum-row:last-child { border-bottom:none; }
  .sum-row.total { font-size:14px; font-weight:700; color:#1e293b; border-top:2px solid #1e293b; margin-top:8px; padding-top:10px; border-bottom:none; }
  .sum-row.paid { color:#166534; font-weight:600; }
  .sum-row.promo { color:#7c3aed; font-weight:600; }
  .sum-row.later { color:#d97706; font-weight:600; }
  .sum-row.balance { font-size:13px; font-weight:700; border-top:2px dashed #cbd5e1; margin-top:6px; padding-top:8px; border-bottom:none; }

  /* ── Promotions ── */
  .promo-card { background:#faf5ff; border:1px solid #d8b4fe; border-radius:6px; padding:8px 12px; margin-bottom:6px; font-size:10px; }
  .promo-name { font-weight:700; color:#6d28d9; margin-bottom:2px; }
  .promo-detail { color:#7c3aed; }

  /* ── Footer ── */
  .footer { margin-top:24px; padding-top:16px; border-top:2px solid #e2e8f0; text-align:center; font-size:9px; color:#94a3b8; }
  .notice { background:#fffbeb; border-left:4px solid #f59e0b; border-radius:4px; padding:10px 14px; margin-top:12px; font-size:10px; color:#78350f; text-align:left; }

  /* ── Two column layout ── */
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

  @media print { body { margin:0; } .page { padding:8mm; } }
</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ── -->
<div class="header" style="align-items:center;">
    <div>
${
    property.logo
        ? `<img src="${property.logo}" style="height:80px;width:auto;max-width:220px;object-fit:contain;margin-bottom:8px;" alt="logo"/>`
        : `<div style="width:56px;height:56px;background:${property.primaryColor};border-radius:7px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;">${property.propertyName.charAt(0)}</div>`
}   <div class="prop-name">${property.propertyName}</div>
      ${property.starRating ? `<div class="stars">${'★'.repeat(property.starRating)}${'☆'.repeat(5 - property.starRating)}</div>` : ''}
      <div class="prop-contact">
        ${property.propertyAddress ? `<div>${property.propertyAddress.addressLine1}, ${property.propertyAddress.city}, ${property.propertyAddress.state}</div>` : ''}
        <div>✉ ${property.propertyEmail} &nbsp;|&nbsp; ☎ ${property.propertyContact}</div>
      </div>
    </div>
    <div class="voucher-right">
      <div class="voucher-label">Booking Voucher</div>
      <div class="booking-pill">${reservation.bookingCode.split('-').pop()}</div><br/>
      <span class="status-badge status-${reservation.bookingStatus.toLowerCase()}">${reservation.bookingStatus}</span>
      <div style="font-size:10px;color:#94a3b8;margin-top:6px;">Booked on ${formatDate(reservation.createdAt)}</div>
    </div>
  </div>

  <!-- ── STAY DETAILS + GUEST INFO ── -->
  <div class="two-col" style="margin-bottom:18px;">
    <div class="section">
      <div class="section-title">Stay Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Check-In</div>
          <div class="info-value">${formatDate(reservation.checkInDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Check-Out</div>
          <div class="info-value">${formatDate(reservation.checkOutDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Duration</div>
          <div class="info-value">${nights} Night${nights > 1 ? 's' : ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Rooms</div>
          <div class="info-value">${priceBreakdown?.requestedRooms ?? 1} Room${(priceBreakdown?.requestedRooms ?? 1) > 1 ? 's' : ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Rate Plan</div>
  <div class="info-value">${ratePlanName ?? reservation.ratePlanCode ?? '—'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Payment</div>
          <div class="info-value">${formatPaymentMethod(reservation.paymentMethod)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Primary Guest</div>
      ${
          primaryGuest
              ? `
        <div class="info-grid">
          <div class="info-item" style="grid-column:1/-1;">
            <div class="info-label">Name</div>
            <div class="info-value">${primaryGuest.firstName} ${primaryGuest.lastName}</div>
          </div>
          ${primaryGuest.email ? `<div class="info-item" style="grid-column:1/-1;"><div class="info-label">Email</div><div class="info-value">${primaryGuest.email}</div></div>` : ''}
          ${primaryGuest.phoneNumber ? `<div class="info-item"><div class="info-label">Phone</div><div class="info-value">${primaryGuest.phoneNumber}</div></div>` : ''}
          <div class="info-item"><div class="info-label">Type</div><div class="info-value">${toTitleCase(primaryGuest.userType)}</div></div>
        </div>
      `
              : '<div style="color:#94a3b8;font-size:11px;">No guest info available</div>'
      }
    </div>
  </div>

  <!-- ── ALL GUESTS ── -->
  ${
      reservationGuests && reservationGuests.length > 0
          ? `
  <div class="section">
    <div class="section-title">All Guests (${reservationGuests.length})</div>
    <div class="guest-list">
      ${reservationGuests
          .map(
              (g: any) => `
        <div class="guest-chip ${g.type}">
          ${g.firstName} ${g.lastName}
          <span style="color:#94a3b8;"> · ${toTitleCase(g.type)}${g.age ? ` · Age ${g.age}` : ''}</span>
        </div>
      `
          )
          .join('')}
    </div>
  </div>
  `
          : ''
  }

  <!-- ── ROOM ── -->
${
    room
        ? `
<div class="section">
  <div class="section-title">Your Room</div>
  <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;display:flex;gap:0;">
    ${
        room.image?.[0]
            ? `
      <img src="${room.image[0]}" style="width:200px;height:140px;object-fit:cover;flex-shrink:0;" alt="${room.roomName}"/>
    `
            : ''
    }
    <div style="padding:14px 16px;flex:1;">
      <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:4px;">
        ${room.roomName} <span style="font-size:10px;color:#94a3b8;font-weight:400;">(${room.roomType})</span>
      </div>
      <div style="font-size:10px;color:#64748b;margin-bottom:6px;">
        📐 ${room.roomSize} ${room.roomUnit} &nbsp;·&nbsp; 👥 Max ${room.maxOccupancy} guests
      </div>
      ${room.description ? `<div style="font-size:10px;color:#475569;">${room.description}</div>` : ''}
    </div>
  </div>
</div>
`
        : ''
}

  <!-- ── ADD-ONS ── -->
${
    finalPrice?.addonBrakeDown && finalPrice.addonBrakeDown.length > 0
        ? (() => {
              const addonNames = [
                  ...new Set(finalPrice.addonBrakeDown.map((a: any) => a.name)),
              ];

              const dates = [
                  ...new Set(finalPrice.addonBrakeDown.map((a: any) => a.date)),
              ];
              const lookup: Record<string, any> = {};
              for (const item of finalPrice.addonBrakeDown) {
                  lookup[`${item.name}||${item.date}`] = item;
              }

              const imageMap: Record<string, string> = {};
              for (const a of addOns) {
                  if (a.images?.[0] && !imageMap[a.name]) {
                      imageMap[a.name] = a.images[0];
                  }
              }

              return `
    <div class="section">
      <div class="section-title">Meals & Add-Ons</div>
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:8px 10px;text-align:left;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;">Item</th>
            ${dates
                .map(
                    (date: any) => `
              <th style="padding:8px 10px;text-align:center;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;">${date}</th>
            `
                )
                .join('')}
            <th style="padding:8px 10px;text-align:right;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${addonNames
              .map((name: any, i: number) => {
                  const firstItem = finalPrice.addonBrakeDown.find(
                      (a: any) => a.name === name
                  );
                  const rowTotal = dates.reduce((s: number, date: any) => {
                      const item = lookup[`${name}||${date}`];
                      return s + (item ? Number(item.totalAmount) : 0);
                  }, 0);

                  return `
              <tr style="border-bottom:1px solid #f1f5f9;background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
                <td style="padding:8px 10px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${
                        imageMap[name]
                            ? `<img src="${imageMap[name]}" style="width:28px;height:28px;object-fit:cover;border-radius:4px;flex-shrink:0;" alt="${name}"/>`
                            : `<div style="width:28px;height:28px;background:#e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">🍽</div>`
                    }
                    <div>
                      <div style="font-weight:600;color:#1e293b;">${name}</div>
                      <span style="display:inline-block;padding:1px 6px;border-radius:8px;font-size:9px;font-weight:700;text-transform:uppercase;${firstItem?.type === 'included' ? 'background:#dcfce7;color:#166534;' : 'background:#dbeafe;color:#1e40af;'}">
                        ${toTitleCase(firstItem?.type ?? '')}
                      </span>
                    </div>
                  </div>
                </td>
                ${dates
                    .map((date: any) => {
                        const item = lookup[`${name}||${date}`];
                        return `
                    <td style="padding:8px 10px;text-align:center;color:${item ? '#1e293b' : '#cbd5e1'};">
                      ${
                          item
                              ? `<div style="font-weight:600;">${formatCurrency(item.totalAmount, item.currencyCode)}</div>
                           <div style="font-size:9px;color:#94a3b8;">${formatCurrency(item.amount, item.currencyCode)} × ${item.quantity}</div>`
                              : `—`
                      }
                    </td>
                    `;
                    })
                    .join('')}
                <td style="padding:8px 10px;text-align:right;font-weight:700;color:#2563eb;">
                  ${formatCurrency(rowTotal, reservation.currencyCode)}
                </td>
              </tr>
              `;
              })
              .join('')}
          <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
            <td style="padding:8px 10px;font-weight:700;color:#1e293b;">Grand Total</td>
            ${dates
                .map((date: any) => {
                    const dateTotal = finalPrice.addonBrakeDown
                        .filter((a: any) => a.date === date)
                        .reduce(
                            (s: number, a: any) => s + Number(a.totalAmount),
                            0
                        );
                    return `<td style="padding:8px 10px;text-align:center;font-weight:700;color:#2563eb;">${formatCurrency(dateTotal, reservation.currencyCode)}</td>`;
                })
                .join('')}
            <td style="padding:8px 10px;text-align:right;font-weight:700;color:#2563eb;">
              ${formatCurrency(finalPrice.totalAddonAmount, reservation.currencyCode)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `;
          })()
        : ''
}
  <!-- ── NIGHTLY BREAKDOWN ── -->
  ${
      Object.keys(dailyByDate).length > 0
          ? `
  <div class="section">
    <div class="section-title">Nightly Price Breakdown</div>
    ${Object.entries(dailyByDate)
        .map(
            ([date, rooms]) => `
  <div class="day-block">
    <div class="day-header">
      <span>${date}</span>
      <span>${formatCurrency(
          rooms.reduce((s, r) => s + Number(r.totalAmount), 0),
          reservation.currencyCode
      )} total</span>
    </div>
    ${rooms
        .map(
            r => `
      <div class="day-row">
        <span class="day-row-label">
          Room ${r.roomNumber} · ${r.guestDistribution.adults} adult${r.guestDistribution.adults > 1 ? 's' : ''}
          ${
              r.guestDistribution.children > 0
                  ? ` + ${r.guestDistribution.children} child${
                        r.guestDistribution.childAges?.length
                            ? ` (${r.guestDistribution.childAges.join(', ')}yr)`
                            : ''
                    }`
                  : ''
          }
        </span>
        <span class="day-row-value">${formatCurrency(r.totalAmount, r.currencyCode)}</span>
      </div>
      <div class="day-row" style="background:#f8fafc;">
        <span class="day-row-label">
          Base: ${formatCurrency(r.baseChargesAmount, r.currencyCode)}
          &nbsp;·&nbsp;
          Tax: ${formatCurrency(r.totalDailyTaxedAmount, r.currencyCode)}
        </span>
      </div>
    `
        )
        .join('')}
  </div>
`
        )
        .join('')}
  </div>
  `
          : ''
  }

  <!-- ── PROMOTIONS ── -->
${
    finalPrice?.promotionBrakeDown && finalPrice.promotionBrakeDown.length > 0
        ? `
<div class="section">
  <div class="section-title">Promotions Applied</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    ${finalPrice.promotionBrakeDown
        .map(
            (p: any) => `
      <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:6px;padding:8px 14px;display:flex;align-items:center;gap:10px;">
        <span style="font-weight:700;color:#6d28d9;font-size:11px;">🏷 ${p.name}</span>
        <span style="font-size:11px;color:#7c3aed;font-weight:600;">Saved: ${formatCurrency(p.discountAmount, finalPrice.currencyCode)}</span>
        ${p.restrictionType === 'payLater' ? `<span style="font-size:9px;color:#d97706;font-weight:600;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;padding:1px 6px;">Pay at hotel</span>` : ''}
      </div>
    `
        )
        .join('')}
  </div>
</div>
`
        : ''
}

  <!-- ── TAX BREAKDOWN ── -->
  ${
      priceBreakdown?.tax && priceBreakdown.tax.length > 0
          ? `
  <div class="section">
    <div class="section-title">Tax Details</div>
    <div class="tax-list">
      ${priceBreakdown.tax
          .map(
              (t: any) => `
        <div class="tax-chip">${t.name}: ${formatCurrency(t.taxedAmount, t.currencyCode)}</div>
      `
          )
          .join('')}
    </div>
  </div>
  `
          : ''
  }

  <!-- ── FINANCIAL SUMMARY ── -->
  <div class="section">
    <div class="section-title">Payment Summary</div>
    <div class="summary-box">
      <div class="sum-row">
        <span>Room Charges (before tax)</span>
        <span>${formatCurrency(baseAmount, reservation.currencyCode)}</span>
      </div>
      ${
          addonAmount > 0
              ? `
      <div class="sum-row">
        <span>Add-Ons Total</span>
        <span>${formatCurrency(addonAmount, reservation.currencyCode)}</span>
      </div>`
              : ''
      }
      <div class="sum-row">
        <span>Taxes & Fees</span>
        <span>${formatCurrency(taxAmount, reservation.currencyCode)}</span>
      </div>
      ${
          promoDiscount > 0
              ? `
      <div class="sum-row promo">
        <span>Promotion Discount</span>
        <span>- ${formatCurrency(promoDiscount, reservation.currencyCode)}</span>
      </div>`
              : ''
      }
      <div class="sum-row total">
        <span>Total Amount</span>
        <span>${formatCurrency(finalPrice?.currentChargeableAmount, reservation.currencyCode)}</span>
      </div>
      ${
          paidAmount > 0
              ? `
      <div class="sum-row paid">
        <span>Amount Paid</span>
        <span>${formatCurrency(paidAmount, reservation.currencyCode)}</span>
      </div>`
              : ''
      }
      ${
          laterPayable > 0
              ? `
      <div class="sum-row later">
        <span>Pay at Hotel (later)</span>
        <span>${formatCurrency(laterPayable, reservation.currencyCode)}</span>
      </div>`
              : ''
      }
      <div class="sum-row balance" style="color:${balance > 0 ? '#dc2626' : '#166534'};">
        <span>${balance > 0 ? 'Balance Due' : balance < 0 ? 'Refund' : 'Fully Paid'}</span>
        <span>${formatCurrency(Math.abs(balance), reservation.currencyCode)}</span>
      </div>
    </div>
  </div>


  <!-- ── NOTICE ── -->
  ${
      balance > 0
          ? `
  <div class="notice">
    ⚠ <strong>Payment Reminder:</strong> ${formatCurrency(balance, reservation.currencyCode)} is due.
    ${laterPayable > 0 ? `${formatCurrency(laterPayable, reservation.currencyCode)} is payable at the hotel.` : 'Please settle before check-in.'}
  </div>
  `
          : ''
  }

  <!-- ── FOOTER ── -->
  <div class="footer">
    <div>Thank you for choosing <strong>${property.propertyName}</strong>. We look forward to welcoming you!</div>
    <div style="margin-top:5px;">For queries: ${property.propertyEmail} · ${property.propertyContact}</div>
    <div style="margin-top:5px;">This is a computer-generated voucher. Generated on ${formatDate(new Date())}.</div>
  </div>

</div>
</body>
</html>`;
};
