import { IPropertyLoyalityWithLoyality } from "@/src/app/(unauth)/Rooms/interface";
import {
  Award,
  Gift,
  Star,
  User,
  Sparkles,
  CheckCircle2,
  Mail,
  LogOut,
} from "lucide-react";
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
import { useTranslation } from "react-i18next";

export const LoyaltyProgramBanner = ({
  loyaltyProgram,
  primaryColor,
  showSignUpModal: externalShowSignUpModal,
  onShowSignUpModalChange,
  onSignUpSuccess,
  onLogoutSuccess,
  onDiscountVerified,
}: {
  loyaltyProgram: IPropertyLoyalityWithLoyality | null;
  primaryColor: string;
  showSignUpModal?: boolean;
  onShowSignUpModalChange?: (show: boolean) => void;
  onSignUpSuccess?: (email: string) => void;
  onLogoutSuccess?: () => void;
  onDiscountVerified?: (discount: { type: string; value: number; currencyCode: string }) => void;
}) => {
  const { t } = useTranslation();
  const [internalShowSignUpModal, setInternalShowSignUpModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    type: string;
    value: number;
    currencyCode: string;
  } | null>(null);

  // Check if user is already registered and verify with backend
  useEffect(() => {
    const verifyLoyaltyMembership = async () => {
      if (!loyaltyProgram?.propertyId) return;
      setIsVerifying(true);
      const loyaltyMemberEmail = localStorage.getItem(
        `loyalty_member_${loyaltyProgram.propertyId}`,
      );

      if (loyaltyMemberEmail) {
        try {
          // Verify with backend using check-discount endpoint
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
            // Valid loyalty member
            setIsRegistered(true);
            setRegisteredEmail(loyaltyMemberEmail);
            onDiscountVerified?.(data.data.discount);
            setDiscountInfo(data.data.discount);
          } else {
            // Not a valid loyalty member, clear localStorage
            localStorage.removeItem(
              `loyalty_member_${loyaltyProgram.propertyId}`,
            );
            setIsRegistered(false);
            setRegisteredEmail("");
            setDiscountInfo(null);
          }
        } catch (error) {
          console.error("Error verifying loyalty membership:", error);
          // On error, clear localStorage to be safe
          localStorage.removeItem(
            `loyalty_member_${loyaltyProgram.propertyId}`,
          );
          setIsRegistered(false);
          setRegisteredEmail("");
          setDiscountInfo(null);
        }
      }

      setIsVerifying(false);
    };

    verifyLoyaltyMembership();
  }, [loyaltyProgram]);

  // Return early if loyaltyProgram is null or if CreationLoyaltyConfig is missing
  // This must be after all hooks to avoid "Rendered more hooks than during the previous render" error
  if (!loyaltyProgram || !loyaltyProgram.CreationLoyaltyConfig) {
    return null;
  }

  // Always use internal state for the modal to avoid conflicts when multiple
  // loyalty components share the same parent state and both register onOpenChange.
  const showSignUpModal = internalShowSignUpModal;
  const setShowSignUpModal = setInternalShowSignUpModal;

  const program = loyaltyProgram.CreationLoyaltyConfig;
  const isBasicProgram = program.BasicLoyaltyProgram !== null;
  const isAdvancedProgram = program.AdvanceLoyaltyProgram !== null;
  const loyaltyLogo =
    loyaltyProgram.loyalityConfigLogo ??
    (isBasicProgram && program.BasicLoyaltyProgram?.logo?.[0]
      ? program.BasicLoyaltyProgram.logo[0]
      : null);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem(`loyalty_member_${loyaltyProgram.propertyId}`);
    setIsRegistered(false);
    setRegisteredEmail("");
    setDiscountInfo(null);
    toast.success(t("LoyaltyBanner.logoutSuccess"));
    onLogoutSuccess?.();
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Separate email from other fields
      const { email, ...otherFields } = formData;

      if (!email) {
        toast.error(t("LoyaltyBanner.modal.emailRequired"));
        setIsSubmitting(false);
        return;
      }

      // Call registration API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalty/guest/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            propertyId: loyaltyProgram.propertyId,
            metadata: otherFields, // All other fields go into metadata
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.message || t("LoyaltyBanner.modal.failedToRegister");

        // Check if already registered
        if (errorMsg.includes("already registered")) {
          // Save to localStorage
          localStorage.setItem(
            `loyalty_member_${loyaltyProgram.propertyId}`,
            email,
          );

          // Update state with discount info from backend
          setIsRegistered(true);
          setRegisteredEmail(email);
          if (data.data?.discount) {
            setDiscountInfo(data.data.discount);
          }

          toast.success(t("LoyaltyBanner.modal.alreadyRegistered"));
          setShowSignUpModal(false);
          setFormData({});
          setIsSubmitting(false);
          onSignUpSuccess?.(email);
          return;
        }

        toast.error(t("LoyaltyBanner.modal.failedRetry"));
        setIsSubmitting(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem(
        `loyalty_member_${loyaltyProgram.propertyId}`,
        email,
      );

      // Update state with discount info from registration response
      setIsRegistered(true);
      setRegisteredEmail(email);

      // Store discount info from response
      if (data.data?.discountType && data.data?.discountValue) {
        setDiscountInfo({
          type: data.data.discountType,
          value: data.data.discountValue,
          currencyCode: data.data.currencyCode || program.currencyCode,
        });
      }

      toast.success(t("LoyaltyBanner.modal.registerSuccess"));
      setShowSignUpModal(false);
      setFormData({});
      onSignUpSuccess?.(email);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscountDisplay = (isPreLogin = false) => {
    if (!isPreLogin && isRegistered && discountInfo) {
      if (discountInfo.type === "percentage") return `${discountInfo.value}% OFF`;
      return `${discountInfo.currencyCode} ${discountInfo.value} OFF`;
    }
    // Pre-login or not registered — show "Upto X% OFF"
    if (loyaltyProgram.discountPercentage !== null && loyaltyProgram.discountPercentage !== undefined) {
      return `Upto ${loyaltyProgram.discountPercentage}% OFF`;
    }
    if (program.loyaltyDiscountType === "percentage") {
      return `Upto ${program.discountValue}% OFF`;
    }
    return `Upto ${program.currencyCode} ${program.discountValue} OFF`;
  };

  return (
    <>
      <div className="h-full">
        <div className="max-w-7xl h-full mx-auto">
          <div
            className="relative h-full overflow-hidden rounded-xl shadow-md border"
            data-loyalty-banner
            style={{
              borderColor: `${primaryColor}20`,
              background: "white",
            }}
          >
            {/* Loading overlay while verifying */}
            {isVerifying && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex items-center gap-2">
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200"
                    style={{ borderTopColor: primaryColor }}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">
                    {t("LoyaltyBanner.verifying")}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4 h-full flex flex-col gap-2.5">
              {/* Header Row: Logo + Property Name + Badge */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {loyaltyLogo ? (
                    <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-200">
                      <div className="relative w-10 h-8 sm:w-12 sm:h-9">
                        <Image
                          src={loyaltyLogo}
                          alt="Loyalty Program"
                          fill
                          className="rounded object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-gray-50 rounded-lg p-2 border flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <Award
                        className="w-5 h-5 sm:w-6 sm:h-6 opacity-20"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  )}
                </div>

                {/* Property Name + Label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Award
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {loyaltyProgram.propertyName}
                    </h2>
                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                      {t("LoyaltyBanner.loyaltyProgram")}
                    </span>
                  </div>
                </div>

                {/* Basic / Premium Badge - right side of header on all screens */}
                <div className="flex-shrink-0">
                  {isBasicProgram && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t("LoyaltyBanner.basic")}
                    </span>
                  )}
                  {isAdvancedProgram && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t("LoyaltyBanner.premium")}
                    </span>
                  )}
                </div>
              </div>

              {/* Program Terms */}
              {program.loyaltyConditions &&
                program.loyaltyConditions.filter((c) => c.isActive).length >
                0 && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <CheckCircle2
                        className="w-3 h-3"
                        style={{ color: primaryColor }}
                      />
                      Program Terms
                    </h3>
                    <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                      {program.loyaltyConditions
                        .filter((condition) => condition.isActive)
                        .slice(0, 2)
                        .map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-1.5 bg-gray-50 rounded p-1.5"
                          >
                            <CheckCircle2
                              className="w-3 h-3 flex-shrink-0 mt-0.5"
                              style={{ color: primaryColor }}
                            />
                            <span className="text-[10px] sm:text-xs text-gray-700 leading-snug">
                              {condition.text}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Special Benefits */}
              {program.loyaltySpecialConditions &&
                program.loyaltySpecialConditions.filter((c) => c.isActive)
                  .length > 0 && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Star
                        className="w-3 h-3"
                        style={{ color: primaryColor }}
                      />
                      Special Benefits
                    </h3>
                    <div className="space-y-1">
                      {program.loyaltySpecialConditions
                        .filter((condition) => condition.isActive)
                        .slice(0, showAllBenefits ? undefined : 1)
                        .map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-1.5 bg-gradient-to-br from-purple-50 to-blue-50 rounded p-1.5 border border-purple-200 overflow-hidden min-w-0"
                          >
                            <Star
                              className="w-3 h-3 flex-shrink-0 mt-0.5"
                              style={{ color: primaryColor }}
                            />
                            <span className="text-[10px] sm:text-xs text-gray-900 font-semibold leading-snug">
                              {condition.subTitle}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Bottom Row: Discount Badge + Spacer + (Join/Logout) */}
              <div className="flex items-center gap-2 mt-auto flex-wrap sm:flex-nowrap">
                {/* Discount Badge */}
                <div
                  className="px-2.5 py-1 rounded-lg text-white text-[10px] sm:text-xs font-bold whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {getDiscountDisplay()}
                </div>

                <div className="flex-1" />

                {/* Commented-out Join/Logout buttons preserved as-is */}
                {/* {!isRegistered ? (
                  <button
                    onClick={() => setShowSignUpModal(true)}
                    className="px-4 py-2 rounded-lg text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <User className="w-3.5 h-3.5" />
                    Join Program
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="rounded-lg px-3 py-1.5 text-center border"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: `${primaryColor}40`
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-gray-900 whitespace-nowrap">Active Member</p>
                          <p className="text-[8px] font-semibold text-gray-600 truncate max-w-[100px]" title={registeredEmail}>
                            {registeredEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-red-200 whitespace-nowrap flex-shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )} */}
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
                {t("LoyaltyBanner.modal.join")} {loyaltyProgram.propertyName}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t("LoyaltyBanner.modal.registerTo")} {getDiscountDisplay()} {t("LoyaltyBanner.modal.onAllBookings")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignUpSubmit} className="mt-4">
              <div className="space-y-4">
                {/* Discount Banner */}
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
                      {getDiscountDisplay()} {t("LoyaltyBanner.modal.discount")}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      {t("LoyaltyBanner.modal.autoApplied")}
                    </p>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs sm:text-sm font-medium"
                  >
                    {t("LoyaltyBanner.modal.emailLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("LoyaltyBanner.modal.emailPlaceholder")}
                    required
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full text-sm"
                  />
                </div>


                {/* Dynamic Fields */}
                {program.LoyaltyProgramFieldConfig &&
                  program.LoyaltyProgramFieldConfig.filter(
                    (field) =>
                      field.visibleInRegistration &&
                      field.fieldName.toLowerCase() !== "email"
                  ).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {program.LoyaltyProgramFieldConfig.filter(
                        (field) =>
                          field.visibleInRegistration &&
                          field.fieldName.toLowerCase() !== "email",
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

              {/* Buttons */}
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
                  {t("LoyaltyBanner.modal.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white font-semibold text-sm"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("LoyaltyBanner.modal.registering")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <User className="w-4 h-4" />
                      {t("LoyaltyBanner.modal.signUp")}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${primaryColor}40;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${primaryColor}60;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};
