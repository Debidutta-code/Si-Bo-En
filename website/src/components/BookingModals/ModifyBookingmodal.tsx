import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModifyGuestSelector from "./ModifyGuestSelector";
import { FaCalendarAlt, FaUser, FaInfoCircle } from "react-icons/fa";
import { isBefore } from "date-fns";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { formatNumber, getLocale } from "../../utils/numLang";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";
export interface Guest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dob: string;
  age?: number | null;
}

interface Room {
  adults: number;
  children: number;
  childAges: number[];
}

interface Props {
  bookingData: any;
  onClose: () => void;
  onUpdate: () => void;
}
const extractGuestDistribution = (bookingData: any) => {
    const dailyBreakdown =
        bookingData.PricingBrakeDown?.DailyPriceBrakeDown ||
        bookingData.priceBreakdowns?.[0]?.dailyBreakdown ||
        bookingData.finalPrice?.dailyPriceBrakeDown ||
        bookingData.finalPrice?.dailyBreakdown ||
        [];
  if (!dailyBreakdown.length)
    return [{ adults: 1, children: 0, childAges: [] }];

  // Group by roomNumber, keep only the FIRST date's entry per room
  const seenRooms = new Set<string>();
  const perRoom: { adults: number; children: number; childAges: number[] }[] =
    [];

  for (const entry of dailyBreakdown) {
    if (seenRooms.has(String(entry.roomNumber))) continue;
    seenRooms.add(String(entry.roomNumber));
    perRoom.push({
      adults: entry.guestDistribution?.adults ?? 1,
      children: entry.guestDistribution?.children ?? 0,
      childAges: entry.guestDistribution?.childAges ?? [],
    });
  }

  return perRoom.length ? perRoom : [{ adults: 1, children: 0, childAges: [] }];
};

/** Sum adults / children / childAges across all rooms */
const sumGuests = (
  rooms: { adults: number; children: number; childAges: number[] }[],
) => {
  let adults = 0;
  let children = 0;
  const childAges: number[] = [];
  for (const r of rooms) {
    adults += r.adults;
    children += r.children;
    childAges.push(...(r.childAges ?? []));
  }
  return { adults, children, childAges };
};

const normalizeGuests = (guests: any[], reservationGuests: any[]): Guest[] =>
  guests.map((guest) => {
    const rg = (reservationGuests || []).find(
      (r: any) =>
        r.firstName === guest.firstName && r.lastName === guest.lastName,
    );
    return {
      type: guest.type || "adult",
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      dob: guest.dob?.split("T")[0] || guest.dateOfBirth?.split("T")[0] || "",
      ...(guest.type === "child" && { age: rg?.age || guest.age || 0 }),
    };
  });

const countGuests = (guests: Guest[]) =>
  guests.reduce(
    (acc, g) => {
      if (g.type === "adult") acc.adults++;
      else acc.children++;
      return acc;
    },
    { adults: 0, children: 0 },
  );

const parseDate = (date: any): string => {
  if (typeof date === "string") return date.split("T")[0];
  if (date && typeof date === "object" && "$date" in date)
    return date.$date.split("T")[0];
  return "";
};

const buildPromotions = (bookingData: any): { id: string; promotionType: string }[] => {
    const promotionBreakdown: any[] =
        bookingData.PricingBrakeDown?.promotionBrakeDown ??  // ← capital P
        bookingData.finalPrice?.promotionBrakeDown ?? [];
    
    return promotionBreakdown
        .filter((p: any) => p.type === "user_applied" && p.restrictionType !== "payLater" && p.id) // ← underscore, exclude payLater
        .map((p: any) => ({
            id: p.promotionId as string,
            promotionType: p.promotionType === "mlos" ? "mlos" : "normal", // ← preserve mlos type
        }));
};


const ModifyBookingModal: FC<Props> = ({ bookingData, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dates" | "guests">("dates");

  const [checkInDate, setCheckInDate] = useState(
    parseDate(bookingData.reservationStartDate),
  );
  const [checkOutDate, setCheckOutDate] = useState(
    parseDate(bookingData.reservationEndDate),
  );
  const isCheckInPassed = isBefore(new Date(checkInDate), new Date());

  // ── Derive initial room layout from priceBreakdowns (source of truth) ──────
  const initialRoomDistribution = extractGuestDistribution(bookingData);
  const initialRoomCount = initialRoomDistribution.length;
  const initialGuestTotals = sumGuests(initialRoomDistribution);

  const [requestedRooms, setRequestedRooms] = useState(initialRoomCount);
  const [previousRooms] = useState(initialRoomCount);

  // rooms array for the update payload (one entry per room with adult/child/childAges)
  const [rooms, setRooms] = useState<Room[]>(initialRoomDistribution);

  // guestDistribution sent to price API — one entry per room (not per night)
  const [guestDistribution, setGuestDistribution] = useState<
    { adults: number; children: number; childAges: number[] }[]
  >(initialRoomDistribution);

  const [childAges, setChildAges] = useState<number[]>(
    initialGuestTotals.childAges,
  );

  const [guestForms, setGuestForms] = useState<Guest[]>(
    normalizeGuests(bookingData.guests, bookingData.reservationGuests),
  );
  const [guestCounts, setGuestCounts] = useState(
    countGuests(
      normalizeGuests(bookingData.guests, bookingData.reservationGuests),
    ),
  );
  const [guestSummary, setGuestSummary] = useState("Add Guests");

  const [amount, setAmount] = useState(bookingData.amount);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  const rawCurrencyCode = bookingData?.currencyCode || "USD";
  const currencySymbol = currencies.find((c: Currency) => c.code === rawCurrencyCode)?.symbol || rawCurrencyCode;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [priceFetched, setPriceFetched] = useState(false);
  const [priceFetchError, setPriceFetchError] = useState(false);

  const [finalPrice, setFinalPrice] = useState<any>({
    booking: { finalPayable: 0, refundAmount: 0, discount: 0 },
    totalAmount: bookingData.amount,
    breakdown: {
      totalBaseAmount: 0,
      totalAdditionalCharges: 0,
      totalAmount: 0,
      totalTax: 0,
      priceAfterTax: 0,
    },
    tax: [],
  });

  const [dateErrors, setDateErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
  }>({});
  const [errors, setErrors] = useState<any>({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  // Keep childAges in sync with guestForms
  useEffect(() => {
    const ages = guestForms
      .filter((g) => g.type === "child")
      .map((g) => g.age || 0);
    setChildAges(ages);
  }, [guestForms]);

  // ── Fetch updated price ────────────────────────────────────────────────────
const fetchUpdatedPrice = async () => {
  if (!checkInDate || !checkOutDate) {
    toast.error(t("ModifyBooking.errors.selectDates"));
    return;
  }

  try {
    setPriceLoading(true);
    setPriceFetchError(false);

    let noOfAdults = 0;
    let noOfChildrens = 0;

    guestForms.forEach((g) => {
      if (g.type === "adult") noOfAdults++;
      else noOfChildrens++;
    });

    const includedAddonIds = Array.from(
      new Set(
        (bookingData.addOns || [])
          .filter((a: any) => a.type === "included")
          .map((a: any) => a.addonId)
      )
    ) as string[];

    const addonMap = new Map<
      string,
      { date: string; quantity: number }[]
    >();

    (bookingData.addOns || [])
      .filter(
        (a: any) =>
          a.type === "selected" &&
          !a.name.includes("Child age")
      )
      .forEach((a: any) => {
        // addon.date is UTC-shifted (18:30Z) — add 1 day to get correct local date
        const d = new Date(a.date);

        d.setUTCDate(d.getUTCDate() + 1);
        d.setUTCHours(0, 0, 0, 0);

        const normalizedDate = d.toISOString();

        if (!addonMap.has(a.addonId)) {
          addonMap.set(a.addonId, []);
        }

        const existing = addonMap
          .get(a.addonId)!
          .find((e) => e.date === normalizedDate);

        if (existing) {
          existing.quantity += a.quantity;
        } else {
          addonMap.get(a.addonId)!.push({
            date: normalizedDate,
            quantity: a.quantity,
          });
        }
      });

    const parsedAddons = Array.from(addonMap.entries()).map(
      ([addOnId, availability]) => ({
        addOnId,
        availability,
      })
    );

    // Build promotions — only user-applied ones from finalPrice
    const promotions = buildPromotions(bookingData);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/pricing/get-price`,
      {
        propertyCode: bookingData.propertyCode,
        invTypeCode: bookingData.roomTypeCode,
        startDate: checkInDate,
        endDate: checkOutDate,
        noOfAdults,
        noOfChildren: noOfChildrens,
        noOfRooms: requestedRooms,
        bookingCode: bookingData.bookingCode,
        guestDistribution,
        ratePlanCode: bookingData.ratePlanCode,
        childAges,
        parsedAddons,
        includedAddons: includedAddonIds,
        promotions,
        promoCode: "",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const data = response.data;

    if (!data.success) {
      setPriceFetchError(true);

      toast.error(
        data.message || "Failed to fetch updated price"
      );

      return;
    }

    const updatedAmount = Number(data?.data?.totalAmount);
    const paidAmount = bookingData?.paidAmount || 0;

    const priceDifference = updatedAmount - paidAmount;

    setFinalPrice({
      ...data.data,
      booking: {
        finalPayable:
          priceDifference > 0 ? priceDifference : 0,
        refundAmount:
          priceDifference < 0
            ? Math.abs(priceDifference)
            : 0,
        discount: data.data.discount || 0,
      },
    });

    setAmount(updatedAmount);
    setPriceFetched(true);

    toast.success("Price updated successfully!");
  } catch (error: any) {
    setPriceFetchError(true);

    toast.error(
      error?.response?.data?.message ||
        "Failed to fetch updated price. Please try again."
    );

    console.error("Fetch price error:", error);
  } finally {
    setPriceLoading(false);
  }
};

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateGuests = (): boolean => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    let valid = true;
    guestForms.forEach((guest, index) => {
      const isPrimary = index === 0 && guest.type === "adult";
      const gErrors: any = {};

      if (isPrimary) {
        if (!guest.firstName.trim()) {
          gErrors.firstName = "First name is required.";
          valid = false;
        } else if (!nameRegex.test(guest.firstName)) {
          gErrors.firstName = "Invalid Name Format";
          valid = false;
        }
        if (!guest.lastName.trim()) {
          gErrors.lastName = "Last name is required.";
          valid = false;
        } else if (!nameRegex.test(guest.lastName)) {
          gErrors.lastName = "Invalid Name Format";
          valid = false;
        }
      } else {
        if (guest.firstName.trim() && !nameRegex.test(guest.firstName)) {
          gErrors.firstName = "Invalid Name Format";
          valid = false;
        }
        if (guest.lastName.trim() && !nameRegex.test(guest.lastName)) {
          gErrors.lastName = "Invalid Name Format";
          valid = false;
        }
      }

      if (Object.keys(gErrors).length) newErrors[`guest-${index}`] = gErrors;
    });
    setErrors(newErrors);
    return valid;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGuestDetailChange = (
    index: number,
    field: keyof Guest,
    value: string,
  ) => {
    const updated = [...guestForms];
    updated[index] = { ...updated[index], [field]: value };
    setGuestForms(updated);
    setPriceFetched(false);
  };

  const handleUpdate = async () => {
    if (priceFetchError) {
      toast.error(t("ModifyBooking.errors.priceError"));
      return;
    }
    if (!priceFetched) {
      toast.error(t("ModifyBooking.errors.fetchPriceFirst"));
      return;
    }
    const errs: { checkIn?: string; checkOut?: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (!checkInDate) errs.checkIn = "Check-in date is required.";
    else if (checkIn <= today) errs.checkIn = "Check-in must be after today.";
    if (!checkOutDate) errs.checkOut = "Check-out date is required.";
    else if (checkOut <= checkIn)
      errs.checkOut = "Check-out must be after check-in.";
    if (Object.keys(errs).length) {
      setDateErrors(errs);
      return;
    }
    if (!validateGuests()) {
      toast.error("Please fill all the guest details");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations/update/${bookingData.bookingCode}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyCode: bookingData?.propertyCode,
            checkInDate,
            checkOutDate,
            requestedRooms,
            rooms,
            previousRooms,
            guests: guestForms,
            roomTypeCode: bookingData.roomTypeCode,
            ratePlanCode: bookingData.ratePlanCode,
            amount,
            finalPrice,
            currencyCode: bookingData?.currencyCode,
            bookingUserEmail: bookingData.bookingUserEmail,
            bookingUserPhone: bookingData.bookingUserPhone,
            status: "Modified",
            extraAmountToPay: finalPrice.booking?.finalPayable || 0,
            refundAmount: finalPrice.booking?.refundAmount || 0,
            paymentType: bookingData.paymentType,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Update failed");
      toast.success(
        "Booking updated successfully! Please check your email for details.",
      );
      onUpdate();
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    const guest = guestForms[index];

    if (guest.type === "adult") {
      // Find which room this adult belongs to
      let adultPointer = 0;
      let guestRoom: { roomIdx: number; room: Room } | null = null;
      for (let ri = 0; ri < rooms.length; ri++) {
        for (let ai = 0; ai < rooms[ri].adults; ai++) {
          if (adultPointer === index) {
            guestRoom = { roomIdx: ri, room: rooms[ri] };
            break;
          }
          adultPointer++;
        }
        if (guestRoom) break;
      }

      // If room has children, block deletion — adult required
      if (guestRoom && guestRoom.room.children > 0) {
        toast.error("Cannot remove the adult while children are assigned to this room.");
        return;
      }

      // Last adult overall — block
      if (guestForms.filter((g) => g.type === "adult").length <= 1) {
        toast.error("At least one adult guest is required.");
        return;
      }

      // Room has only this adult (no children) → deleting removes the room
      if (guestRoom && guestRoom.room.adults === 1 && guestRoom.room.children === 0) {
        setDeleteIndex(index);
        setShowDeleteModal(true); // confirmDelete will handle room removal too
        return;
      }
    }

    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const guest = guestForms[deleteIndex];
    let updatedRooms = [...rooms];

    if (guest.type === "adult") {
      // Find which room this adult belongs to
      let adultPointer = 0;
      let targetRoomIdx = -1;
      outer: for (let ri = 0; ri < rooms.length; ri++) {
        for (let ai = 0; ai < rooms[ri].adults; ai++) {
          if (adultPointer === deleteIndex) { targetRoomIdx = ri; break outer; }
          adultPointer++;
        }
      }

      if (targetRoomIdx !== -1 && rooms[targetRoomIdx].adults === 1 && rooms[targetRoomIdx].children === 0) {
        // Remove the entire room
        updatedRooms = rooms.filter((_, i) => i !== targetRoomIdx);
        setRooms(updatedRooms);
        setGuestDistribution(updatedRooms);
        setRequestedRooms(updatedRooms.length);
      } else if (targetRoomIdx !== -1) {
        // Just decrement adults in that room
        updatedRooms = rooms.map((r, i) =>
          i === targetRoomIdx ? { ...r, adults: r.adults - 1 } : r
        );
        setRooms(updatedRooms);
        setGuestDistribution(updatedRooms);
      }
    }

    const updated = guestForms.filter((_, i) => i !== deleteIndex);
    setGuestForms(updated);
    const counts = countGuests(updated);
    setGuestCounts(counts);
    setGuestSummary(
      `${formatNumber(counts.adults)} adult${counts.adults !== 1 ? "s" : ""}${counts.children > 0 ? ` - ${formatNumber(counts.children)} child${counts.children !== 1 ? "ren" : ""}` : ""}`,
    );
    setDeleteIndex(null);
    setShowDeleteModal(false);
    setPriceFetched(false);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];
  const renderTaxBreakdown = () => {
    const taxes = finalPrice.taxBrakeDown || finalPrice.tax || [];
    if (!taxes.length)
      return <p className="text-sm text-gray-500">No taxes applicable</p>;
    return (
      <div className="mt-1 space-y-1">
        {taxes.map((tax: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">🧾 {tax.name}</span>
            <span>
              +{currencies.find((c: Currency) => c.code === (tax.currencyCode || rawCurrencyCode))?.symbol || (tax.currencyCode || rawCurrencyCode)}{" "}
              {formatNumber(tax.taxedAmount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between font-medium border-t pt-1 mt-1">
          <span>Total Tax</span>
          <span>
            {currencySymbol}{" "}
            {formatNumber(finalPrice.taxedAmount || finalPrice.totalTaxAmount)}
          </span>
        </div>
      </div>
    );
  };

  const getPriceBreakdown = () => {
    const dailyBreakdowns =
      finalPrice.dailyPriceBrakeDown || finalPrice.dailyBreakdown || [];
    return {
      baseAmount: finalPrice.amountBeforeTax || 0,
      additionalCharges: finalPrice.additionalGuestCharges || 0,
      numberOfNights:
        new Set(dailyBreakdowns.map((d: any) => d.date)).size || 1,
      totalTax: finalPrice.taxedAmount || 0,
      priceAfterTax: finalPrice.totalAmount || amount,
    };
  };

  // No useMemo needed — just compute directly in render
  const adults = guestForms.filter((g) => g.type === "adult");
  const children = guestForms.filter((g) => g.type === "child");
  const adultIndices = guestForms.reduce<number[]>((acc, g, i) => {
    if (g.type === "adult") acc.push(i);
    return acc;
  }, []);
  const childIndices = guestForms.reduce<number[]>((acc, g, i) => {
    if (g.type === "child") acc.push(i);
    return acc;
  }, []);

  let aIdx = 0;
  let cIdx = 0;
  const roomGuestMap = rooms.map((room, roomIdx) => {
    const roomGuests: { guest: Guest; globalIndex: number }[] = [];
    for (let i = 0; i < room.adults; i++) {
      if (aIdx < adultIndices.length)
        roomGuests.push({
          guest: adults[aIdx],
          globalIndex: adultIndices[aIdx++],
        });
    }
    for (let i = 0; i < room.children; i++) {
      if (cIdx < childIndices.length)
        roomGuests.push({
          guest: children[cIdx],
          globalIndex: childIndices[cIdx++],
        });
    }
    return { roomIdx, room, guests: roomGuests };
  });
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-lg overflow-x-hidden overflow-y-auto">
          <div className="bg-blue-700 text-white p-4">
            <h2 className="text-xl font-bold text-center">{t("ModifyBooking.title")}</h2>
          </div>

          <div>
            <h1 className="px-4 py-2 text-xl font-bold">
              🏨 {bookingData?.hotelName || "Azure Haven Resort"}
            </h1>
          </div>

          <div className="p-4 border-b text-sm text-gray-700 grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">{t("ModifyBooking.stayDates")}</p>
              <p>
                {new Date(checkInDate).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' })} -{" "}
                {new Date(checkOutDate).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                {formatNumber(Math.ceil(
                  (new Date(checkOutDate).getTime() -
                    new Date(checkInDate).getTime()) /
                  86400000,
                ))}{" "}
                {t("ModifyBookingModal.nights")}
              </p>
            </div>
            <div>
              <p className="font-semibold">{t("ModifyBooking.roomDetails")}</p>
              <p>{bookingData.roomName}</p>
              <p className="text-xs text-gray-500">
                {formatNumber(requestedRooms)} {t("ModifyBookingModal.rooms")}
              </p>
            </div>
            <div>
              <p className="font-semibold">{t("ModifyBooking.ratePlan")}</p>
              <p>{bookingData.ratePlanName}</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-blue-50 border-b text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">{t("ModifyBooking.currentGuestDistribution")}</p>
            <div className="flex flex-wrap gap-2">
              {initialRoomDistribution.map((room, i) => (
                <span
                  key={i}
                  className="bg-white border border-blue-200 rounded px-2 py-1"
                >
                  {t("ModifyBookingModal.rooms")} {formatNumber(i + 1)}: {formatNumber(room.adults)} {t("ModifyBookingModal.adult")}
                  {room.children > 0
                    ? `, ${formatNumber(room.children)} ${t("ModifyBookingModal.children")}`
                    : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 py-4">
            <button
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${activeTab === "dates" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveTab("dates")}
            >
              <FaCalendarAlt /> {t("ModifyBooking.tabDates")}
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${activeTab === "guests" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveTab("guests")}
            >
              <FaUser /> {t("ModifyBooking.tabGuests")}
            </button>
          </div>


          <div className="px-6 pb-4">
            {activeTab === "dates" ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">{t("ModifyBooking.checkIn")}</label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={formatDateForInput(today)}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setDateErrors((p) => ({ ...p, checkIn: undefined }));
                        setPriceFetched(false);
                      }}
                      disabled={isCheckInPassed}
                      className={`w-full border px-3 py-2 rounded ${dateErrors.checkIn ? "border-red-500" : ""} ${isCheckInPassed ? "bg-gray-100" : ""}`}
                    />
                    {dateErrors.checkIn && (
                      <p className="text-sm text-red-600 mt-1">
                        {dateErrors.checkIn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">{t("ModifyBooking.checkOut")}</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={formatDateForInput(tomorrow)}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setDateErrors((p) => ({ ...p, checkOut: undefined }));
                        setPriceFetched(false);
                      }}
                      disabled={isCheckInPassed}
                      className={`w-full border px-3 py-2 rounded ${dateErrors.checkOut ? "border-red-500" : ""} ${isCheckInPassed ? "bg-gray-100" : ""}`}
                    />
                    {dateErrors.checkOut && (
                      <p className="text-sm text-red-600 mt-1">
                        {dateErrors.checkOut}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <button
                    onClick={fetchUpdatedPrice}
                    disabled={priceLoading || !checkInDate || !checkOutDate || isCheckInPassed}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {priceLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>{t("ModifyBooking.fetchingPrice")}</span></> : <><RefreshCw className="h-4 w-4" /><span>{t("ModifyBooking.checkUpdatedPrice")}</span></>}
                  </button>
                  
                </div>
              </div>
            ) : (
              <>
                <button
                  className="w-full text-white font-bold border px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                  onClick={() => setShowGuestSelector(true)}
                  disabled={isCheckInPassed}
                >
                  <span className="flex gap-2 items-center justify-center">
                    <Plus /> {guestSummary === "Add Guests" ? t("ModifyBooking.addGuests") : guestSummary}
                  </span>
                </button>

                

                <div className="mt-4 space-y-2 border p-4 rounded bg-gray-50">
                  {guestForms.map((guest, index) => {
                    const gErr = errors[`guest-${index}`] || {};
                    const typeCount = guestForms.slice(0, index + 1).filter((g) => g.type === guest.type).length;
                    return (
                      <div key={index} className="bg-white relative border border-gray-300 p-4 rounded shadow-sm">
                        {!(index === 0 && guest.type === "adult") && (
                          <button
                            onClick={() => handleDeleteClick(index)}
                            disabled={isCheckInPassed}
                            className="absolute top-4 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-800">
                            {guest.type === "adult" ? `${t("ModifyBooking.adult")} ${formatNumber(typeCount)}` : `${t("ModifyBooking.child")} ${formatNumber(typeCount)}`}
                          </p>
                          {index === 0 && guest.type === "adult" ? (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              {t("ModifyBooking.primary")}
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-400 border border-gray-300 px-2 py-0.5 rounded-full">
                              {t("ModifyBooking.optional")}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">{t("ModifyBooking.firstName")}</label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={guest.firstName}
                              onChange={(e) => handleGuestDetailChange(index, "firstName", e.target.value)}
                              disabled={isCheckInPassed}
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${gErr.firstName ? "border-red-500" : "border-gray-300"} ${isCheckInPassed ? "bg-gray-100" : ""}`}
                            />
                            {gErr.firstName && <p className="text-sm text-red-600 mt-1">{gErr.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">{t("ModifyBooking.lastName")}</label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={guest.lastName}
                              onChange={(e) => handleGuestDetailChange(index, "lastName", e.target.value)}
                              disabled={isCheckInPassed}
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${gErr.lastName ? "border-red-500" : "border-gray-300"} ${isCheckInPassed ? "bg-gray-100" : ""}`}
                            />
                            {gErr.lastName && <p className="text-sm text-red-600 mt-1">{gErr.lastName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">{t("ModifyBooking.dateOfBirth")}</label>
                            <input
                              type="date"
                              value={guest.dob}
                              onChange={(e) => handleGuestDetailChange(index, "dob", e.target.value)}
                              disabled={isCheckInPassed}
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 border-gray-300 ${isCheckInPassed ? "bg-gray-100" : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t mt-4">
                  <button
                    onClick={fetchUpdatedPrice}
                    disabled={priceLoading || isCheckInPassed}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {priceLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Fetching Price...</span></> : <><RefreshCw className="h-4 w-4" /><span>{t("ModifyBooking.checkUpdatedPrice")}</span></>}
                  </button>
                
                </div>
              </>
            )}
          </div>
          {/* Price section */}
          <div className="px-6 pb-4 text-gray-700 text-sm space-y-2 relative">
            {bookingData?.paymentMethod === "pay_at_hotel" ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-yellow-800 font-semibold">{t("ModifyBooking.chargedAtHotel")}</p>
                    <p className="text-lg text-blue-700 font-bold">{currencySymbol} {formatNumber(amount)}</p>
                  </div>
                  {priceFetched && (
                    <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-yellow-600 hover:text-yellow-800">
                      <FaInfoCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {showBreakdown && priceFetched && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-800 mb-2">{t("ModifyBooking.priceBreakdown")}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Rate ({formatNumber(getPriceBreakdown().numberOfNights)} night{getPriceBreakdown().numberOfNights > 1 ? "s" : ""})</span>
                        <span>{currencySymbol} {formatNumber(getPriceBreakdown().baseAmount)}</span>
                      </div>
                      {getPriceBreakdown().additionalCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("ModifyBooking.additionalGuestCharges")}</span>
                          <span>{currencySymbol} {formatNumber(getPriceBreakdown().additionalCharges)}</span>
                        </div>
                      )}
                      {/* Addon Breakdown */}
                      {(() => {
                        const addons = finalPrice.addonBrakeDown || [];
                        if (!addons.length) return null;

                        const grouped = addons.reduce((acc: any, addon: any) => {
                          if (!acc[addon.name]) acc[addon.name] = { ...addon, totalAmount: 0 };
                          acc[addon.name].totalAmount += addon.totalAmount;
                          return acc;
                        }, {});

                        const selectedAddons = Object.values(grouped).filter((a: any) => a.type === 'selected' && a.totalAmount > 0);
                        const includedAddons = Object.values(grouped).filter((a: any) => a.type === 'included');
                        
                        return (
                          <>
                            {selectedAddons.map((addon: any, i: number) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-gray-600">🍽 {addon.name}
                                  <span className="text-xs text-blue-400 ml-1">(Selected)</span>
                                </span>
                                <span>+{currencySymbol} {formatNumber(addon.totalAmount)}</span>
                              </div>
                            ))}
                            {includedAddons.map((addon: any, i: number) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-gray-600">✅ {addon.name}
                                  <span className="text-xs text-green-500 ml-1">(Complimentary)</span>
                                </span>
                                <span className="text-green-600">Included</span>
                              </div>
                            ))}
                            {finalPrice.totalAddonAmount > 0 && (
                              <div className="flex justify-between text-gray-700 font-medium border-t pt-1">
                                <span>Total Add-ons</span>
                                <span>+{currencySymbol} {formatNumber(finalPrice.totalAddonAmount)}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {finalPrice.promotionBrakeDown?.length > 0 && finalPrice.promotionBrakeDown.map((promo: any, i: number) => {
                        const isPayLater = promo.restrictionType === "payLater";
                        return (
                          <div key={i} className="flex justify-between">
                            <span className={isPayLater ? "text-orange-600" : "text-green-600"}>
                              {isPayLater ? "⏳" : "🏷"} {promo.name}
                              <span className="text-xs text-gray-400 ml-1">({promo.discountType === "percentage" ? `${formatNumber(promo.discountValue)}%` : `${currencies.find((c: Currency) => c.code === (promo.currencyCode || rawCurrencyCode))?.symbol || (promo.currencyCode || rawCurrencyCode)} ${formatNumber(promo.discountValue)}`})</span>
                            </span>
                            <span className={isPayLater ? "text-orange-600" : "text-green-600"}>{isPayLater ? "+" : "-"}{currencySymbol} {formatNumber(promo.discountAmount)}</span>
                          </div>
                        );
                      })}
                      {renderTaxBreakdown()}
                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-blue-700">{currencySymbol} {formatNumber(getPriceBreakdown().priceAfterTax)}</span>
                      </div>
                      {finalPrice.latterpayableAmount > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>⏳ Pay Later at Hotel</span>
                          <span>{currencySymbol} {formatNumber(finalPrice.latterpayableAmount)}</span>
                        </div>
                      )}
                      {finalPrice.currentChargeableAmount > 0 && (
                        <div className="flex justify-between font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded mt-1">
                          <span>Amount Due Now</span>
                          <span>{currencySymbol} {formatNumber(finalPrice.currentChargeableAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <p className="text-sm text-gray-600">{t("ModifyBooking.originalPrice")}</p>
                        <p className="text-lg font-semibold">{currencySymbol} {bookingData.amount ? formatNumber(bookingData.amount) : formatNumber(0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("ModifyBooking.updatedPrice")}</p>
                        <p className={`text-lg font-bold ${priceFetched ? "text-blue-700" : "text-gray-800"}`}>{currencySymbol} {formatNumber(amount)}</p>
                      </div>
                    </div>
                    {priceFetched && (
                      <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-gray-500 hover:text-blue-600 ml-2">
                        <FaInfoCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {showBreakdown && priceFetched && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">{t("ModifyBooking.priceBreakdown")}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("ModifyBooking.baseRate")} ({formatNumber((finalPrice.dailyPriceBrakeDown || finalPrice.dailyBreakdown || []).length)} nights)</span>
                          <span>{currencySymbol} {formatNumber(finalPrice.amountBeforeTax)}</span>
                        </div>
                        {finalPrice.promotionBrakeDown?.length > 0 && finalPrice.promotionBrakeDown.map((promo: any, i: number) => {
                          const isDiscount = promo.restrictionType === "decrease"; // ✅ add this
                          const isPayLater = promo.restrictionType === "payLater";
                          return (
                            <div
                              key={i}
                              className={`flex justify-between pl-4 ${isDiscount ? "text-green-600" : isPayLater ? "text-amber-600" : "text-red-500"}`}
                            >
                              <span>
                                {isDiscount ? "🏷" : isPayLater ? "⏳" : "+"}{" "}
                                {promo.name}
                                <span className="text-xs text-gray-400 ml-1">
                                  ({promo.discountType === "percentage"
                                    ? `${formatNumber(promo.discountValue)}%`
                                    : `${currencies.find((c: Currency) => c.code === (promo.currencyCode || rawCurrencyCode))?.symbol || (promo.currencyCode || rawCurrencyCode)} ${formatNumber(promo.discountValue)}`}
                                  )
                                </span>
                              </span>
                              <span>
                                {isDiscount ? "-" : "+"}
                                {currencies.find((c: Currency) => c.code === (promo.currencyCode || rawCurrencyCode))?.symbol || (promo.currencyCode || rawCurrencyCode)}{" "}
                                {formatNumber(promo.discountAmount ?? 0)}
                              </span>
                            </div>
                          );
                        })}
                        {finalPrice.taxBrakeDown?.map((tax: any, i: number) => (
                          <div key={i} className="flex justify-between text-gray-600">
                            <span>🧾 {tax.name}</span>
                            <span>+{tax.currencyCode} {formatNumber(tax.taxedAmount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-gray-600">
                          <span>{t("ModifyBooking.totalTax")}</span>
                          <span>{currencySymbol} {formatNumber(finalPrice.taxedAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                          <span>{t("ModifyBooking.total")}</span>
                          <span className="text-blue-700">{currencySymbol} {formatNumber(finalPrice.totalAmount)}</span>
                        </div>
                        {finalPrice.latterpayableAmount > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>{t("ModifyBooking.payLaterAtHotel")}</span>
                            <span>{currencySymbol} {formatNumber(finalPrice.latterpayableAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded mt-1">
                          <span>{t("ModifyBooking.amountDueNow")}</span>
                          <span>{currencySymbol} {formatNumber(finalPrice.currentChargeableAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t("ModifyBooking.alreadyPaid")}:</span>
                        <span className="text-green-600 font-medium">{currencySymbol} {bookingData?.paidAmount ? formatNumber(bookingData.paidAmount) : formatNumber(0)}</span>
                      </div>
                      {finalPrice.booking?.discount > 0 && (
                        <div className="flex justify-between">
                          <span>{t("ModifyBooking.discountApplied")}:</span>
                          <span className="text-red-600 font-medium">- {currencySymbol} {formatNumber(finalPrice.booking.discount)}</span>
                        </div>
                      )}
                      {priceFetched && finalPrice.booking?.finalPayable > 0 && (
                        <div className="flex justify-between bg-red-50 p-2 rounded">
                          <span className="text-red-700 font-semibold">{t("ModifyBooking.toPayAtHotel")}:</span>
                          <span className="text-red-700 font-bold">{currencySymbol} {formatNumber(finalPrice.booking.finalPayable)}</span>
                        </div>
                      )}
                      {priceFetched && finalPrice.booking?.refundAmount > 0 && (
                        <div className="flex justify-between bg-green-50 p-2 rounded">
                          <span className="text-green-700 font-semibold">{t("ModifyBooking.toBeRefunded")}:</span>
                          <span className="text-green-700 font-bold">{currencySymbol} {formatNumber(finalPrice.booking.refundAmount)}</span>
                        </div>
                      )}
                      {!priceFetched && !priceFetchError && (
                        <div className="text-center py-2">
                          <p className="text-gray-600 italic">{t("ModifyBooking.checkPriceHint")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {priceFetchError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <p className="text-red-700 font-semibold">{t("ModifyBooking.priceError")}</p>
                    <p className="text-red-600 text-sm">{t("ModifyBooking.priceErrorMsg")}</p>
                  </div>
                )}
              </>
            )}

            <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 space-y-1 mt-2">
              <p>• {t("ModifyBooking.policyNotes.availability")}</p>
              <p>• {t("ModifyBooking.policyNotes.fees")}</p>
              <p>• {t("ModifyBooking.policyNotes.upgrades")}</p>
              <p>• {t("ModifyBooking.policyNotes.cancellation")}</p>
            </div>
          </div>

          <div className="flex gap-4 px-6 pb-6">
            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:bg-gray-400"
              onClick={handleUpdate}
              disabled={priceFetchError || !priceFetched || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("ModifyBooking.updating")}</span>
                </div>
              ) : (
                t("ModifyBooking.confirmUpdate")
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("ModifyBooking.deleteTitle")}</h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteIndex(null); setShowDeleteModal(false); }} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">{t("ModifyBooking.cancel")}</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">{t("ModifyBooking.delete")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Guest selector */}
      <ModifyGuestSelector
        isOpen={showGuestSelector}
        initialRooms={requestedRooms}
        initialAdults={guestCounts.adults}
        initialChildren={guestCounts.children}
        initialChildAges={childAges}
        initialRoomDistribution={initialRoomDistribution}
        isModificationDisabled={isCheckInPassed}
        onClose={() => setShowGuestSelector(false)}
        onApply={(summary, data) => {
          setGuestSummary(summary);
          setRequestedRooms(data.rooms);
          setRooms(data.roomDistribution);
          setGuestDistribution(data.roomDistribution);
          setChildAges(data.childAges);

          const currentGuests = [...guestForms];
          const updatedGuests: Guest[] = [];
          const existingAdults = currentGuests.filter(
            (g) => g.type === "adult",
          );
          const existingChildren = currentGuests.filter(
            (g) => g.type === "child",
          );

          for (let i = 0; i < data.adults; i++) {
            updatedGuests.push({
              type: "adult",
              firstName: existingAdults[i]?.firstName || "",
              lastName: existingAdults[i]?.lastName || "",
              dob: existingAdults[i]?.dob || "",
            });
          }
          for (let i = 0; i < data.children; i++) {
            updatedGuests.push({
              type: "child",
              firstName: existingChildren[i]?.firstName || "",
              lastName: existingChildren[i]?.lastName || "",
              dob: existingChildren[i]?.dob || "",
              age: data.childAges[i] || 0,
            });
          }

          setGuestForms(updatedGuests);
          setGuestCounts({ adults: data.adults, children: data.children });
          setShowGuestSelector(false);
          setPriceFetched(false);
        }}
      />
    </>
  );
};

export default ModifyBookingModal;
