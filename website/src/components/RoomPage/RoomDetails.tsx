import { Room } from "@/src/store/roomsSlice";
import React, { useEffect, useState } from "react";

interface baseByGuestAmts {
  amountBeforeTax: number;
  numberOfGuests: number;
}
interface Policy {
  _id: string;
  policyName: string;
  type: string;
  description: string;
  propertyCode: string;
  createdAt: string;
  updatedAt: string;
}

interface room_price {
  baseByGuestAmts?: baseByGuestAmts[];
  currencyCode?: string;
  ratePlanCode?: string;
  ratePlanName?: string;
  policy?: {
    depositPolicy?: Policy;
    cancellationPolicy?: Policy;
    guaranteePolicy?: Policy;
  };
}

interface Props {
  room:Room;
  selectedRatePlan?: room_price;
  onClose: () => void;
}

// Reusable policy section component
const PolicySection = ({
  title,
  content,
}: {
  title: string;
  content?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const displayText = content?.trim() || "Not Available";
  const shouldTruncate = displayText.length > 200;
// //console.log()
  return (
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className={`text-sm text-gray-700 ${!expanded ? "line-clamp-3" : ""}`}>
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm mt-1"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};

const RoomDetails: React.FC<Props> = ({ room, onClose, selectedRatePlan }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!room) return null;

  const displayedImages = room.images?.slice(0, 3);
  const fallbackImage =
    "https://via.placeholder.com/300x200?text=No+Image+Available";

  const policy = selectedRatePlan?.policy;
// //console.log(selectedRatePlan)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button & Title */}
        <div className="top-0 z-10 bg-white pb-2">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {room.room_name}
          </h2>
        </div>

        {/* Room Images */}
        {room.images && room.images.length > 0 ? (
          <div
            className={`grid gap-4 mb-6 ${
              room.images.length === 1
                ? "md:grid-cols-1"
                : room.images.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-3"
            }`}
          >
            {displayedImages?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Room Image ${index + 1}`}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <img
              src={fallbackImage}
              alt="No image available"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Room Info */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Description:</strong> {room.description}
          </p>
          <p>
            <strong>Size:</strong> {room.room_size} {room.room_unit}
          </p>
          <p>
            <strong>Max Occupancy:</strong> {room.max_occupancy} guests
          </p>
          {selectedRatePlan?.ratePlanName && (
            <p>
              <strong>Rate Plan:</strong> {selectedRatePlan.ratePlanName}
            </p>
          )}
        </div>

        {/* Policy Sections */}
        <div className="mt-4 space-y-4">
          <PolicySection
            title="Cancellation Policy"
            content={policy?.cancellationPolicy?.description || "Not available" }
          />
          <PolicySection
            title="Guarantee Policy"
            content={policy?.guaranteePolicy?.description || "Not available"}
          />
          <PolicySection
            title="Deposit Policy"
            content={policy?.depositPolicy?.description || "Not available"}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
