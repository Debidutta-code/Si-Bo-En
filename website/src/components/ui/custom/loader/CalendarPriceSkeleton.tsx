import React from "react";
import "./styles/CalendarPriceSkeleton.css";

interface CalendarPriceSkeletonProps {
  /** Matches the day number shown in the calendar cell */
  day: number;
}

const CalendarPriceSkeleton: React.FC<CalendarPriceSkeletonProps> = ({ day }) => {
  return (
    <div className="cps-day-wrapper">
      <span className="cps-day-number">{day}</span>
      <span className="cps-price-shimmer" aria-hidden="true" />
    </div>
  );
};

export default CalendarPriceSkeleton;