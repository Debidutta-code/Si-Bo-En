"use client";
import React from "react";

interface HelpBoxProps {
  hotelEmail?: string;
}

const HelpBox: React.FC<HelpBoxProps> = ({ hotelEmail }) => {
  const supportEmail = hotelEmail || "info@swiftrooms.ai";
  const emailSubject = "Support%20Request";
  const emailBody = hotelEmail 
    ? `Hi%20Team,` 
    : `Hi%20Swiftrooms%20Team,`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 text-sm">
      <h2 className="text-lg font-semibold text-orange-600 mb-2">Need Help?</h2>
      <p className="text-gray-700 mb-3">
        Our customer support team is available 24/7 to assist you with any questions about your booking.
      </p>
      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${emailSubject}&body=${emailBody}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-orange-600 hover:text-orange-700 underline font-medium"
      >
        Contact Support →
      </a>
    </div>
  );
};

export default HelpBox;
