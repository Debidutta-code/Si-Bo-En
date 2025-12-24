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
  ChevronUp
} from "lucide-react";
import type { IReservation } from "../types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ReservationCardProps {
  reservation: IReservation;
  onCancel?: (reservationId: string) => void;
  onAmend?: (reservationId: string) => void;
}

export default function ReservationCard({ 
  reservation, 
  onCancel, 
  onAmend 
}: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'modified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'modified':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">
                {reservation.bookingCode}
              </h3>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.bookingStatus)}`}>
                {getStatusIcon(reservation.bookingStatus)}
                {reservation.bookingStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {reservation.property?.propertyName || reservation.hotelName}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {reservation.bookingStatus === 'confirmed' && (
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
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Guest Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>
                  {reservation.primaryGuest?.firstName} {reservation.primaryGuest?.lastName}
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
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Check-in: <strong>{formatDate(reservation.checkInDate)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Check-out: <strong>{formatDate(reservation.checkOutDate)}</strong>
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
                  Paid: {reservation.currencyCode} {reservation.paidAmount.toFixed(2)}
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
            {reservation.priceBreakdowns && reservation.priceBreakdowns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</h4>
                <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate per Night:</span>
                    <span className="font-medium">
                      {reservation.currencyCode} {reservation.priceBreakdowns[0].baseRatePerNight}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Nights:</span>
                    <span className="font-medium">{reservation.priceBreakdowns[0].numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Charges:</span>
                    <span className="font-medium">
                      {reservation.currencyCode} {reservation.priceBreakdowns[0].additionalGuestCharges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      {reservation.currencyCode} {Number(reservation.priceBreakdowns[0].totalTax).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="font-bold text-gray-900">
                      {reservation.currencyCode} {Number(reservation.priceBreakdowns[0].totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-medium text-gray-900 mt-1 capitalize">
                  {reservation.paymentMethod.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Booking Source:</span>
                <p className="font-medium text-gray-900 mt-1 uppercase">{reservation.bookingSource}</p>
              </div>
              <div>
                <span className="text-gray-600">Booked At:</span>
                <p className="font-medium text-gray-900 mt-1">{formatDate(reservation.bookedAt)}</p>
              </div>
              {reservation.isPromoUsed && (
                <div>
                  <span className="text-gray-600">Promo Applied:</span>
                  <p className="font-medium text-green-600 mt-1">Yes</p>
                </div>
              )}
            </div>

            {/* Guest List */}
            {reservation.guests && reservation.guests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">All Guests</h4>
                <div className="space-y-2">
                  {reservation.guests.map((guest: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-md">
                      <span className="font-medium">
                        {guest.firstName} {guest.lastName}
                      </span>
                      <span className="text-gray-600 capitalize">{guest.type || guest.userType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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