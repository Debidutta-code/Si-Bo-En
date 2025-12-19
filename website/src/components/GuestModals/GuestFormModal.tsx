import { isValid } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Guest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}
interface Props {
  guestForms: Guest[];
  contactInfo: { email: string; phoneNumber: string };
  price: number | null;
  finalPrice: any;
  loadingPrice: boolean;
  errorPrice: string | null;
  bookingRoom: any;
  bookingContext: any;
  onClose: () => void;
  handleGuestDetailChange: (
    index: number,
    field: keyof Guest,
    value: string
  ) => void;
  handleContactChange: (field: "email" | "phoneNumber", value: string) => void;
  onSubmit: () => void;
}

const GuestFormModal: React.FC<Props> = ({
  guestForms,
  contactInfo,
  price,
  finalPrice,
  loadingPrice,
  errorPrice,
  bookingRoom,
  bookingContext,
  onClose,
  handleGuestDetailChange,
  handleContactChange,
  onSubmit,
}) => {
  const [localGuestForms, setLocalGuestForms] = useState<Guest[]>([]);

  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0); // in seconds

const [showTooltip, setShowTooltip] = useState(false);
const [isHovered, setIsHovered] = useState(false);
const tooltipRef = useRef<HTMLDivElement>(null);
const [sendingOtp, setSendingOtp] = useState(false);
const [paymentProcessing , setPaymentProcessing]= useState(false);
console.log("final prce",finalPrice)


useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
      setShowTooltip(false);
      setIsHovered(false); // ADD THIS LINE - Reset hover state when clicking outside
    }
  };

  if (showTooltip) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showTooltip]);

  // useEffect(() => {
  //   // Initialize guestForms dateOfBirth with default DOB if empty
  //   // guestForms.forEach((guest, index) => {
  //   //   if (!guest.dateOfBirth) {
  //   //     const today = new Date();
  //   //     const yearsToSubtract = guest.type === "adult" ? 18 : 0;
  //   //     today.setFullYear(today.getFullYear() - yearsToSubtract);
  //   //     const defaultDOB = today.toISOString().split("T")[0];
  //   //     handleGuestDetailChange(index, "dateOfBirth", defaultDOB);
  //   //   }
  //   // });

  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [guestForms, handleGuestDetailChange]);
  // console.log("bookingroom", bookingRoom);
  const validate = (): boolean => {
    const newErrors: any = {};

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    guestForms.forEach((guest, index) => {
      const gErrors: any = {};

      if (!guest.firstName.trim())
        gErrors.firstName = "First name is required.";
      else if (!nameRegex.test(guest.firstName))
        gErrors.firstName = "Invalid name format.";

      if (!guest.lastName.trim()) gErrors.lastName = "Last name is required.";
      else if (!nameRegex.test(guest.lastName))
        gErrors.lastName = "Invalid name format.";

      // if (!guest.dateOfBirth.trim()) {
      //   gErrors.dateOfBirth = "Date of birth is required.";
      // } else {
        // let dob = new Date(guest.dateOfBirth);
        // const today = new Date();

        // if (isNaN(dob.getTime())) {
        //   gErrors.dateOfBirth = "Invalid date format.";
        // } else {
        //   const ageDiff = today.getTime() - dob.getTime();
        //   const ageDate = new Date(ageDiff);
        //   const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    //       if (guest.type === "adult" && age < 18) {
    //         // Set default valid DOB for adult (18 years ago)
    //         const defaultAdultDOB = new Date();
    //         defaultAdultDOB.setFullYear(defaultAdultDOB.getFullYear() - 18);
    //         guest.dateOfBirth = defaultAdultDOB.toISOString().split("T")[0];
    //       // } else if (guest.type === "child" && age >= 18) {
    //       //   // Set default valid DOB for child (5 years old, or anything <18)
    //       //   const defaultChildDOB = new Date();
    //       //   defaultChildDOB.setFullYear(defaultChildDOB.getFullYear() - 5);
    //       //   guest.dateOfBirth = defaultChildDOB.toISOString().split("T")[0];
    //       // }

    //       // // After correction, check again if DOB is still in the future
    //       // if (new Date(guest.dateOfBirth) > today) {
    //       //   gErrors.dateOfBirth = "Date of birth cannot be in the future.";
    //       // }

    //   //     // 🔁 Recheck after potential year correction
    //   //     if (dob > today) {
    //   //       gErrors.dateOfBirth = "Date of birth cannot be in the future.";
    //   //     }
    //   //   }
    //   // }

      if (Object.keys(gErrors).length > 0) {
        newErrors[`guest-${index}`] = gErrors;
      }
    });

    if (!contactInfo.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(contactInfo.email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!contactInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(contactInfo.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  // Latest allowed DOB for adult (must be >= 18 years old)
  const getMaxDOBForAdult = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return formatDate(date);
  };

  // Earliest allowed DOB for child (must be < 18 years old)
  const getMinDOBForChild = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 17);
    return formatDate(date);
  };

  // Latest DOB allowed for child (today)
  const getMaxDOBForChild = () => formatDate(new Date());

  const handleSubmit = () => {
    if (!price) {
      setSubmitError("Something went wrong, please try again.");
      return;
    }

    setSubmitError(null);
     const isValid = validate();

  if (!isValid) {
    toast.error("Please fill all guest and contact details correctly.");
    return;
  }
      setPaymentProcessing(true);
  onSubmit();
  };
  useEffect(() => {
    if (otpSent && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpSent, countdown]);

  if (!bookingRoom || !price) return null; 

 const handleVerifyEmail = async () => {
  const email = contactInfo.email.trim();

  // ✅ Regex for basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    toast.error("Email is required.");
    return;
  }

  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  try {
    setSendingOtp(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/send-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "OTP sent to your email!");
      setOtpSent(true);
      setCountdown(120); // 2 minutes
      setEmailVerified(false);
    } else {
      toast.error(data.message || "Failed to send OTP.");
    }
  } catch (err) {
    console.error("OTP Request Error:", err);
    toast.error("Something went wrong while sending OTP.");
  }
  finally{
    setSendingOtp(false)
  }
};

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contactInfo.email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Email verified!");
        setEmailVerified(true);
        setOtpSent(false);
        setCountdown(0);
      } else {
        toast.error(data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      toast.error("Something went wrong while verifying OTP.");
    }
  };

  return (
    <div className="fixed  bg-black/90 inset-0 z-50 flex justify-center items-center px-4  py-16  bg-black bg-opacity-50">
      <div className=" rounded-xl px-6 py-4 max-w-2xl max-h-[95vh] bg-orange-50  overflow-y-auto shadow-lg relative">
        {/* Header */}
       <div className="flex items-center justify-between p-4 rounded-xl mb-6">
  <h3 className="text-lg sm:text-2xl font-semibold text-orange-600 text-center flex-1">
    Complete Your Booking
  </h3>
  <button
    onClick={onClose}
    className="text-2xl text-gray-600 hover:text-gray-800"
    aria-label="Close"
  >
    &times;
  </button>
</div>


        {/* Guest Forms */}
        {guestForms.map((guest, index) => {
          const gErr = errors[`guest-${index}`] || {};
          const typeCount = guestForms
            .slice(0, index + 1)
            .filter((g) => g.type === guest.type).length;

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 p-4 rounded-xl mb-4 shadow-sm"
            >
              <p className="font-medium text-gray-800 mb-2">
                {guest.type === "adult"
                  ? `Adult ${typeCount}`
                  : `Child ${typeCount}`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    First Name <span className="text-red-500">*</span>
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
                    className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-orange-500 ${
                      gErr.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {gErr.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {gErr.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={guest.lastName}
                    onChange={(e) =>
                      handleGuestDetailChange(index, "lastName", e.target.value)
                    }
                    className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-orange-500 ${
                      gErr.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {gErr.lastName && (
                    <p className="text-sm text-red-600 mt-1">{gErr.lastName}</p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    min={
                      guest.type === "child"
                        ? getMinDOBForChild() // Today - 17 years
                        : undefined
                    }
                    max={
                      guest.type === "adult"
                        ? getMaxDOBForAdult() // Today - 18 years
                        : getMaxDOBForChild() // Today
                    }
                    value={guest.dateOfBirth}
                    onChange={(e) =>
                      handleGuestDetailChange(
                        index,
                        "dateOfBirth",
                        e.target.value
                      )
                    }
                    className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-orange-500 ${
                      gErr.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  {gErr.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">
                      {gErr.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Contact - Email */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email Address
  </label>

  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <input
      type="email"
      value={contactInfo.email}
      onChange={(e) => {
        const newEmail = e.target.value;
        if (emailVerified && newEmail !== contactInfo.email) {
          setEmailVerified(false); // reset if they try to change after verified
        }
        handleContactChange("email", newEmail);
      }}
      disabled={emailVerified} // ✅ disable once verified
      className={`flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm ${
        errors.email ? "border-red-500" : "border-gray-300"
      } ${emailVerified ? "bg-gray-100 cursor-not-allowed" : ""}`}
      placeholder="Enter your email"
    />

    {/* ✅ Hide button if verified */}
    {!emailVerified && (
  <button
    onClick={handleVerifyEmail}
    type="button"
    disabled={sendingOtp || (otpSent && countdown > 0)}
    className={`px-4 py-2 rounded-lg text-sm transition whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700
    `}
  >
    {sendingOtp ? (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Sending...</span>
      </div>
    ) : otpSent && countdown > 0 ? (
      `Resend OTP (${countdown}s)`
    ) : (
      "Verify Email"
    )}
  </button>
)}

  </div>

  {/* OTP Input */}
  {otpSent && countdown > 0 && !emailVerified && (
    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        maxLength={6}
        onChange={(e) => setOtp(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-2 text-sm"
      />
      <button
        onClick={handleVerifyOtp}
        disabled={otp.trim().length === 0}
        className={`bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition whitespace-nowrap
          ${otp.trim().length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}
        `}
      >
        Verify OTP
      </button>
    </div>
  )}

  {/* ✅ Email verified success message */}
  {emailVerified && (
    <p className="text-sm text-green-600 mt-2">✅ Email verified</p>
  )}

  {errors.email && (
    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
  )}
  <p className="text-xs text-gray-500 mt-1">
    Your booking confirmation will be sent here
  </p>
</div>


        {/* Contact - Phone */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            value={contactInfo.phoneNumber}
            maxLength={10}
            onChange={(e) => handleContactChange("phoneNumber", e.target.value)}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-orange-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Used for booking-related notifications
          </p>
        </div>

        {/* Price */}
       <div className="mt-4 bg-white rounded-xl p-3 shadow-sm border text-sm sm:text-base">
<div className="flex items-center gap-2 mb-3 relative" ref={tooltipRef}>
  <h4 className="font-semibold text-gray-900">Price Details</h4>
  
  {/* Info icon with custom hover and click tooltip */}
  <span
    onClick={(e) => {
      e.stopPropagation();
      setShowTooltip(!showTooltip);
        if (showTooltip) {
        setIsHovered(false);
      }
    }}
    onMouseEnter={() => !showTooltip && setIsHovered(true)} // Only hover if not clicked open
    onMouseLeave={() => !showTooltip && setIsHovered(false)} // Only hover if not clicked open
    className="inline-block w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>
  </span>

  {/* Tooltip - Show on hover OR when clicked */}
  {finalPrice?.dailyBreakdown && (showTooltip || isHovered) && (
    <div 
      className="absolute top-6 left-0 z-50 w-60 sm:w-72 p-3 rounded-md shadow-xl border bg-white text-xs"
      onClick={(e) => e.stopPropagation()}
      style={{ 
        maxHeight: '200px', // Limit height
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      }}
    >
      {/* Close button for clicked state */}
      {showTooltip && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ADD THIS LINE
            setShowTooltip(false);
            setIsHovered(false);
          }}
          className="absolute max-h-60 top-2 right-2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close tooltip"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className="font-semibold mb-2 text-gray-800 pr-6">Daily Breakdown</div>
      
      {/* Scrollable content area */}
      <div 
        className="space-y-2  overflow-y-auto pr-2" 
        style={{ 
          maxHeight: '150px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f7fafc'
        }}
      >
        {Array.isArray(finalPrice.dailyBreakdown) ? (
          finalPrice.dailyBreakdown.map((day: any, idx: number) => (
            <div key={idx} className="border-b border-gray-100 pb-2 mb-2 last:border-b-0">
              <div className="font-medium text-gray-700 mb-1">{day.date}</div>
              
              <div className="flex justify-between text-gray-600">
                <span>Base Rate:</span>
                <span>₹{day.baseRate}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Additional Guest Charges:</span>
                <span>₹{day.additionalCharges}</span>
              </div>
               {day.addons && day.addons.length > 0 && (
          <div className="mt-1">
            {day.addons.map((addon: any, i: number) => (
              <div key={i} className="flex justify-between text-gray-600">
                <span>
                  {addon.name} {addon.quantity > 1 && `x${addon.quantity}`}
                </span>
                <span>₹{addon.price * addon.quantity}</span>
              </div>
            ))}
          </div>
        )}
              
              <div className="flex justify-between text-gray-600">
                <span>Total Per Room:</span>
                <span>₹{day.totalPerRoom}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>No. of Rooms:</span>
                <span>{finalPrice.requestedRooms || 1}</span>
              </div>
              
                <div className="flex justify-between font-semibold text-gray-900 mt-1 pt-1 border-t border-gray-100">
          <span>Total for the Day:</span>
          <span>
            ₹{day.totalWithAddons || day.totalPerRoom + (day.addons?.reduce((sum: number, a: any) => sum + a.price * a.quantity, 0) || 0)}
          </span>
        </div>
            </div>
          ))
        ) : (
          <div className="border-b border-gray-100 pb-2 mb-2">
            <div className="font-medium text-gray-700 mb-1">
              {finalPrice.dailyBreakdown.date}
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Base Rate:</span>
              <span>₹{finalPrice.dailyBreakdown.baseRate}</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Additional Charges:</span>
              <span>₹{finalPrice.dailyBreakdown.additionalCharges}</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Total Per Room:</span>
              <span>₹{finalPrice.dailyBreakdown.totalPerRoom}</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>No. of Rooms:</span>
              <span>{finalPrice.requestedRooms || 1}</span>
            </div>
            
            <div className="flex justify-between font-semibold text-gray-900 mt-1 pt-1 border-t border-gray-100">
              <span>Total for the Day:</span>
              <span>
                ₹{(finalPrice.dailyBreakdown.totalPerRoom || 0) * (finalPrice.requestedRooms || 1)}
              </span>
            </div>
          </div>
        )}
        {Array.isArray(finalPrice.dailyBreakdown) && (
       <div className="mt-3 pt-3 border-t-2 border-gray-200 bg-white">
  {/* Total Tax */}
  <div className="flex justify-between font-semibold text-sm text-orange-600">
    <span>Tax</span>
    <span>₹{(finalPrice?.totalTaxAmount || 0).toFixed(2)}</span>
  </div>

  {/* Grand Total */}
  <div className="flex justify-between font-bold text-base text-black mt-2">
    <span>Grand Total</span>
    <span>₹{(finalPrice?.totalAmount || 0).toFixed(2)}</span>
  </div>
</div>

      )}
      </div>
    </div>
  )}
</div>

  {finalPrice && (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Total Base Amount:</span>
        <span>₹{finalPrice.breakdown.totalBaseAmount}</span>
      </div>
      <div className="flex justify-between">
        <span>Total Additional Charges:</span>
        <span>₹{finalPrice.breakdown.totalAdditionalCharges}</span>
      </div>
      <div className="flex justify-between">
        <span>Number of Nights:</span>
        <span>{finalPrice.numberOfNights}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>{finalPrice.totalTaxAmount ||0}</span>
      </div>
    </div>
  )}

  <div className="flex justify-between items-center mt-3">
    <p className="font-semibold text-gray-900">Total Amount</p>
    <p className="text-orange-600 font-bold text-lg">₹{finalPrice.totalAmount}</p>
  </div>
</div>


        {/* Error */}
        {submitError && (
          <div className="text-red-600 font-medium text-sm mb-4">
            {submitError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!emailVerified || paymentProcessing ||!isValid}
            className={`w-full sm:w-auto font-medium px-5 py-3 rounded-xl transition
    ${
      !emailVerified || paymentProcessing
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600 text-white"
    }
  `}
          >
 {paymentProcessing ? (
      <div className="flex items-center justify-center gap-2">
        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Processing...</span>
      </div>
    ) : (
      "Proceed To Payment"
    )}          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestFormModal;
