import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModifyGuestSelector from "./ModifyGuestSelector";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { isBefore } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";

// types/Guest.ts
export interface Guest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dob: string;
}

interface Room {
  adults: number;
  children: number;
  childAges: number[];
}

interface BookingData {
  booking_code: string;
  property_code: string;
  checkInDate: string;
  checkOutDate: string;
  room_type_code: string;
  rate_plan_code: string;
  amount: number;
  guests: Guest[];
  booking_user_email: string;
  booking_user_phone: string;
  finalPrice: { requestedRooms: number; totalAmount: number };
  rooms?: Room[];
  currencyCode?: string;
  property?: { name: string; property_code: string };
  [key: string]: any;
  paymentType?: string;
}

interface Props {
  bookingData: BookingData;
  onClose: () => void;
  onUpdate: () => void;
}

const ModifyBookingModal: FC<Props> = ({ bookingData, onClose, onUpdate }) => {
  const normalizeGuests = (guests: any[]): Guest[] => {
    return guests.map((guest) => ({
      type: guest.type || "adult",
      firstName: guest.firstName  || "",
      lastName: guest.lastName  || "",
      dob:
        typeof guest.dob === "string"
          ? guest.dob.split("T")[0]
          : typeof guest.dob === "object" && guest.dob?.$date
          ? guest.dob.$date.split("T")[0]
          : typeof guest.dob === "string"
          ? guest.dob.split("T")[0]
          : guest.dob || "",
    }));
  };

  const countGuests = (guests: Guest[]) => {
    let adults = 0;
    let children = 0;
    guests.forEach((guest) => {
      if (guest.type === "adult") adults++;
      else if (guest.type === "child") children++;
    });
    return { adults, children };
  };

  const [activeTab, setActiveTab] = useState<"dates" | "guests">("dates");
  const parseDate = (date: any): string => {
    if (typeof date === "string") return date.split("T")[0];
    if (date && typeof date === "object" && "$date" in date)
      return date.$date.split("T")[0];
    return "";
  };

  const [checkInDate, setCheckInDate] = useState(
    parseDate(bookingData.checkInDate)
  );
  const [checkOutDate, setCheckOutDate] = useState(
    parseDate(bookingData.checkOutDate)
  );
  const [requestedRooms, setRequestedRooms] = useState(
    bookingData.finalprice?.requestedRooms || 1
  );
  const [previousRooms, setPreviousRooms] = useState(
    bookingData.finalprice?.requestedRooms || 1
  );
  // console.log("previous room", previousRooms);
  // Ensure rooms state has children count and childAges properly set from bookingData.rooms
  const initializeRooms = (roomsData: Room[] | undefined): Room[] => {
    if (!roomsData || roomsData.length === 0) {
      return [{ adults: 1, children: 0, childAges: [] }];
    }
    return roomsData.map((room) => ({
      adults: room.adults || 1,
      children: room.children || 0,
      childAges: room.childAges || Array(room.children || 0).fill(0),
    }));
  };

  const [rooms, setRooms] = useState<Room[]>(
    initializeRooms(bookingData.rooms)
  );
  const [guestSummary, setGuestSummary] = useState("Add Guests");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [amount, setAmount] = useState(bookingData.amount);
  const [loading, setLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState<any>(
    bookingData.finalPrice || {}
  );
  const [dateErrors, setDateErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
  }>({});
  const [guests, setGuests] = useState<Guest[]>(
    normalizeGuests(bookingData.guests)
  );
  const [guestForms, setGuestForms] = useState<Guest[]>(
    normalizeGuests(bookingData.guests)
  );
  const [errors, setErrors] = useState<any>({});
  const [guestCounts, setGuestCounts] = useState<{
    adults: number;
    children: number;
  }>(countGuests(normalizeGuests(bookingData.guests)));
  const [priceFetchError, setPriceFetchError] = useState(false);
  // console.log(bookingData);
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    const checkIn = new Date(checkInDate);

    if (checkIn > today) {
      fetchUpdatedPrice();
    }
  }, [checkInDate, checkOutDate, rooms, guestCounts, requestedRooms]);

  // console.log("booked datas ", bookingData);
  const fetchUpdatedPrice = async () => {
    try {
      setPriceFetchError(false);

      let noOfAdults = 0;
      let noOfChildrens = 0;
      guestForms.forEach((guest) => {
        if (guest.type === "adult") noOfAdults++;
        else if (guest.type === "child") noOfChildrens++;
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/price/get-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyCode: bookingData.propertyCode,
            invTypeCode: bookingData.roomTypeCode,
            startDate: checkInDate,
            endDate: checkOutDate,
            noOfAdults,
            previousRooms,
            noOfChildrens,
            noOfRooms: requestedRooms,
            ratePlanCode: bookingData.ratePlanCode,
            bookingCode: bookingData.bookingCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setPriceFetchError(true); // ✅ Important line
        toast.error(data.message || "Failed to fetch updated price");
        return; // Prevent further execution
      }
      // console.log("data", data);

      // ✅ On success
      const updatedAmount = Number(data?.data?.totalAmount);
      // console.log("data", data);
      setFinalPrice(data.data);
      setAmount(updatedAmount);
    } catch (error: unknown) {
      setPriceFetchError(true);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      toast.error(errorMessage);
    }
  };

  const validateGuests = (): boolean => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    let valid = true;
    const today = new Date();

    guestForms.forEach((guest, index) => {
      const gErrors: any = {};

      // First Name
      if (!guest.firstName.trim()) {
        gErrors.firstName = "First name is required.";
        valid = false;
      } else if (!nameRegex.test(guest.firstName)) {
        gErrors.firstName = "Invalid Name Format";
        valid = false;
      }

      // Last Name
      if (!guest.lastName.trim()) {
        gErrors.lastName = "Last name is required.";
        valid = false;
      } else if (!nameRegex.test(guest.lastName)) {
        gErrors.lastName = "Invalid Name Format";
        valid = false;
      }
      if (Object.keys(gErrors).length > 0) {
        newErrors[`guest-${index}`] = gErrors;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleGuestDetailChange = (
    index: number,
    field: keyof Guest,
    value: string
  ) => {
    const updatedGuests = [...guestForms];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuestForms(updatedGuests);
  };

  const handleUpdate = async () => {
    if (priceFetchError) {
      toast.error(
        "Cannot update booking due to pricing error. Please fix and retry."
      );
      return;
    }
    const errors: { checkIn?: string; checkOut?: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!checkInDate) errors.checkIn = "Check-in date is required.";
    else if (checkIn <= today) errors.checkIn = "Check-in must be after today.";

    if (!checkOutDate) errors.checkOut = "Check-out date is required.";
    else if (checkOut <= checkIn)
      errors.checkOut = "Check-out must be after check-in.";

    if (Object.keys(errors).length > 0) {
      setDateErrors(errors);
      return;
    }

    if (!validateGuests()) {
      toast.error("Please fill all the guest details");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/update/${bookingData.bookingCode}`,
        {
          method: "PUT",
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
            extraAmountToPay: finalPrice.booking.finalPayable,
            refundAmount: finalPrice.booking.refundamount,
            paymentType: bookingData.paymentType,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Update failed");
      toast.success(
        "Booking updated successfully! please check your Email for Details "
      );
      onUpdate();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format dates to yyyy-mm-dd for <input type="date">
  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];
  const handleDeleteClick = (index: number) => {
    const guestToDelete = guestForms[index];

    if (guestToDelete.type === "adult") {
      const adultCount = guestForms.filter((g) => g.type === "adult").length;

      if (adultCount <= 1) {
        // Cannot delete the last adult
        toast.error("At least one guest is required.");
        return;
      }
    }

    // Only show modal if deletion is allowed
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedGuests = guestForms.filter((_, i) => i !== deleteIndex);
      setGuestForms(updatedGuests); // updates the main form

      // ✅ Update guestCounts for the selector
      const adultsCount = updatedGuests.filter(
        (g) => g.type === "adult"
      ).length;
      const childrenCount = updatedGuests.filter(
        (g) => g.type === "child"
      ).length;
      setGuestCounts({ adults: adultsCount, children: childrenCount });

      // Optionally update summary
      setGuestSummary(
        `${adultsCount} adult${adultsCount !== 1 ? "s" : ""}${
          childrenCount > 0
            ? ` - ${childrenCount} child${childrenCount !== 1 ? "ren" : ""}`
            : ""
        }`
      );

      setDeleteIndex(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteModal(false);
  };
  // console.log("final Price", finalPrice);
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-lg overflow-x-hidden overflow-y-auto">
          <div className="bg-blue-700 text-white p-4">
            <h2 className="text-xl font-bold text-center">
              Modify Your Booking
            </h2>
          </div>
          <div>
            <h1 className=" px-4 py-2 text-xl font-bold">
              🏨 {bookingData?.hotelName || "Azure Haven Resort"}
            </h1>
          </div>
          <div className="p-4 border-b text-sm text-gray-700 grid   md:grid-cols-[40%_30%_30%] gap-4">
            <div>
              <p className="font-semibold">Stay Dates</p>
              <p>
                {new Date(checkInDate).toDateString()} -{" "}
                {new Date(checkOutDate).toDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {Math.ceil(
                  (new Date(checkOutDate).getTime() -
                    new Date(checkInDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                nights
              </p>
            </div>
            <div>
              <p className="font-semibold">Room Details</p>
              <p>{bookingData.roomTypeCode}</p>
            </div>
            <div>
              <p className="font-semibold">Rate Plan</p>
              <p>{bookingData.ratePlanCode}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 py-4">
            <button
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${
                activeTab === "dates"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("dates")}
            >
              <FaCalendarAlt /> Dates
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${
                activeTab === "guests"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("guests")}
            >
              <FaUser /> Guests
            </button>
          </div>

          <div className="px-6 pb-4">
            {activeTab === "dates" ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={formatDateForInput(today)}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setDateErrors((prev) => ({
                          ...prev,
                          checkIn: undefined,
                        }));
                      }}
                      disabled={isBefore(new Date(checkInDate), new Date())}
                      className={`w-full border px-3 py-2 rounded ${
                        dateErrors.checkIn ? "border-red-500" : ""
                      }`}
                    />
                    {dateErrors.checkIn && (
                      <p className="text-sm text-red-600 mt-1">
                        {dateErrors.checkIn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={formatDateForInput(tomorrow)}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setDateErrors((prev) => ({
                          ...prev,
                          checkOut: undefined,
                        }));
                      }}
                      className={`w-full border px-3 py-2 rounded ${
                        dateErrors.checkOut ? "border-red-500" : ""
                      }`}
                    />
                    {dateErrors.checkOut && (
                      <p className="text-sm text-red-600 mt-1">
                        {dateErrors.checkOut}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Stay duration:{" "}
                  <strong>
                    {Math.ceil(
                      (new Date(checkOutDate).getTime() -
                        new Date(checkInDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    night(s)
                  </strong>
                </p>
              </div>
            ) : (
              <>
                <button
                  className="  w-full text-white font-bold   border px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowGuestSelector(true)}
                >
                  <span className="flex gap-2 items-center justify-center">
                    {" "}
                    <Plus /> {guestSummary}
                  </span>{" "}
                </button>
                <div className="mt-4 space-y-2 overflow-y-auto border p-4 rounded bg-gray-50">
                  {guestForms.map((guest, index) => {
                    const gErr = errors[`guest-${index}`] || {};
                    // Calculate the count of this type up to this index for correct numbering
                    const typeCount = guestForms
                      .slice(0, index + 1)
                      .filter((g) => g.type === guest.type).length;
                    return (
                      <div
                        key={index}
                        className="bg-white  relative border border-gray-300 p-4 rounded shadow-sm"
                      >
                        <button
                          onClick={() => handleDeleteClick(index)}
                          className=" absolute top-4 right-3 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />{" "}
                        </button>
                        <p className="font-medium text-gray-800 mb-2">
                          {guest.type === "adult"
                            ? `Adult ${typeCount}`
                            : `Child ${typeCount}`}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={guest.firstName}
                              onChange={(e) =>
                                handleGuestDetailChange(
                                  index,
                                  "firstName",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${
                                gErr.firstName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {gErr.firstName && (
                              <p className="text-sm text-red-600 mt-1">
                                {gErr.firstName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={guest.lastName}
                              onChange={(e) =>
                                handleGuestDetailChange(
                                  index,
                                  "lastName",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${
                                gErr.lastName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {gErr.lastName && (
                              <p className="text-sm text-red-600 mt-1">
                                {gErr.lastName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              min={
                                guest.type === "adult"
                                  ? new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() - 100
                                      )
                                    )
                                      .toISOString()
                                      .split("T")[0]
                                  : new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() - 18
                                      )
                                    )
                                      .toISOString()
                                      .split("T")[0]
                              }
                              max={
                                guest.type === "adult"
                                  ? new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() - 18
                                      )
                                    )
                                      .toISOString()
                                      .split("T")[0]
                                  : new Date().toISOString().split("T")[0]
                              }
                              value={guest.dob}
                              onChange={(e) =>
                                handleGuestDetailChange(
                                  index,
                                  "dob",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${
                                gErr.dob ? "border-red-500" : "border-gray-300"
                              }`}
                            />
                            {gErr.dob && (
                              <p className="text-sm text-red-600 mt-1">
                                {gErr.dob}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {showDeleteModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Do you really want to delete this guest?
                      </h2>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-6 pb-4 text-gray-700 text-sm space-y-2">
            {/* Pay at Hotel Message */}
            {bookingData?.paymentType === "payAtHotel" ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-yellow-800 font-semibold">
                  You will be charged at the hotel:
                </p>
                <p className="text-lg text-blue-700 font-bold">
                  INR {amount.toLocaleString()}
                </p>
              </div>
            ) : (
              <>
                {/* Total & Paid Amount */}
                <div>
                  <p className="font-semibold">
                    Estimated Total:{" "}
                    <span className="text-blue-700 font-bold">
                      INR {amount.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Paid Amount:{" "}
                    <span className="text-green-700 font-medium">
                      INR {bookingData?.paidamount?.toLocaleString()}
                    </span>
                  </p>
                  {bookingData.isused && (
                    <div className="mt-2">
                      <p className="text-purple-700 font-medium">
                        Promo Code Used: {bookingData.promocode}
                      </p>
                      <p className="text-red-600 font-medium">
                        Discount Amount: - INR{" "}
                        {finalPrice.booking?.discount?.toLocaleString()}
                      </p>
                    </div>
                  )}
              
                </div>

                {/* Price Difference Message */}
                {finalPrice.booking?.finalPayable > 0 && (
                  <p className="text-red-600">
                    You will be charged{" "}
                    <strong>
                      INR {finalPrice.booking?.finalPayable.toLocaleString()}
                    </strong>{" "}
                    extra at the hotel.
                  </p>
                )}
                {finalPrice.booking?.refundAmount > 0 && (
                  <p className="text-green-600">
                    You will be refunded{" "}
                    <strong>
                      INR {finalPrice.booking.refundamount.toLocaleString()}
                    </strong>{" "}
                    at the hotel.
                  </p>
                )}
              </>
            )}

            {/* Booking Policy Notes */}
            <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 space-y-1 mt-2">
              <p>• Date changes are subject to availability</p>
              <p>
                • Changes within 72 hours of check-in may incur additional fees
              </p>
              <p>
                • Room upgrades are subject to availability and additional
                charges
              </p>
              <p>
                • Reducing the length of stay may be subject to the original
                booking’s cancellation policy
              </p>
            </div>
          </div>

          <div className="flex gap-4 px-6 pb-6">
            <button
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:bg-gray-400"
              onClick={handleUpdate}
              disabled={
                priceFetchError ||
                isBefore(new Date(checkInDate), new Date()) ||
                loading
              }
            >
              {loading ? (
                <div className="flex  items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Confirm Update"
              )}
            </button>
          </div>
        </div>
      </div>

      <ModifyGuestSelector
        isOpen={showGuestSelector}
        initialRooms={requestedRooms}
        initialAdults={guestCounts.adults}
        initialChildren={guestCounts.children}
        onClose={() => setShowGuestSelector(false)}
        onApply={(summary, data) => {
          setGuestSummary(summary);

          // Update rooms state (no more childAges)
          setRooms([
            {
              adults: data.adults,
              children: data.children,
              childAges: [], // Optionally: remove this line if childAges is no longer needed in your `rooms` state
            },
          ]);

          setGuests((prevGuests) => {
            const adults = prevGuests.filter((g) => g.type === "adult");
            const children = prevGuests.filter((g) => g.type === "child");
            const newAdults = adults.slice(0, data.adults);
            const newChildren = children.slice(0, data.children);
            const newGuests = [...newAdults, ...newChildren];

            while (newGuests.length < data.adults + data.children) {
              if (newAdults.length < data.adults) {
                newGuests.push({
                  type: "adult",
                  firstName: "",
                  lastName: "",
                  dob: "",
                });
              } else if (newChildren.length < data.children) {
                newGuests.push({
                  type: "child",
                  firstName: "",
                  lastName: "",
                  dob: "",
                });
              }
            }

            return newGuests;
          });

          setGuestForms((prevGuestForms) => {
            const adults = prevGuestForms.filter((g) => g.type === "adult");
            const children = prevGuestForms.filter((g) => g.type === "child");
            const newAdults = adults.slice(0, data.adults);
            const newChildren = children.slice(0, data.children);
            const newGuestForms = [...newAdults, ...newChildren];

            while (newGuestForms.length < data.adults + data.children) {
              const currentAdultsCount = newGuestForms.filter(
                (g) => g.type === "adult"
              ).length;
              const currentChildrenCount = newGuestForms.filter(
                (g) => g.type === "child"
              ).length;

              if (currentAdultsCount < data.adults) {
                newGuestForms.push({
                  type: "adult",
                  firstName: "",
                  lastName: "",
                  dob: "",
                });
              } else if (currentChildrenCount < data.children) {
                newGuestForms.push({
                  type: "child",
                  firstName: "",
                  lastName: "",
                  dob: "",
                });
              }
            }

            return newGuestForms;
          });

          setGuestCounts({ adults: data.adults, children: data.children });
          setRequestedRooms(data.rooms);
          setShowGuestSelector(false);
          fetchUpdatedPrice();
        }}
      />
    </>
  );
};

export default ModifyBookingModal;
