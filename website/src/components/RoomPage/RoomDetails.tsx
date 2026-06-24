"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Bed,
  Eye,
  Ruler,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";
import { formatNumber } from "../../utils/numLang";
import { IRoomDetails } from "@/src/app/(unauth)/Rooms/interface";
import { IRoomPrice } from "@/src/app/(unauth)/Rooms/types";

interface Props {
  room: IRoomDetails;
  selectedRatePlan?: IRoomPrice;
  onClose: () => void;
}

// ─── Shared accordion config (matches RoomCard) ───────────────────────────────
const accordionVariants = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
};
const accordionTransition = { duration: 0.22, ease: "easeInOut" as const };

// ─── Policy section ───────────────────────────────────────────────────────────
const PolicySection = ({
  title,
  content,
}: {
  title: string;
  content?: string;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const displayText = content?.trim() || t("GuestForm.notAvailable");
  const shouldTruncate = displayText.length > 200;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="flex-shrink-0 text-gray-300 ml-2"
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={accordionVariants}
            transition={accordionTransition}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 pt-1">
              <p className="text-sm text-gray-600 leading-relaxed">
                {displayText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
const RoomDetails: React.FC<Props> = ({ room, onClose, selectedRatePlan }) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ── Media ────────────────────────────────────────────────────────────────────
  const mediaItems = [
    ...(room.roomVideos?.url
      ? [
          {
            type: "video" as const,
            src: room.roomVideos.url,
            thumbnail: room.roomVideos.thumbnail,
          },
        ]
      : []),
    ...(room.images || []).map((img) => ({
      type: "image" as const,
      src: img,
    })),
  ];

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const nextMedia = () =>
    setCurrentMediaIndex((p) => (p + 1) % mediaItems.length);
  const prevMedia = () =>
    setCurrentMediaIndex((p) =>
      p === 0 ? mediaItems.length - 1 : p - 1
    );

  const currentMedia = mediaItems[currentMediaIndex];
  const mediaKey = `media-${currentMediaIndex}`;

  // ── Currency helpers ─────────────────────────────────────────────────────────
  const selectedCurrencyCode = selectedRatePlan?.currencyCode ?? "USD";
  const currencySymbol =
    currencies.find((c: Currency) => c.code === selectedCurrencyCode)
      ?.symbol ?? selectedCurrencyCode;

  const touristTaxCode = selectedRatePlan?.touristTax?.currencyCode ?? "USD";
  const taxSymbol =
    currencies.find((c: Currency) => c.code === touristTaxCode)?.symbol ??
    touristTaxCode;

  const policy = selectedRatePlan?.policy;

  if (!room) return null;

  return (
    // Overlay
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl relative"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white border border-gray-100 shadow-sm rounded-full p-1.5 hover:bg-gray-50 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </motion.button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight pr-8">
            {room._translations?.roomName ?? room.roomName}
          </h2>
        </div>

        {/* ── Media carousel ─────────────────────────────────────────────────── */}
        <div className="px-6 pt-5">
          {mediaItems.length > 0 ? (
            <div className="relative">
              {/* Image / video with crossfade */}
              <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden bg-gray-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mediaKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="absolute inset-0"
                  >
                    {currentMedia.type === "video" ? (
                      <video
                        controls
                        className="w-full h-full object-cover"
                        poster={currentMedia.thumbnail}
                      >
                        <source src={currentMedia.src} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        src={currentMedia.src}
                        alt={room._translations?.roomName ?? room.roomName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Nav arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
              </div>

              {/* Pill dots */}
              {mediaItems.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {mediaItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 bg-gray-300 hover:bg-gray-400 ${
                        currentMediaIndex === idx ? "w-4 bg-gray-700" : "w-1.5"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src="https://via.placeholder.com/600x400?text=No+Image"
                alt="No Image"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        <div className="px-6 pb-8 pt-6 space-y-7">

          {/* Room description */}
          <div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {room._translations?.description ?? room.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: <Users size={15} className="text-gray-400" />,
                label: `${formatNumber(room.maxOccupancy)} ${t("RoomDetails.guests", { defaultValue: "Guests" })}`,
              },
              {
                icon: <Bed size={15} className="text-gray-400" />,
                label: `${formatNumber(room.numberOfBedrooms)} ${t("RoomDetails.bedrooms", { defaultValue: "Bedrooms" })}`,
              },
              {
                icon: <Eye size={15} className="text-gray-400" />,
                label:
                  room.roomView?._translations?.viewName ??
                  room.roomView?.MasterRoomView?.viewName ??
                  t("RoomDetails.notAvailable"),
              },
              {
                icon: <Ruler size={15} className="text-gray-400" />,
                label: `${formatNumber(room.roomSize)} ${t('Rooms.' + room.roomUnit)}`,
              },
            ].map(({ icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                {icon}
                <span className="text-sm text-gray-700 font-medium truncate">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {t("RoomDetails.amenities", { defaultValue: "Amenities" })}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full"
                  >
                    {amenity._translations?.amenityName ?? amenity.amenityName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rate plan info */}
          {selectedRatePlan && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {t("RoomDetails.ratePlanInformation", {
                  defaultValue: "Rate Plan",
                })}
              </h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                  <span className="text-sm font-semibold text-gray-800">
                    {selectedRatePlan._translations?.ratePlanName ??
                      selectedRatePlan.ratePlanName}
                  </span>
                  <span className="text-base font-bold text-gray-900 tabular-nums">
                    {currencySymbol}{" "}
                    {formatNumber(selectedRatePlan.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tourist tax */}
          {selectedRatePlan?.touristTax && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="text-base select-none mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {selectedRatePlan.touristTax._translations?.name ??
                    selectedRatePlan.touristTax.name}
                </p>
                <p className="text-sm text-amber-700 tabular-nums mt-0.5">
                  {taxSymbol}{" "}
                  {formatNumber(
                    selectedRatePlan.touristTax.calculatedTaxAmount
                  )}{" "}
                  — paid at the property
                </p>
              </div>
            </div>
          )}

          {/* Policies */}
          {policy && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {t("RoomDetails.policies", { defaultValue: "Policies" })}
              </h3>
              <div className="space-y-2">
                <PolicySection
                  title={
                    policy.cancellationPolicy?._translations?.policyName ??
                    policy.cancellationPolicy?.policyName ??
                    t("RoomDetails.cancellationPolicy", {
                      defaultValue: "Cancellation Policy",
                    })
                  }
                  content={
                    policy.cancellationPolicy?._translations?.description ??
                    policy.cancellationPolicy?.description
                  }
                />
                <PolicySection
                  title={
                    policy.guaranteePolicy?._translations?.policyName ??
                    policy.guaranteePolicy?.policyName ??
                    t("RoomDetails.guaranteePolicy", {
                      defaultValue: "Guarantee Policy",
                    })
                  }
                  content={
                    policy.guaranteePolicy?._translations?.description ??
                    policy.guaranteePolicy?.description
                  }
                />
                <PolicySection
                  title={
                    policy.depositPolicy?._translations?.policyName ??
                    policy.depositPolicy?.policyName ??
                    t("RoomDetails.depositPolicy", {
                      defaultValue: "Deposit Policy",
                    })
                  }
                  content={
                    policy.depositPolicy?._translations?.description ??
                    policy.depositPolicy?.description
                  }
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoomDetails;