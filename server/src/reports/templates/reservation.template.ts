const toTitleCase = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const fmt = (amount: any, currency: string = 'AED'): string => {
    const num = Number(amount);
    if (isNaN(num)) return `${currency} 0.00`;
    const symbols: Record<string, string> = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
    };
    return `${symbols[currency] || currency} ${num.toFixed(2)}`;
};

const fmtDate = (date: any): string => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const fmtPayment = (method: string): string =>
    (method || '')
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export const generateBookingVoucherHTML = (data: any): string => {
    const {
        property,
        room,
        reservation,
        primaryGuest,
        addOns,
        priceData,
        reservationGuests,
        ratePlanName,
    } = data;
console.log('Data received for voucher generation:', {  property, room, reservation, primaryGuest, addOns, priceData, reservationGuests, ratePlanName });
    const cur = priceData?.currencyCode || reservation.currencyCode || 'AED';

    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.max(
        1,
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000)
    );

    const totalAmount =
        priceData?.totalAmount ?? Number(reservation.amount) ?? 0;
    const paidAmount = priceData
        ? priceData.totalAmount -
          priceData.currentChargeableAmount -
          priceData.latterpayableAmount
        : Number(reservation.paidAmount ?? 0);
    const balance =
        priceData?.currentChargeableAmount ?? totalAmount - paidAmount;

    // ── All financial figures come from priceData (DB source of truth) ──────
    const baseAmount = priceData?.amountBeforeTax ?? totalAmount;
    const taxAmount = priceData?.taxedAmount ?? 0;
    const addonAmount = priceData?.totalAddonAmount ?? 0;
    const promoDiscount = priceData?.totalPromotionAmount ?? 0;
    const loyaltyDiscount = priceData?.loyalityDiscount ?? 0;
    const laterPayable = priceData?.latterpayableAmount ?? 0;
    const currentChargeable = priceData?.currentChargeableAmount ?? totalAmount;

    const daily = priceData?.dailyPriceBrakeDown ?? [];
    const taxes = priceData?.taxBrakeDown ?? [];
    const addonsData = priceData?.addonBrakeDown ?? [];
    const promos = priceData?.promotionBrakeDown ?? [];

    // Group daily by date string for display
    const dailyByDate: Record<string, any[]> = {};
    for (const d of daily) {
        const key = new Date(d.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        if (!dailyByDate[key]) dailyByDate[key] = [];
        dailyByDate[key].push(d);
    }

    // Group addons for the table (unique names × dates)
    const addonNames = [...new Set(addonsData.map((a: any) => a.name))];
    const addonDates = [
        ...new Set(
            addonsData.map((a: any) =>
                new Date(a.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                })
            )
        ),
    ];
    const addonLookup: Record<string, any> = {};
    for (const a of addonsData) {
        const dk = new Date(a.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        addonLookup[`${a.name}||${dk}`] = a;
    }
    // image map from reservation addOns (which carry images)
    const imageMap: Record<string, string> = {};
    for (const a of addOns ?? []) {
        if (a.images?.[0] && !imageMap[a.name]) imageMap[a.name] = a.images[0];
    }

    const payLaterPromos = promos.filter(
        (p: any) => p.restrictionType === 'payLater'
    );
    const deductPromos = promos.filter(
        (p: any) => p.restrictionType !== 'payLater'
    );

    const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI',Arial,sans-serif; font-size:11px; color:#222; background:#fff; line-height:1.6; }
.page { width:210mm; margin:0 auto; padding:12mm 14mm; background:#fff; }
.header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #1e293b; padding-bottom:14px; margin-bottom:18px; }
.prop-name { font-size:20px; font-weight:700; color:#1e293b; margin-bottom:3px; }
.stars { color:#f59e0b; font-size:14px; margin-bottom:4px; }
.prop-contact { font-size:10px; color:#64748b; line-height:1.8; }
.voucher-right { text-align:right; }
.voucher-label { font-size:26px; font-weight:800; color:#1e293b; letter-spacing:1px; text-transform:uppercase; }
.booking-pill { display:inline-block; margin-top:6px; background:#eff6ff; color:#2563eb; border:1px solid #93c5fd; border-radius:6px; padding:5px 14px; font-size:13px; font-weight:700; }
.status-badge { display:inline-block; margin-top:5px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; }
.status-confirmed { background:#dcfce7; color:#166534; border:1px solid #86efac; }
.status-pending   { background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
.status-cancelled { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }
.status-modified  { background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; }
.section { margin-bottom:16px; }
.section-title { font-size:10px; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:0.6px; border-bottom:2px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.info-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:7px 9px; }
.info-label { font-size:9px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px; }
.info-value { font-size:11px; font-weight:600; color:#1e293b; }
.guest-list { display:flex; flex-wrap:wrap; gap:6px; }
.guest-chip { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:20px; padding:4px 12px; font-size:10px; color:#334155; font-weight:500; }
.guest-chip.adult { border-left:3px solid #3b82f6; }
.guest-chip.child { border-left:3px solid #f59e0b; }
.day-block { border:1px solid #e2e8f0; border-radius:7px; margin-bottom:7px; overflow:hidden; }
.day-header { background:#1e293b; color:#fff; padding:6px 12px; font-size:10px; font-weight:600; display:flex; justify-content:space-between; }
.day-row { display:flex; justify-content:space-between; padding:5px 12px; border-bottom:1px solid #f1f5f9; font-size:10px; }
.day-row:last-child { border-bottom:none; }
.day-row-label { color:#64748b; }
.day-row-value { font-weight:600; color:#1e293b; }
.tax-list { display:flex; gap:8px; flex-wrap:wrap; }
.tax-chip { background:#fef3c7; border:1px solid #fcd34d; border-radius:5px; padding:4px 10px; font-size:10px; color:#92400e; font-weight:600; }
.summary-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; }
.sum-row { display:flex; justify-content:space-between; padding:4px 0; font-size:11px; border-bottom:1px solid #f1f5f9; }
.sum-row:last-child { border-bottom:none; }
.sum-row.total   { font-size:13px; font-weight:700; color:#1e293b; border-top:2px solid #1e293b; margin-top:6px; padding-top:8px; border-bottom:none; }
.sum-row.paid    { color:#166534; font-weight:600; }
.sum-row.promo   { color:#7c3aed; font-weight:600; }
.sum-row.loyalty { color:#2563eb; font-weight:600; }
.sum-row.later   { color:#d97706; font-weight:600; }
.sum-row.balance { font-size:12px; font-weight:700; border-top:2px dashed #cbd5e1; margin-top:5px; padding-top:7px; border-bottom:none; }
.notice { background:#fffbeb; border-left:4px solid #f59e0b; border-radius:4px; padding:9px 12px; margin-top:12px; font-size:10px; color:#78350f; }
.footer { margin-top:20px; padding-top:14px; border-top:2px solid #e2e8f0; text-align:center; font-size:9px; color:#94a3b8; }
@media print { body { margin:0; } .page { padding:8mm; } }
`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Booking Voucher — ${reservation.bookingCode}</title>
<style>${CSS}</style>
</head>
<body>
<div class="page">

<!-- ── HEADER ── -->
<div class="header">
  <div>
    ${
        property.logo
            ? `<img src="${property.logo}" style="height:70px;width:auto;max-width:200px;object-fit:contain;margin-bottom:6px;" alt="logo"/>`
            : `<div style="width:50px;height:50px;background:${property.primaryColor};border-radius:7px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;">${property.propertyName.charAt(0)}</div>`
    }
    <div class="prop-name">${property.propertyName}</div>
    ${property.starRating ? `<div class="stars">${'★'.repeat(property.starRating)}${'☆'.repeat(5 - property.starRating)}</div>` : ''}
    <div class="prop-contact">
      ${property.propertyAddress ? `<div>${property.propertyAddress.addressLine1}, ${property.propertyAddress.city}, ${property.propertyAddress.state}</div>` : ''}
      <div>✉ ${property.propertyEmail} &nbsp;|&nbsp; ☎ ${property.propertyContact}</div>
    </div>
  </div>
  <div class="voucher-right">
    <div class="voucher-label">Booking Voucher</div>
    <div class="booking-pill">${reservation.bookingCode}</div><br/>
    <span class="status-badge status-${reservation.bookingStatus.toLowerCase()}">${reservation.bookingStatus}</span>
    <div style="font-size:10px;color:#94a3b8;margin-top:5px;">Booked on ${fmtDate(reservation.createdAt)}</div>
  </div>
</div>

<!-- ── STAY + PRIMARY GUEST ── -->
<div class="two-col">
  <div class="section">
    <div class="section-title">Stay Details</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Check-In</div><div class="info-value">${fmtDate(reservation.checkInDate)}</div></div>
      <div class="info-item"><div class="info-label">Check-Out</div><div class="info-value">${fmtDate(reservation.checkOutDate)}</div></div>
      <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${nights} Night${nights > 1 ? 's' : ''}</div></div>
      <div class="info-item"><div class="info-label">Rooms</div><div class="info-value">${priceData?.requestedRooms ?? 1} Room${(priceData?.requestedRooms ?? 1) > 1 ? 's' : ''}</div></div>
      <div class="info-item"><div class="info-label">Rate Plan</div><div class="info-value">${ratePlanName ?? reservation.ratePlanCode ?? '—'}</div></div>
      <div class="info-item"><div class="info-label">Payment</div><div class="info-value">${fmtPayment(reservation.paymentMethod)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Primary Guest</div>
    ${
        primaryGuest
            ? `
    <div class="info-grid">
      <div class="info-item" style="grid-column:1/-1;"><div class="info-label">Name</div><div class="info-value">${primaryGuest.firstName} ${primaryGuest.lastName}</div></div>
      ${primaryGuest.email ? `<div class="info-item" style="grid-column:1/-1;"><div class="info-label">Email</div><div class="info-value">${primaryGuest.email}</div></div>` : ''}
      ${primaryGuest.phoneNumber ? `<div class="info-item"><div class="info-label">Phone</div><div class="info-value">${primaryGuest.phoneNumber}</div></div>` : ''}
      <div class="info-item"><div class="info-label">Type</div><div class="info-value">${toTitleCase(primaryGuest.userType)}</div></div>
      ${primaryGuest.userIdentityCardType ? `<div class="info-item"><div class="info-label">ID Type</div><div class="info-value">${primaryGuest.userIdentityCardType}</div></div>` : ''}
      ${primaryGuest.identityCardNumber ? `<div class="info-item"><div class="info-label">ID No.</div><div class="info-value">${primaryGuest.identityCardNumber}</div></div>` : ''}
    </div>`
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
    </div>`
        )
        .join('')}
  </div>
</div>`
        : ''
}

<!-- ── ROOM ── -->
${
    room
        ? `
<div class="section">
  <div class="section-title">Your Room</div>
  <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;display:flex;">
    ${room.image?.[0] ? `<img src="${room.image[0]}" style="width:180px;height:130px;object-fit:cover;flex-shrink:0;" alt="${room.roomName}"/>` : ''}
    <div style="padding:12px 14px;flex:1;">
      <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:3px;">
        ${room.roomName} <span style="font-size:10px;color:#94a3b8;font-weight:400;">(${room.roomType})</span>
      </div>
      <div style="font-size:10px;color:#64748b;margin-bottom:5px;">
        📐 ${room.roomSize} ${room.roomUnit} &nbsp;·&nbsp; 👥 Max ${room.maxOccupancy} guests
      </div>
      ${room.description ? `<div style="font-size:10px;color:#475569;">${room.description}</div>` : ''}
    </div>
  </div>
</div>`
        : ''
}

<!-- ── ADD-ONS ── -->
${
    addonsData.length > 0
        ? `
<div class="section">
  <div class="section-title">Meals & Add-Ons</div>
  <table style="width:100%;border-collapse:collapse;font-size:10px;">
    <thead>
      <tr style="background:#1e293b;">
        <th style="padding:7px 9px;text-align:left;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;">Item</th>
        ${addonDates.map((d: any) => `<th style="padding:7px 9px;text-align:center;color:#fff;font-size:9px;font-weight:700;">${d}</th>`).join('')}
        <th style="padding:7px 9px;text-align:right;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${addonNames
          .map((name: any, i: number) => {
              const firstItem = addonsData.find((a: any) => a.name === name);
              const rowTotal = addonDates.reduce((s: number, dk: any) => {
                  const item = addonLookup[`${name}||${dk}`];
                  return s + (item ? Number(item.totalAmount) : 0);
              }, 0);
              return `
      <tr style="border-bottom:1px solid #f1f5f9;background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
        <td style="padding:7px 9px;">
          <div style="display:flex;align-items:center;gap:7px;">
            ${
                imageMap[name]
                    ? `<img src="${imageMap[name]}" style="width:26px;height:26px;object-fit:cover;border-radius:4px;flex-shrink:0;" alt="${name}"/>`
                    : `<div style="width:26px;height:26px;background:#e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;">🍽</div>`
            }
            <div>
              <div style="font-weight:600;color:#1e293b;">${name}</div>
              <span style="display:inline-block;padding:1px 6px;border-radius:8px;font-size:9px;font-weight:700;text-transform:uppercase;${firstItem?.type === 'included' ? 'background:#dcfce7;color:#166534;' : 'background:#dbeafe;color:#1e40af;'}">
                ${toTitleCase(firstItem?.type ?? '')}
              </span>
            </div>
          </div>
        </td>
        ${addonDates
            .map((dk: any) => {
                const item = addonLookup[`${name}||${dk}`];
                return `<td style="padding:7px 9px;text-align:center;">
              ${
                  item
                      ? `<div style="font-weight:600;">${fmt(item.totalAmount, item.currencyCode || cur)}</div>
                   <div style="font-size:9px;color:#94a3b8;">${fmt(item.amount, item.currencyCode || cur)} × ${item.quantity}</div>`
                      : `<span style="color:#cbd5e1;">—</span>`
              }
            </td>`;
            })
            .join('')}
        <td style="padding:7px 9px;text-align:right;font-weight:700;color:#2563eb;">${fmt(rowTotal, cur)}</td>
      </tr>`;
          })
          .join('')}
      <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
        <td style="padding:7px 9px;font-weight:700;color:#1e293b;">Total Add-Ons</td>
        ${addonDates
            .map((dk: any) => {
                const dt = addonsData
                    .filter(
                        (a: any) =>
                            new Date(a.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            }) === dk
                    )
                    .reduce(
                        (s: number, a: any) => s + Number(a.totalAmount),
                        0
                    );
                return `<td style="padding:7px 9px;text-align:center;font-weight:700;color:#2563eb;">${fmt(dt, cur)}</td>`;
            })
            .join('')}
        <td style="padding:7px 9px;text-align:right;font-weight:700;color:#2563eb;">${fmt(addonAmount, cur)}</td>
      </tr>
    </tbody>
  </table>
</div>`
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
          ([dateStr, rooms]) => `
  <div class="day-block">
    <div class="day-header">
      <span>${dateStr}</span>
      <span>${fmt(
          rooms.reduce((s, r) => s + Number(r.totalAmount), 0),
          cur
      )}</span>
    </div>
    ${rooms
        .map(
            (r: any) => `
    <div class="day-row">
      <span class="day-row-label">
        Room ${r.roomNumber ?? '1'}
        ${
            r.guestDistribution
                ? `· ${r.guestDistribution.adults} adult${r.guestDistribution.adults !== 1 ? 's' : ''}
               ${
                   r.guestDistribution.children > 0
                       ? `+ ${r.guestDistribution.children} child${r.guestDistribution.children !== 1 ? 'ren' : ''}
                      ${r.guestDistribution.childAges?.length ? `(${r.guestDistribution.childAges.join(', ')}yr)` : ''}`
                       : ''
               }`
                : ''
        }
      </span>
      <span class="day-row-value">${fmt(r.totalAmount, r.currencyCode || cur)}</span>
    </div>
    <div class="day-row" style="background:#f8fafc;">
      <span class="day-row-label">
        Base: ${fmt(r.baseChargesAmount, r.currencyCode || cur)}
        ${r.additionalChargesAmount > 0 ? `&nbsp;·&nbsp; Additional: ${fmt(r.additionalChargesAmount, r.currencyCode || cur)}` : ''}
      </span>
    </div>`
        )
        .join('')}
  </div>`
      )
      .join('')}
</div>`
        : ''
}

<!-- ── PROMOTIONS ── -->
${
    promos.length > 0
        ? `
<div class="section">
  <div class="section-title">Promotions Applied</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    ${promos
        .map(
            (p: any) => `
    <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:6px;padding:7px 12px;display:flex;align-items:center;gap:10px;">
      <span style="font-weight:700;color:#6d28d9;font-size:11px;">🏷 ${p.name}</span>
      <span style="font-size:10px;color:#7c3aed;font-weight:600;">
        ${p.discountValue}${p.discountType === 'percentage' ? '%' : ` ${cur}`} off
        &nbsp;·&nbsp; Saved: ${fmt(p.discountAmount, p.currencyCode || cur)}
      </span>
      ${
          p.restrictionType === 'payLater'
              ? `<span style="font-size:9px;color:#d97706;font-weight:600;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;padding:1px 6px;">Pay at hotel</span>`
              : ''
      }
    </div>`
        )
        .join('')}
  </div>
</div>`
        : ''
}

<!-- ── TAX DETAILS ── -->
${
    taxes.length > 0
        ? `
<div class="section">
  <div class="section-title">Tax Details</div>
  <div class="tax-list">
    ${taxes
        .map(
            (t: any) => `
    <div class="tax-chip">${t.name}: ${fmt(t.taxedAmount, t.currencyCode || cur)}</div>`
        )
        .join('')}
  </div>
</div>`
        : ''
}

<!-- ── PAYMENT SUMMARY ── -->
<div class="section">
  <div class="section-title">Payment Summary</div>
  <div class="summary-box">
    <div class="sum-row">
      <span>Room Charges (before tax)</span>
      <span>${fmt(baseAmount - addonAmount, cur)}</span>
    </div>
    ${
        addonAmount > 0
            ? `
    <div class="sum-row">
      <span>Add-Ons Total</span>
      <span>${fmt(addonAmount, cur)}</span>
    </div>`
            : ''
    }
    <div class="sum-row">
      <span>Taxes &amp; Fees</span>
      <span>${fmt(taxAmount, cur)}</span>
    </div>
    ${
        deductPromos.length > 0
            ? deductPromos
                  .map(
                      (p: any) => `
    <div class="sum-row promo">
      <span>${p.name} (${p.discountValue}${p.discountType === 'percentage' ? '%' : ''} off)</span>
      <span>- ${fmt(p.discountAmount, p.currencyCode || cur)}</span>
    </div>`
                  )
                  .join('')
            : ''
    }
    ${
        loyaltyDiscount > 0
            ? `
    <div class="sum-row loyalty">
      <span>Loyalty Discount</span>
      <span>- ${fmt(loyaltyDiscount, cur)}</span>
    </div>`
            : ''
    }
    <div class="sum-row total">
      <span>Total Amount</span>
      <span>${fmt(totalAmount, cur)}</span>
    </div>
    <div class="sum-row" style="color:#1e293b;">
      <span>Amount Payable Now</span>
      <span>${fmt(currentChargeable, cur)}</span>
    </div>
    ${
        laterPayable > 0
            ? `
    <div class="sum-row later">
      <span>Pay at Hotel</span>
      <span>${fmt(laterPayable, cur)}</span>
    </div>
    ${
        payLaterPromos.length > 0
            ? payLaterPromos
                  .map(
                      (p: any) => `
    <div class="sum-row" style="color:#b45309;font-size:10px;padding-left:12px;">
      <span>↳ ${p.name} (${p.discountValue}${p.discountType === 'percentage' ? '%' : ''} off)</span>
      <span>${fmt(p.discountAmount, p.currencyCode || cur)}</span>
    </div>`
                  )
                  .join('')
            : ''
    }`
            : ''
    }
    ${
        paidAmount > 0
            ? `
    <div class="sum-row paid">
      <span>Amount Paid</span>
      <span>${fmt(paidAmount, cur)}</span>
    </div>`
            : ''
    }
    <div class="sum-row balance" style="color:${balance > 0 ? '#dc2626' : '#166534'};">
      <span>${balance > 0 ? 'Balance Due' : balance < 0 ? 'Refund' : 'Fully Paid'}</span>
      <span>${fmt(Math.abs(balance), cur)}</span>
    </div>
  </div>
</div>

<!-- ── NOTICE ── -->
${
    balance > 0
        ? `
<div class="notice">
  ⚠ <strong>Payment Reminder:</strong> ${fmt(balance, cur)} is due.
  ${laterPayable > 0 ? `${fmt(laterPayable, cur)} is payable at the hotel.` : 'Please settle before check-in.'}
</div>`
        : ''
}

<!-- ── FOOTER ── -->
<div class="footer">
  <div>Thank you for choosing <strong>${property.propertyName}</strong>. We look forward to welcoming you!</div>
  <div style="margin-top:4px;">For queries: ${property.propertyEmail} · ${property.propertyContact}</div>
  <div style="margin-top:4px;">This is a computer-generated voucher. Generated on ${fmtDate(new Date())}.</div>
</div>

</div>
</body>
</html>`;
};