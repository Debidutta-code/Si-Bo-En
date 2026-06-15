"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
import { IRoom, IRoomPrice } from "@/src/app/(unauth)/Rooms/types";
interface Props {
  room: IRoom;
  selectedRatePlan?: IRoomPrice;
  onClose: () => void;
}

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
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-2">
        {title}
      </h4>

      <p
        className={`text-sm text-gray-700 ${
          !expanded ? "line-clamp-3" : ""
        }`}
      >
        {displayText}
      </p>

      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

const RoomDetails: React.FC<Props> = ({
  room,
  onClose,
  selectedRatePlan,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!room) return null;

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

  const [currentMediaIndex, setCurrentMediaIndex] =
    useState(0);

  const nextMedia = () => {
    setCurrentMediaIndex(
      (prev) => (prev + 1) % mediaItems.length
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0
        ? mediaItems.length - 1
        : prev - 1
    );
  };

  const currentMedia =
    mediaItems[currentMediaIndex];

  const policy = selectedRatePlan?.policy;
  
  const selectedCurrencyCode = selectedRatePlan?.currencyCode || "USD";
  const currencySymbol = currencies.find((c: Currency) => c.code === selectedCurrencyCode)?.symbol || selectedCurrencyCode;
  
  const touristTaxCurrency = selectedRatePlan?.touristTax?.currencyCode || "USD";
  const touristTaxSymbol = currencies.find((c: Currency) => c.code === touristTaxCurrency)?.symbol || touristTaxCurrency;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-3xl font-bold text-gray-900">
            {room._translations?.roomName ||
              room.roomName}
          </h2>

          <p className="text-gray-500 mt-1">
            {room._translations?.roomType ||
              room.roomType}
          </p>
        </div>

        {/* Media */}
        <div className="relative p-6">
          {mediaItems.length > 0 ? (
            <div className="relative">
              {currentMedia.type === "video" ? (
                <video
                  controls
                  className="w-full h-[400px] object-cover rounded-xl"
                  poster={currentMedia.thumbnail}
                >
                  <source
                    src={currentMedia.src}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <img
                  src={currentMedia.src}
                  alt="Room"
                  className="w-full h-[400px] object-cover rounded-xl"
                />
              )}

              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <img
              src="https://via.placeholder.com/600x400?text=No+Image"
              alt="No Image"
              className="w-full h-[400px] rounded-xl object-cover"
            />
          )}

          {/* Dots */}
          {mediaItems.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentMediaIndex(index)
                  }
                  className={`h-2 w-2 rounded-full ${
                    currentMediaIndex === index
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Room Information */}
        <div className="px-6 pb-6">
  {/* Room Information */}
  <h3 className="text-xl font-semibold mb-3">
    {t("RoomDetails.roomInformation")}
  </h3>

  <p className="text-gray-700 leading-relaxed mb-6">
    {room._translations?.description || room.description}
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <div className="flex items-center gap-3">
      <Users size={18} />
      <span>
        {room.maxOccupancy} {t("RoomDetails.guests")}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Bed size={18} />
      <span>
        {room.numberOfBedrooms} {t("RoomDetails.bedrooms")}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Eye size={18} />
      <span>
        {room.roomView?._translations?.viewName ||
          room.roomView?.MasterRoomView?.viewName ||
          t("RoomDetails.notAvailable")}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Ruler size={18} />
      <span>
        {room.roomSize} {room.roomUnit}
      </span>
    </div>
  </div>

  {/* Amenities */}
  {room.amenities?.length > 0 && (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-3">
        {t("RoomDetails.amenities")}
      </h3>

      <div className="flex flex-wrap gap-2">
        {room.amenities.map((amenity) => (
          <span
            key={amenity.id}
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm"
          >
            {amenity._translations?.amenityName ||
              amenity.amenityName}
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Rate Plan Information */}
  {selectedRatePlan && (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-3">
        {t("RoomDetails.ratePlanInformation")}
      </h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <p>
          <strong>{t("RoomDetails.ratePlan")}:</strong>{" "}
          {selectedRatePlan._translations?.ratePlanName ||
            selectedRatePlan.ratePlanName}
        </p>

        <p>
          <strong>{t("RoomDetails.price")}:</strong>{" "}
          {currencySymbol}{" "}
          {formatNumber(selectedRatePlan.totalAmount)}
        </p>
      </div>
    </div>
  )}

  {/* Tourist Tax */}
  {selectedRatePlan?.touristTax && (
    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h3 className="font-semibold text-amber-900 mb-2">
        {selectedRatePlan.touristTax._translations?.name || selectedRatePlan.touristTax.name || t("RoomDetails.notAvailable")}
      </h3>

      <p className="font-bold">
        {touristTaxSymbol}{" "}
        {formatNumber(selectedRatePlan.touristTax.calculatedTaxAmount)}
      </p>
    </div>
  )}

  {/* Policies */}
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">
      {t("RoomDetails.policies")}
    </h3>

    <PolicySection
      title={
        policy?.cancellationPolicy?._translations
          ?.policyName ||
        policy?.cancellationPolicy?.policyName ||
        t("RoomDetails.cancellationPolicy")
      }
      content={
        policy?.cancellationPolicy?._translations
          ?.description ||
        policy?.cancellationPolicy?.description
      }
    />

    <PolicySection
      title={
        policy?.guaranteePolicy?._translations
          ?.policyName ||
        policy?.guaranteePolicy?.policyName ||
        t("RoomDetails.guaranteePolicy")
      }
      content={
        policy?.guaranteePolicy?._translations
          ?.description ||
        policy?.guaranteePolicy?.description
      }
    />

    <PolicySection
      title={
        policy?.depositPolicy?._translations
          ?.policyName ||
        policy?.depositPolicy?.policyName ||
        t("RoomDetails.depositPolicy")
      }
      content={
        policy?.depositPolicy?._translations
          ?.description ||
        policy?.depositPolicy?.description
      }
    />
  </div>
</div>
      </div>
    </div>
  );
};

export default RoomDetails;