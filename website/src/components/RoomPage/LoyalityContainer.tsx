import { IPropertyLoyalityWithLoyality } from "@/src/app/Rooms/interface";
import { Award, CheckCircle2, User, LogOut, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";

export const LoyaltyContainer = ({
  loyaltyProgram,
  primaryColor,
  showSignUpModal: externalShowSignUpModal,
  onShowSignUpModalChange,
  onToggleChange,
  toggleOn,
}: {
  loyaltyProgram: IPropertyLoyalityWithLoyality | null;
  primaryColor: string;
  showSignUpModal?: boolean;
  onShowSignUpModalChange?: (show: boolean) => void;
  onToggleChange?: (isOn: boolean) => void;
  toggleOn?: boolean;
}) => {
  const [internalShowSignUpModal, setInternalShowSignUpModal] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);

  // Sync external toggleOn prop into internal state
  useEffect(() => {
    if (toggleOn !== undefined) setIsToggleOn(toggleOn);
  }, [toggleOn]);

  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [identifyEmail, setIdentifyEmail] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    type: string;
    value: number;
    currencyCode: string;
  } | null>(null);

  // Use external state when provided (e.g. triggered by onUnlockLoyalty from RoomCard),
  // otherwise fall back to internal state. LoyaltyProgramBanner uses its own independent
  // internal state so the two modals no longer share the same onOpenChange callback.
  const showSignUpModal =
    externalShowSignUpModal !== undefined
      ? externalShowSignUpModal
      : internalShowSignUpModal;
  const setShowSignUpModal = (value: boolean) => {
    setInternalShowSignUpModal(value);
    onShowSignUpModalChange?.(value);
  };

  const handleToggle = () => {
    if (isRegistered) {
      // Once registered, the toggle cannot be disabled.
      return;
    }

    const next = !isToggleOn;
    if (next) {
      // If toggling ON and not registered, open the sign-up modal
      setShowSignUpModal(true);
    } else {
      setIsToggleOn(false);
      onToggleChange?.(false);
    }
  };

  useEffect(() => {
    if (!loyaltyProgram) return;

    const verifyLoyaltyMembership = async () => {
      setIsVerifying(true);
      const loyaltyMemberEmail = localStorage.getItem(
        `loyalty_member_${loyaltyProgram.propertyId}`,
      );

      if (loyaltyMemberEmail) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalty/guest/check-discount`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: loyaltyMemberEmail,
                propertyId: loyaltyProgram.propertyId,
              }),
            },
          );
          const data = await response.json();

          if (response.ok && data.success && data.data?.isLoyaltyMember) {
            setIsRegistered(true);
            setRegisteredEmail(loyaltyMemberEmail);
            setDiscountInfo(data.data.discount);
            // Auto-enable toggle if already a member
            setIsToggleOn(true);
            onToggleChange?.(true);
          } else {
            localStorage.removeItem(
              `loyalty_member_${loyaltyProgram.propertyId}`,
            );
          }
        } catch {
          localStorage.removeItem(
            `loyalty_member_${loyaltyProgram.propertyId}`,
          );
        }
      }
      setIsVerifying(false);
    };

    verifyLoyaltyMembership();
  }, [loyaltyProgram, onToggleChange]);

  if (!loyaltyProgram || !loyaltyProgram.CreationLoyaltyConfig) return null;

  const program = loyaltyProgram.CreationLoyaltyConfig;
  const loyaltyLogo =
    loyaltyProgram.loyalityConfigLogo ??
    program.BasicLoyaltyProgram?.logo?.[0] ??
    null;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem(`loyalty_member_${loyaltyProgram.propertyId}`);
    setIsRegistered(false);
    setRegisteredEmail("");
    setDiscountInfo(null);
    setIsToggleOn(false);
    onToggleChange?.(false);
    toast.success("Successfully logged out from loyalty program");
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { email, ...otherFields } = formData;
      if (!email) {
        toast.error("Email is required");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalty/guest/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            propertyId: loyaltyProgram.propertyId,
            metadata: otherFields,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.message || "Failed to register for loyalty program";
        if (errorMsg.includes("already registered")) {
          localStorage.setItem(
            `loyalty_member_${loyaltyProgram.propertyId}`,
            email,
          );
          setIsRegistered(true);
          setRegisteredEmail(email);
          if (data.data?.discount) setDiscountInfo(data.data.discount);
          setIsToggleOn(true);
          onToggleChange?.(true);
          toast.success("Welcome back! You're already a loyalty member.");
          setShowSignUpModal(false);
          setFormData({});
          return;
        }
        toast.error(errorMsg);
        return;
      }

      localStorage.setItem(
        `loyalty_member_${loyaltyProgram.propertyId}`,
        email,
      );
      setIsRegistered(true);
      setRegisteredEmail(email);
      setIsToggleOn(true);
      onToggleChange?.(true);
      if (data.data?.discountType && data.data?.discountValue) {
        setDiscountInfo({
          type: data.data.discountType,
          value: data.data.discountValue,
          currencyCode: data.data.currencyCode || program.currencyCode,
        });
      }
      toast.success("Successfully registered for loyalty program!");
      setShowSignUpModal(false);
      setFormData({});
    } catch {
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscountDisplay = () => {
    if (isRegistered && discountInfo) {
      return discountInfo.type === "percentage"
        ? `${discountInfo.value}%`
        : `${discountInfo.currencyCode} ${discountInfo.value}`;
    }
    if (
      loyaltyProgram.discountPercentage !== null &&
      loyaltyProgram.discountPercentage !== undefined
    ) {
      return `${loyaltyProgram.discountPercentage}%`;
    }
    return program.loyaltyDiscountType === "percentage"
      ? `${program.discountValue}%`
      : `${program.currencyCode} ${program.discountValue}`;
  };

  // Only show where isDeleted is false AND isActive is true
  const activeConditions = (program.loyaltyConditions || []).filter(
    (c) => c.isActive && !c.isDeleted,
  );
  const activeSpecialConditions = (
    program.loyaltySpecialConditions || []
  ).filter((c) => c.isActive && !c.isDeleted);

  const benefitItems: { bold: string; normal: string }[] = [
    { bold: `${getDiscountDisplay()}`, normal: " members only discount" },
    ...activeConditions.map((c) => ({ bold: "", normal: c.text })),
    // Each special condition shows title (bold) + subTitle (normal) as separate items
    ...activeSpecialConditions.flatMap((c) => {
      const items: { bold: string; normal: string }[] = [];
      if ((c as any).title) items.push({ bold: (c as any).title, normal: "" });
      if (c.subTitle) items.push({ bold: "", normal: c.subTitle });
      return items;
    }),
  ];

  return (
    <>
      <div className="w-full">
        <div
          className="relative w-full bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-4 sm:px-6 sm:py-5 overflow-hidden"
          data-loyalty-banner
        >
          {isVerifying && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
              <div className="flex items-center gap-2">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200"
                  style={{ borderTopColor: primaryColor }}
                />
                <span className="text-xs font-medium text-gray-600">
                  Verifying...
                </span>
              </div>
            </div>
          )}

          {/* Mobile layout: stacked. md+: side by side */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* LEFT: Benefits Grid */}
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {benefitItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-800 leading-snug line-clamp-2 min-w-0 break-words">
                    {item.bold && (
                      <span className="font-semibold">{item.bold}</span>
                    )}
                    <span>{item.normal}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Divider — horizontal on mobile, vertical on md+ */}
            <div className="block md:hidden h-px w-full bg-gray-100" />

            {/* RIGHT: Logo + toggle controls */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 flex-shrink-0 md:self-start">
              {/* Logo — left on mobile, top on md+ */}
              {loyaltyLogo ? (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <Image
                    src={loyaltyLogo}
                    alt="Loyalty Program Logo"
                    fill
                    className="rounded-lg object-contain border border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
              )}

              {/* Controls — right on mobile, below logo on md+ */}
              <div className="flex flex-col items-end gap-2">
                {!isRegistered ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                        Join Program
                      </span>
                      <button
                        onClick={handleToggle}
                        disabled={isRegistered}
                        aria-label="Toggle loyalty program"
                        className={`relative inline-flex items-center w-10 sm:w-11 h-5 sm:h-6 rounded-full focus:outline-none flex-shrink-0 transition-colors duration-200 ${isRegistered ? "opacity-90 cursor-default" : ""}`}
                        style={{
                          backgroundColor: isToggleOn ? "#22C55E" : "#D1D5DB",
                        }}
                      >
                        <span
                          className={`inline-block w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${isToggleOn ? "translate-x-5 sm:translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap text-right">
                      Are you registered?{" "}
                      <button
                        onClick={() => setShowSignUpModal(true)}
                        className="underline text-gray-700 font-medium hover:text-gray-900 transition-colors"
                      >
                        Identify yourself
                      </button>
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                        Loyalty Discount
                      </span>
                      <button
                        onClick={handleToggle}
                        disabled={isRegistered}
                        aria-label="Toggle loyalty discount"
                        className={`relative inline-flex items-center w-10 sm:w-11 h-5 sm:h-6 rounded-full focus:outline-none flex-shrink-0 transition-colors duration-200 ${isRegistered ? "opacity-90 cursor-default" : ""}`}
                        style={{
                          backgroundColor: isToggleOn ? "#22C55E" : "#D1D5DB",
                        }}
                      >
                        <span
                          className={`inline-block w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${isToggleOn ? "translate-x-5 sm:translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          borderColor: `${primaryColor}30`,
                        }}
                      >
                        <Award
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                          style={{ color: primaryColor }}
                        />
                        <div>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight whitespace-nowrap">
                            Active Member
                          </p>
                          <p
                            className="text-[9px] sm:text-[10px] text-gray-500 truncate max-w-[80px] sm:max-w-[100px]"
                            title={registeredEmail}
                          >
                            {registeredEmail}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] sm:text-xs font-semibold border border-red-200 transition-colors whitespace-nowrap"
                      >
                        <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Award
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: primaryColor }}
                />
                Join {loyaltyProgram.propertyName}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Register to get {getDiscountDisplay()} off on all bookings
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignUpSubmit} className="mt-4">
              <div className="space-y-4">
                <div
                  className="p-3 rounded-lg border flex items-center gap-3"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">
                      {getDiscountDisplay()} Discount
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      Auto-applied on every booking
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {program.LoyaltyProgramFieldConfig &&
                  program.LoyaltyProgramFieldConfig.filter(
                    (f) =>
                      f.visibleInRegistration &&
                      f.fieldName.toLowerCase() !== "email",
                  ).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {program.LoyaltyProgramFieldConfig.filter(
                        (f) =>
                          f.visibleInRegistration &&
                          f.fieldName.toLowerCase() !== "email",
                      ).map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.fieldName}
                            className="text-xs sm:text-sm font-medium"
                          >
                            {field.fieldName.charAt(0).toUpperCase() +
                              field.fieldName.slice(1).replaceAll("_", " ")}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id={field.fieldName}
                            type="text"
                            placeholder={`Enter ${field.fieldName.toLowerCase().replaceAll("_", " ")}`}
                            required={field.required}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.fieldName, e.target.value)
                            }
                            className="w-full text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSignUpModal(false);
                    setFormData({});
                  }}
                  className="flex-1 text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white font-semibold text-sm"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <User className="w-4 h-4" />
                      Sign Up
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
