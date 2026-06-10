"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UrgencyBannerProps {
  primaryColor: string;
}

export const UrgencyBanner = ({ primaryColor }: UrgencyBannerProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="mb-4 relative">
      <div
        className="rounded-xl p-4 shadow-md border-2"
        style={{
          backgroundColor: `${primaryColor}15`,
          borderColor: `${primaryColor}40`,
        }}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1 uppercase">
            {t("Rooms.urgencyBanner.title")}
          </h3>
          <p className="text-sm font-semibold text-gray-700 uppercase">
            {t("Rooms.urgencyBanner.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
};