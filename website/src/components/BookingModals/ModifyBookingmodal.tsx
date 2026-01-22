import { FC, useState } from "react";
import ModifyGuestSelector from "./ModifyGuestSelector";
import { FaCalendarAlt, FaUser, FaInfoCircle } from "react-icons/fa";
import { isBefore } from "date-fns";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

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

interface Props {
  bookingData: any;
  onClose: () => void;
  onUpdate: () => void;
}

const ModifyBookingModal: FC<Props> = ({ bookingData, onClose, onUpdate }) => {
  const normalizeGuests = (guests: any[]): Guest[] => {
    return guests.map((guest) => ({
      type: guest.type || "adult",
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      dob:
        typeof guest.dob === "string"
          ? guest.dob.split("T")[0]
          : typeof guest.dob === "object" && guest.dob?.$date
          ? guest.dob.$date.split("T")[0]
          : "",
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
  const [priceLoading, setPriceLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const [finalPrice, setFinalPrice] = useState<any>({
    booking: {
      finalPayable: 0,
      refundAmount: 0,
      discount: 0
    },
    totalAmount: bookingData.amount,
    breakdown: {
      totalBaseAmount: 0,
      totalAdditionalCharges: 0,
      totalAmount: 0,
      totalTax: 0,
      priceAfterTax: 0
    },
    tax: []
  });
  
  const [dateErrors, setDateErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
  }>({});
  
  const [guestForms, setGuestForms] = useState<Guest[]>(
    normalizeGuests(bookingData.guests)
  );
  
  const [errors, setErrors] = useState<any>({});
  const [guestCounts, setGuestCounts] = useState<{
    adults: number;
    children: number;
  }>(countGuests(normalizeGuests(bookingData.guests)));
  
  const [priceFetched, setPriceFetched] = useState(false);
  const [priceFetchError, setPriceFetchError] = useState(false);

  const fetchUpdatedPrice = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both check-in and check-out dates");
      return;
    }

    try {
      setPriceLoading(true);
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
        setPriceFetchError(true);
        toast.error(data.message || "Failed to fetch updated price");
        return;
      }

      const updatedAmount = Number(data?.data?.totalAmount);
      const paidAmount = bookingData?.paidamount || 0;
      const priceDifference = updatedAmount - paidAmount;
      
      setFinalPrice({
        ...data.data,
        booking: {
          finalPayable: priceDifference > 0 ? priceDifference : 0,
          refundAmount: priceDifference < 0 ? Math.abs(priceDifference) : 0,
          discount: data.data.discount || 0
        }
      });
      
      setAmount(updatedAmount);
      setPriceFetched(true);
      toast.success("Price updated successfully!");
      
    } catch (error: unknown) {
      setPriceFetchError(true);
      toast.error("Failed to fetch updated price. Please try again.");
    } finally {
      setPriceLoading(false);
    }
  };

  const validateGuests = (): boolean => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    let valid = true;

    guestForms.forEach((guest, index) => {
      const gErrors: any = {};

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
    setPriceFetched(false);
  };

  const handleUpdate = async () => {
    if (priceFetchError) {
      toast.error("Cannot update booking due to pricing error. Please fetch the latest price first.");
      return;
    }
    
    if (!priceFetched) {
      toast.error("Please fetch the updated price before confirming.");
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
    else if (checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/front-office/reservations/update/${bookingData.bookingCode}`,
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
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Update failed");
      toast.success("Booking updated successfully! Please check your email for details.");
      onUpdate();
      onClose();
    } catch (err: unknown) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];
  
  const handleDeleteClick = (index: number) => {
    const guestToDelete = guestForms[index];

    if (guestToDelete.type === "adult") {
      const adultCount = guestForms.filter((g) => g.type === "adult").length;
      if (adultCount <= 1) {
        toast.error("At least one guest is required.");
        return;
      }
    }

    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedGuests = guestForms.filter((_, i) => i !== deleteIndex);
      setGuestForms(updatedGuests);
      
      const adultsCount = updatedGuests.filter((g) => g.type === "adult").length;
      const childrenCount = updatedGuests.filter((g) => g.type === "child").length;
      setGuestCounts({ adults: adultsCount, children: childrenCount });
      
      setGuestSummary(
        `${adultsCount} adult${adultsCount !== 1 ? "s" : ""}${
          childrenCount > 0
            ? ` - ${childrenCount} child${childrenCount !== 1 ? "ren" : ""}`
            : ""
        }`
      );

      setDeleteIndex(null);
      setShowDeleteModal(false);
      setPriceFetched(false);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteModal(false);
  };

  const renderTaxBreakdown = () => {
    if (!finalPrice.tax || finalPrice.tax.length === 0) {
      return <p className="text-sm text-gray-500">No taxes applicable</p>;
    }

    return (
      <div className="mt-2">
        {finalPrice.tax.map((tax: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{tax.name || `Tax ${index + 1}`}</span>
            <span>
              {tax.amount ? `${bookingData?.currencyCode || 'USD'} ${tax.amount}` : ''}
              {tax.percentage ? `${tax.percentage}%` : ''}
            </span>
          </div>
        ))}
        {finalPrice.totalTax > 0 && (
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Total Tax</span>
            <span>{bookingData?.currencyCode || 'USD'} {finalPrice.totalTax}</span>
          </div>
        )}
    </div>
    );
  };

  const getPriceBreakdown = () => {
    const currency = bookingData?.currencyCode || 'USD';
    const breakdown = finalPrice.breakdown || {};
    const tax = finalPrice.tax || [];
    const totalTax = finalPrice.totalTax || 0;
    const priceAfterTax = finalPrice.priceAfterTax || finalPrice.totalAmount || amount;

    return {
      baseAmount: breakdown.totalBaseAmount || 0,
      additionalCharges: breakdown.totalAdditionalCharges || 0,
      subtotal: (breakdown.totalBaseAmount || 0) + (breakdown.totalAdditionalCharges || 0),
      taxes: tax,
      totalTax,
      priceAfterTax
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-lg overflow-x-hidden overflow-y-auto">
          <div className="bg-blue-700 text-white p-4">
            <h2 className="text-xl font-bold text-center">Modify Your Booking</h2>
          </div>
          
          <div>
            <h1 className="px-4 py-2 text-xl font-bold">
              🏨 {bookingData?.hotelName || "Azure Haven Resort"}
            </h1>
          </div>
          
          <div className="p-4 border-b text-sm text-gray-700 grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Stay Dates</p>
              <p>{new Date(checkInDate).toDateString()} - {new Date(checkOutDate).toDateString()}</p>
              <p className="text-xs text-gray-500">
                {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
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
                activeTab === "dates" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("dates")}
            >
              <FaCalendarAlt /> Dates
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${
                activeTab === "guests" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
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
                    <label className="block text-sm font-medium">Check-In</label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={formatDateForInput(today)}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setDateErrors((prev) => ({ ...prev, checkIn: undefined }));
                        setPriceFetched(false);
                      }}
                      disabled={isBefore(new Date(checkInDate), new Date())}
                      className={`w-full border px-3 py-2 rounded ${dateErrors.checkIn ? "border-red-500" : ""}`}
                    />
                    {dateErrors.checkIn && <p className="text-sm text-red-600 mt-1">{dateErrors.checkIn}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Check-Out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={formatDateForInput(tomorrow)}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setDateErrors((prev) => ({ ...prev, checkOut: undefined }));
                        setPriceFetched(false);
                      }}
                      className={`w-full border px-3 py-2 rounded ${dateErrors.checkOut ? "border-red-500" : ""}`}
                    />
                    {dateErrors.checkOut && <p className="text-sm text-red-600 mt-1">{dateErrors.checkOut}</p>}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <button
                    onClick={fetchUpdatedPrice}
                    disabled={priceLoading || !checkInDate || !checkOutDate}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {priceLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Fetching Price...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Check Updated Price</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="w-full text-white font-bold border px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowGuestSelector(true)}
                >
                  <span className="flex gap-2 items-center justify-center">
                    <Plus /> {guestSummary}
                  </span>
                </button>
                
                <div className="mt-4 space-y-2 border p-4 rounded bg-gray-50">
                  {guestForms.map((guest, index) => {
                    const gErr = errors[`guest-${index}`] || {};
                    const typeCount = guestForms.slice(0, index + 1).filter((g) => g.type === guest.type).length;
                    
                    return (
                      <div key={index} className="bg-white relative border border-gray-300 p-4 rounded shadow-sm">
                        <button
                          onClick={() => handleDeleteClick(index)}
                          className="absolute top-4 right-3 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <p className="font-medium text-gray-800 mb-2">
                          {guest.type === "adult" ? `Adult ${typeCount}` : `Child ${typeCount}`}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">First Name</label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={guest.firstName}
                              onChange={(e) => handleGuestDetailChange(index, "firstName", e.target.value)}
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${
                                gErr.firstName ? "border-red-500" : "border-gray-300"
                              }`}
                            />
                            {gErr.firstName && <p className="text-sm text-red-600 mt-1">{gErr.firstName}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Last Name</label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={guest.lastName}
                              onChange={(e) => handleGuestDetailChange(index, "lastName", e.target.value)}
                              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 ${
                                gErr.lastName ? "border-red-500" : "border-gray-300"
                              }`}
                            />
                            {gErr.lastName && <p className="text-sm text-red-600 mt-1">{gErr.lastName}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Date of Birth</label>
                            <input
                              type="date"
                              value={guest.dob}
                              onChange={(e) => handleGuestDetailChange(index, "dob", e.target.value)}
                              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 border-gray-300"
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
                    disabled={priceLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {priceLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Fetching Price...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Check Updated Price</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="px-6 pb-4 text-gray-700 text-sm space-y-2 relative">
            {bookingData?.paymentType === "payAtHotel" ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-yellow-800 font-semibold">You will be charged at the hotel:</p>
                    <p className="text-lg text-blue-700 font-bold">
                      {bookingData?.currencyCode || 'USD'} {amount.toLocaleString()}
                    </p>
                  </div>
                  {priceFetched && (
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <FaInfoCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {showBreakdown && priceFetched && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Price Breakdown</h4>
                    <div className="bg-white p-3 rounded text-sm">
                      {getPriceBreakdown().subtotal > 0 && (
                        <>
                          <div className="flex justify-between mb-1">
                            <span>Base Rate ({finalPrice.numberOfNights || 0} nights)</span>
                            <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().baseAmount}</span>
                          </div>
                          {getPriceBreakdown().additionalCharges > 0 && (
                            <div className="flex justify-between mb-1">
                              <span>Additional Guest Charges</span>
                              <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().additionalCharges}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium border-t pt-1 mt-1">
                            <span>Subtotal</span>
                            <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().subtotal}</span>
                          </div>
                        </>
                      )}
                      {renderTaxBreakdown()}
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
                        <p className="text-sm text-gray-600">Original Price</p>
                        <p className="text-lg font-semibold">
                          {bookingData?.currencyCode || 'USD'} {bookingData.amount?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Updated Price</p>
                        <p className={`text-lg font-bold ${priceFetched ? 'text-blue-700' : 'text-gray-800'}`}>
                          {bookingData?.currencyCode || 'USD'} {amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {priceFetched && (
                      <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="text-gray-500 hover:text-blue-600 ml-2"
                      >
                        <FaInfoCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {showBreakdown && priceFetched && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">Price Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Base Rate ({finalPrice.numberOfNights || 0} nights)</span>
                          <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().baseAmount}</span>
                        </div>
                        {getPriceBreakdown().additionalCharges > 0 && (
                          <div className="flex justify-between">
                            <span>Additional Guest Charges</span>
                            <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().additionalCharges}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-1 mt-1">
                          <span>Subtotal</span>
                          <span>{bookingData?.currencyCode || 'USD'} {getPriceBreakdown().subtotal}</span>
                        </div>
                        {renderTaxBreakdown()}
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                          <span>Total Price</span>
                          <span className="text-blue-700">
                            {bookingData?.currencyCode || 'USD'} {getPriceBreakdown().priceAfterTax}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Already Paid:</span>
                        <span className="text-green-600 font-medium">
                          {bookingData?.currencyCode || 'USD'} {bookingData?.paidamount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      
                      {finalPrice.booking?.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount Applied:</span>
                          <span className="text-red-600 font-medium">
                            - {bookingData?.currencyCode || 'USD'} {finalPrice.booking.discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {priceFetched && finalPrice.booking?.finalPayable > 0 && (
                        <div className="flex justify-between bg-red-50 p-2 rounded">
                          <span className="text-red-700 font-semibold">To Pay at Hotel:</span>
                          <span className="text-red-700 font-bold">
                            {bookingData?.currencyCode || 'USD'} {finalPrice.booking.finalPayable.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {priceFetched && finalPrice.booking?.refundAmount > 0 && (
                        <div className="flex justify-between bg-green-50 p-2 rounded">
                          <span className="text-green-700 font-semibold">To Be Refunded:</span>
                          <span className="text-green-700 font-bold">
                            {bookingData?.currencyCode || 'USD'} {finalPrice.booking.refundAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {!priceFetched && !priceFetchError && (
                        <div className="text-center py-2">
                          <p className="text-gray-600 italic">Click "Check Updated Price" to see price changes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {priceFetchError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <p className="text-red-700 font-semibold">Price Error</p>
                    <p className="text-red-600 text-sm">Unable to fetch updated price. Please try again.</p>
                  </div>
                )}
              </>
            )}

            <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 space-y-1 mt-2">
              <p>• Date changes are subject to availability</p>
              <p>• Changes within 72 hours of check-in may incur additional fees</p>
              <p>• Room upgrades are subject to availability and additional charges</p>
              <p>• Reducing the length of stay may be subject to the original booking's cancellation policy</p>
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
              disabled={priceFetchError || !priceFetched || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
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

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Do you really want to delete this guest?</h2>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <ModifyGuestSelector
        isOpen={showGuestSelector}
        initialRooms={requestedRooms}
        initialAdults={guestCounts.adults}
        initialChildren={guestCounts.children}
        onClose={() => setShowGuestSelector(false)}
        onApply={(summary, data) => {
          setGuestSummary(summary);
          setRooms([{ adults: data.adults, children: data.children, childAges: [] }]);
          
          const updatedGuests: Guest[] = [];
          for (let i = 0; i < data.adults + data.children; i++) {
            if (i < data.adults) {
              updatedGuests.push({
                type: "adult",
                firstName: i < guestForms.length ? guestForms[i].firstName : "",
                lastName: i < guestForms.length ? guestForms[i].lastName : "",
                dob: i < guestForms.length ? guestForms[i].dob : ""
              });
            } else {
              updatedGuests.push({
                type: "child",
                firstName: i < guestForms.length ? guestForms[i].firstName : "",
                lastName: i < guestForms.length ? guestForms[i].lastName : "",
                dob: i < guestForms.length ? guestForms[i].dob : ""
              });
            }
          }
          
          setGuestForms(updatedGuests);
          setGuestCounts({ adults: data.adults, children: data.children });
          setRequestedRooms(data.rooms);
          setShowGuestSelector(false);
          setPriceFetched(false);
        }}
      />
    </>
  );
};

export default ModifyBookingModal;