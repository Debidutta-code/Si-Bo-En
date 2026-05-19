import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { InventoryDay } from '../types/inventory';

interface SmartInventoryTooltipProps {
  day: InventoryDay;
  triggerRef?: React.RefObject<HTMLElement>;
  onClose?: () => void;
  onOpen?: () => void;
}

type Position = 'top' | 'bottom' | 'left' | 'right';

export const InventoryTooltip: React.FC<SmartInventoryTooltipProps> = ({ 
  day, 
  triggerRef,
  onClose,
  onOpen,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [_position, setPosition] = useState<Position>('bottom');
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [_isTooltipHovered, setIsTooltipHovered] = useState(false);
  const roomTypes = day.roomTypes || [];
  const ratePlans = day.ratePlans || [];

  useEffect(() => {
    if (!triggerRef?.current || !tooltipRef.current) return;

    const gap = 12;

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      const triggerRect = trigger.getBoundingClientRect();

      // measure after paint to get accurate tooltip dimensions
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition: Position = 'right';
      let newStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
      };

      const spaceRight = viewportWidth - triggerRect.right;
      const spaceLeft = triggerRect.left;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Priority: Right > Left > Bottom > Top
      if (spaceRight > tooltipRect.width + gap) {
        // Right - vertically centered with clamping
        const centerY = triggerRect.top + triggerRect.height / 2;
        const minCenterY = tooltipRect.height / 2 + 8;
        const maxCenterY = viewportHeight - tooltipRect.height / 2 - 8;
        const clampedY = clamp(centerY, minCenterY, maxCenterY);

        const left = Math.min(viewportWidth - tooltipRect.width - 8, Math.max(triggerRect.right + gap, 8));

        newPosition = 'right';
        newStyle = {
          ...newStyle,
          top: `${clampedY}px`,
          left: `${left}px`,
          transform: 'translateY(-50%)',
        };
      } else if (spaceLeft > tooltipRect.width + gap) {
        // Left - vertically centered with clamping
        const centerY = triggerRect.top + triggerRect.height / 2;
        const minCenterY = tooltipRect.height / 2 + 8;
        const maxCenterY = viewportHeight - tooltipRect.height / 2 - 8;
        const clampedY = clamp(centerY, minCenterY, maxCenterY);

        const left = Math.max(8, triggerRect.left - gap - tooltipRect.width);

        newPosition = 'left';
        newStyle = {
          ...newStyle,
          top: `${clampedY}px`,
          left: `${left}px`,
          transform: 'translateY(-50%)',
        };
      } else if (spaceBelow > tooltipRect.height + gap) {
        // Bottom - horizontally centered with clamping
        const centerX = triggerRect.left + triggerRect.width / 2;
        const minCenterX = tooltipRect.width / 2 + 8;
        const maxCenterX = viewportWidth - tooltipRect.width / 2 - 8;
        const clampedX = clamp(centerX, minCenterX, maxCenterX);

        newPosition = 'bottom';
        newStyle = {
          ...newStyle,
          top: `${triggerRect.bottom + gap}px`,
          left: `${clampedX}px`,
          transform: 'translateX(-50%)',
        };
      } else if (spaceAbove > tooltipRect.height + gap) {
        // Top - horizontally centered with clamping
        const centerX = triggerRect.left + triggerRect.width / 2;
        const minCenterX = tooltipRect.width / 2 + 8;
        const maxCenterX = viewportWidth - tooltipRect.width / 2 - 8;
        const clampedX = clamp(centerX, minCenterX, maxCenterX);

        newPosition = 'top';
        newStyle = {
          ...newStyle,
          top: `${Math.max(8, triggerRect.top - gap - tooltipRect.height)}px`,
          left: `${clampedX}px`,
          transform: 'translateX(-50%)',
        };
      } else {
        // Fallback: place to the right but clamp within viewport
        const centerY = triggerRect.top + triggerRect.height / 2;
        const minCenterY = tooltipRect.height / 2 + 8;
        const maxCenterY = viewportHeight - tooltipRect.height / 2 - 8;
        const clampedY = clamp(centerY, minCenterY, maxCenterY);

        const left = Math.min(viewportWidth - tooltipRect.width - 8, Math.max(triggerRect.right + gap, 8));

        newPosition = 'right';
        newStyle = {
          ...newStyle,
          top: `${clampedY}px`,
          left: `${left}px`,
          transform: 'translateY(-50%)',
          maxHeight: `${viewportHeight - 40}px`,
        };
      }

      setPosition(newPosition);
      setStyle(newStyle);
    };

    // calculate after paint to ensure sizes are accurate
    requestAnimationFrame(() => calculatePosition());

    // Recalculate on resize/scroll to keep it in view
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [triggerRef, day]);

  const content = (
    <div
      ref={tooltipRef}
      className="bg-gray-900 text-white p-3 sm:p-4 rounded-lg shadow-2xl w-72 sm:w-80 max-h-80 sm:max-h-96 overflow-y-auto pointer-events-auto"
      style={style}
      onMouseEnter={() => {
        setIsTooltipHovered(true);
        if (onOpen) onOpen();
      }}
      onMouseLeave={() => {
        setIsTooltipHovered(false);
        if (onClose) {
          onClose();
        }
      }}
    >
      {/* Availability Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-xs sm:text-sm mb-2 border-b border-gray-700 pb-1">
          Availability
        </h4>
        <div className="space-y-1 text-xs">
          {roomTypes.length > 0 ? (
            <>
              {roomTypes.map((room) => (
                <div key={room.invTypeCode} className="flex justify-between gap-2">
                  <span className="truncate">{room._translations?.roomName || room.roomName || room.invTypeCode}:</span>
                  <span className="whitespace-nowrap">{room.available} available, {room.sold} sold</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-1 mt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span className="whitespace-nowrap">{day.available} available, {day.sold} sold</span>
              </div>
            </>
          ) : (
            <div className="text-gray-400">No room data available</div>
          )}
        </div>
      </div>

      {/* Rate Plans Sections */}
      {ratePlans.length > 0 && ratePlans.map((ratePlan) => (
        <div key={ratePlan.ratePlanCode} className="mb-4">
          <h4 className="font-semibold text-xs sm:text-sm mb-2 border-b border-gray-700 pb-1 truncate">
            {ratePlan.ratePlanCode}
          </h4>
          <div className="space-y-1 text-xs">
            {ratePlan.prices.map((pricing) => (
              <div key={pricing.invTypeCode} className="flex justify-between gap-2">
                <span className="truncate">{pricing.invTypeCode}:</span>
                <span className="whitespace-nowrap">{pricing.currencyCode} {pricing.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Occupancy Section */}
      <div>
        <h4 className="font-semibold text-xs sm:text-sm mb-2 border-b border-gray-700 pb-1">
          Occupancy
        </h4>
        <div className="space-y-1 text-xs">
          {roomTypes.length > 0 ? (
            <>
              {roomTypes.map((room) => (
                <div key={room.invTypeCode} className="flex justify-between gap-2">
                  <span className="truncate">{room._translations?.roomName || room.roomName || room.invTypeCode}:</span>
                  <span className="whitespace-nowrap">{room.occupancy}%</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-1 mt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span>{day.occupancyPercent || 0}%</span>
              </div>
            </>
          ) : (
            <div className="text-gray-400">No occupancy data available</div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};