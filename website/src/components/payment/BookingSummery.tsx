"use client";
import React from "react";

interface BookingSummaryProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guest: any[];
  email: string;
  hotelName: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  checkIn,
  checkOut,
  nights,
  rooms,
  adults,
  children,
  guest,
  email,
  hotelName,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">Booking Summary</h2>
      <div className="text-sm text-gray-800 space-y-1">
        <p>
          <strong>Stay Dates:</strong> {checkIn} - {checkOut} ({nights} night{nights > 1 ? "s" : ""})
        </p>
        <p>
          <strong>Guests:</strong> {rooms || 1} Room · {adults || 1} Adult{adults !== 1 ? "s" : ""}
          {children > 0 ? ` · ${children} Child${children !== 1 ? "ren" : ""}` : ""}
        </p>
        <p>
          <strong>Guest Name:</strong>{" "}
          {guest && guest.length > 0 ? `${guest[0].firstName} ${guest[0].lastName}` : ""}{" "}
          <br />
          <span className="text-gray-500"><strong>Email:</strong> {email}</span>
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
