"use client";

import { useState } from "react";
import {
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { IGuestDistribution, IReservation } from "../types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ReservationCardProps {
  reservation: IReservation;
  onCancel?: (reservationId: string) => void;
  onAmend?: (reservationId: string) => void;
  onClose?: () => void;
}

export default function ReservationCard({
  reservation,
  onCancel,
  onAmend,
  onClose,
}: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "modified":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "modified":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(reservation.reservationStartDate);
    const checkOut = new Date(reservation.reservationEndDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">
                {reservation.bookingCode}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.bookingStatus)}`}
              >
                {getStatusIcon(reservation.bookingStatus)}
                {reservation.bookingStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {reservation.property?.propertyName || reservation.hotelName}
            </p>
          </div>

          {/* Action buttons - always visible in header */}
          <div className="flex items-center gap-2">
            {reservation.bookingStatus === "confirmed" && (
              <>
                <Button
                  onClick={() => onAmend?.(reservation.id)}
                  variant="outline"
                  size="icon"
                  title="Amend Reservation"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onCancel?.(reservation.id)}
                  variant="outline"
                  size="icon"
                  title="Cancel Reservation"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            {/* Close button — only shows when inside modal */}
            {onClose && (
              <Button
                onClick={() => onClose?.()}
                variant="outline"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Guest Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>
                  {reservation.primaryGuest?.firstName}{" "}
                  {reservation.primaryGuest?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{reservation.bookingUserEmail}</span>
              </div>
              {reservation.bookingUserPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{reservation.bookingUserPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{reservation.guests.length} Guest(s)</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Booking Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Check-in:{" "}
                  <strong>{formatDate(reservation.reservationStartDate)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Check-out:{" "}
                  <strong>{formatDate(reservation.reservationEndDate)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{calculateNights()} Night(s)</span>
              </div>
              {reservation.roomTypeCode && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Room: {reservation.roomTypeCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservation.currencyCode} {reservation.amount.toFixed(2)}
              </p>
              {reservation.paidAmount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Paid: {reservation.currencyCode}{" "}
                  {reservation.paidAmount.toFixed(2)}
                </p>
              )}
            </div>

            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="text-primary hover:text-primary/90"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in slide-in-from-top duration-200">
            {/* Price Breakdown */}
            {(() => {
              const pb = reservation.PricingBrakeDown;
              const fp = reservation.finalPrice;
              if (!pb && !fp) return null;

              const dailyRows = pb?.DailyPriceBrakeDown ?? fp?.dailyPriceBrakeDown ?? [];
              const addonRows = pb?.AddonBrakeDowns ?? fp?.addonBrakeDown ?? [];
              const taxRows = pb?.taxBrakeDown ?? fp?.taxBrakeDown ?? [];
              const promoRows = pb?.promotionBrakeDown ?? fp?.promotionBrakeDown ?? [];

              const totalAmount = pb?.totalAmount ?? fp?.totalAmount ?? 0;
              const amountBeforeTax = pb?.amountBeforeTax ?? fp?.amountBeforeTax ?? 0;
              const taxedAmount = pb?.taxedAmount ?? fp?.taxedAmount ?? 0;
              const currentChargeable = pb?.currentChargeableAmount ?? fp?.currentChargeableAmount ?? 0;
              const laterPayable = pb?.latterpayableAmount ?? fp?.latterpayableAmount ?? 0;
              const currency = pb?.currencyCode ?? fp?.currencyCode ?? reservation.currencyCode;

              const formatGuests = (g: IGuestDistribution) => {
                if (!g) return '';
                const parts: string[] = [];
                if (g.adults) parts.push(`${g.adults} adult${g.adults > 1 ? 's' : ''}`);
                if (g.children) parts.push(`${g.children} child${g.children > 1 ? 'ren' : ''}`);
                return parts.join(', ');
              };

              return (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">

                    {/* Room charges */}
                    {dailyRows.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Room charges</p>
                        <div className="space-y-2">
                          {dailyRows.map((day: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-gray-600">
                                Room {day.roomNumber} —{" "}
                                {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {day.guestDistribution && ` (${formatGuests(day.guestDistribution)})`}
                              </span>
                              <span className="text-gray-900">{currency} {day.baseChargesAmount?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add-ons */}
                    {addonRows.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Add-ons</p>
                        <div className="space-y-2">
                          {addonRows.map((addon: any, i: number) => (
                            <div key={i} className="flex justify-between items-start gap-2">
                              <span className="text-gray-600 flex items-center gap-1 flex-wrap">
                                {addon.name} × {addon.quantity}
                                {addon.date && ` — ${new Date(addon.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                <span className={`text-xs px-1.5 py-0.5 rounded ${addon.type === "included"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                                  }`}>
                                  {addon.type}
                                </span>
                              </span>
                              <span className="text-gray-900 whitespace-nowrap">{currency} {addon.totalAmount?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discounts */}
                    {promoRows.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Discounts applied</p>
                        <div className="space-y-2">
                          {promoRows.map((promo: any, i: number) => {
                            const isPayLater = promo.restrictionType === "payLater";
                            return (
                              <div key={i} className="flex justify-between">
                                <span className={isPayLater ? "text-gray-500" : "text-green-700"}>
                                  {promo.name} ({promo.discountValue}%)
                                  {isPayLater && (
                                    <span className="ml-1 text-xs text-gray-400">pay later</span>
                                  )}
                                </span>
                                <span className={isPayLater ? "text-gray-500" : "text-green-700"}>
                                  {isPayLater ? "+" : "-"} {currency} {promo.discountAmount?.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tax */}
                    {taxRows.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Tax</p>
                        <div className="space-y-2">
                          {taxRows.map((tax: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-gray-600">{tax.name}</span>
                              <span className="text-gray-900">{currency} {tax.taxedAmount?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loyalty & Promo discounts from finalPrice */}
                    {((fp?.loyalityDiscount ?? 0) > 0 || (fp?.promoCodeDiscount ?? 0) > 0) && (
                      <div className="p-4 border-b border-gray-100 space-y-2">
                        {(fp?.loyalityDiscount ?? 0) > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Loyalty discount</span>
                            <span>-{currency} {fp!.loyalityDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {(fp?.promoCodeDiscount ?? 0) > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Promo code discount</span>
                            <span>-{currency} {fp!.promoCodeDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Totals */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal (excl. tax)</span>
                        <span>{currency} {amountBeforeTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>{currency} {taxedAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total (incl. tax)</span>
                        <span>{currency} {totalAmount.toFixed(2)}</span>
                      </div>
                      {laterPayable > 0 && (
                        <>
                          <div className="flex justify-between text-gray-600 pt-1">
                            <span>Pay now</span>
                            <span>{currency} {currentChargeable.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Pay at hotel</span>
                            <span>{currency} {laterPayable.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-medium text-gray-900 mt-1 capitalize">
                  {reservation.paymentMethod.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Booking Source:</span>
                <p className="font-medium text-gray-900 mt-1 uppercase">
                  {reservation.bookingSource}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Booked At:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(reservation.bookedAt)}
                </p>
              </div>
              {reservation.isPromoUsed && (
                <div>
                  <span className="text-gray-600">Promo Applied:</span>
                  <p className="font-medium text-green-600 mt-1">Yes</p>
                </div>
              )}
            </div>

            {/* Guest List */}
            {reservation.guests && reservation.guests.length > 0 && (() => {
              const primary = reservation.guests.find((g: any) => g.type === "adult")
                ?? reservation.guests[0];
              return (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Primary Guest
                  </h4>
                  <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">
                      {primary.firstName} {primary.lastName}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                      Primary
                    </span>
                  </div>
                  {reservation.guests.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-1.5 pl-1">
                      +{reservation.guests.length - 1} additional guest{reservation.guests.length - 1 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsExpanded(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
