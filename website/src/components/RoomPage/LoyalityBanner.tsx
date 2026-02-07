import { IPropertyLoyalityWithLoyality } from "@/src/app/Rooms/interface";
import { Award, Gift, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const LoyaltyProgramBanner = ({ 
  loyaltyProgram, 
  primaryColor 
}: { 
  loyaltyProgram: IPropertyLoyalityWithLoyality; 
  primaryColor: string;
}) => {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [discountInfo, setDiscountInfo] = useState<{
    type: string;
    value: number;
    currencyCode: string;
  } | null>(null);

  const program = loyaltyProgram.CreationLoyaltyConfig;
  const isBasicProgram = program.BasicLoyaltyProgram !== null;
  const isAdvancedProgram = program.AdvanceLoyaltyProgram !== null;
  const loyaltyLogo = isBasicProgram && program.BasicLoyaltyProgram?.logo?.[0] 
    ? program.BasicLoyaltyProgram.logo[0] 
    : null;

  // Check if user is already registered and verify with backend
  useEffect(() => {
    const verifyLoyaltyMembership = async () => {
      setIsVerifying(true);
      const loyaltyMemberEmail = localStorage.getItem(`loyalty_member_${loyaltyProgram.propertyId}`);
      
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
            }
          );

          const data = await response.json();

          if (response.ok && data.success && data.data?.isLoyaltyMember) {
            // Valid loyalty member
            setIsRegistered(true);
            setRegisteredEmail(loyaltyMemberEmail);
            setDiscountInfo(data.data.discount);
          } else {
            // Not a valid loyalty member, clear localStorage
            localStorage.removeItem(`loyalty_member_${loyaltyProgram.propertyId}`);
            setIsRegistered(false);
            setRegisteredEmail("");
            setDiscountInfo(null);
          }
        } catch (error) {
          console.error("Error verifying loyalty membership:", error);
          // On error, clear localStorage to be safe
          localStorage.removeItem(`loyalty_member_${loyaltyProgram.propertyId}`);
          setIsRegistered(false);
          setRegisteredEmail("");
          setDiscountInfo(null);
        }
      }
      
      setIsVerifying(false);
    };

    verifyLoyaltyMembership();
  }, [loyaltyProgram.propertyId]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Separate email from other fields
      const { email, ...otherFields } = formData;

      if (!email) {
        toast.error("Email is required");
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
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.message || "Failed to register for loyalty program";
        
        // Check if already registered
        if (errorMsg.includes("already registered")) {
          // Save to localStorage
          localStorage.setItem(`loyalty_member_${loyaltyProgram.propertyId}`, email);
          
          // Update state with discount info from backend
          setIsRegistered(true);
          setRegisteredEmail(email);
          if (data.data?.discount) {
            setDiscountInfo(data.data.discount);
          }
          
          toast.success("Welcome back! You're already a loyalty member.");
          setShowSignUpModal(false);
          setFormData({});
          setIsSubmitting(false);
          return;
        }
        
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem(`loyalty_member_${loyaltyProgram.propertyId}`, email);
      
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
      
      toast.success("Successfully registered for loyalty program!");
      setShowSignUpModal(false);
      setFormData({});
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscountDisplay = () => {
    // If user is registered and we have discount info from backend, use that
    if (isRegistered && discountInfo) {
      if (discountInfo.type === "percentage") {
        return `${discountInfo.value}% OFF`;
      } else {
        return `${discountInfo.currencyCode} ${discountInfo.value} OFF`;
      }
    }
    
    // Otherwise, use the default from program config
    if (program.loyaltyDiscountType === "percentage") {
      return `${program.discountValue}% OFF`;
    } else {
      return `${program.currencyCode} ${program.discountValue} OFF`;
    }
  };

  return (
    <>
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative overflow-hidden rounded-xl shadow-md border"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {/* Show loading overlay while verifying */}
            {isVerifying && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: primaryColor }}></div>
                  <span className="text-sm font-medium">Verifying membership...</span>
                </div>
              </div>
            )}
            
            <div className="bg-white p-4 md:p-6">
              {/* Header - Property Name Loyalty */}
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {loyaltyProgram.propertyName} Loyalty Program
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div 
                    className="px-3 py-1.5 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {getDiscountDisplay()}
                  </div>
                  {isBasicProgram && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Basic Program
                    </span>
                  )}
                  {isAdvancedProgram && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Premium Program
                    </span>
                  )}
                </div>
              </div>

              {/* Main Content - 3 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column - Logo Only */}
                <div className="lg:col-span-3">
                  {/* Logo Image */}
                  {loyaltyLogo && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <img 
                        src={loyaltyLogo} 
                        alt="Loyalty Program" 
                        className="w-full h-auto rounded object-contain max-h-32"
                      />
                    </div>
                  )}
                </div>

                {/* Middle Column - Loyalty Conditions (Terms) */}
                <div className="lg:col-span-6">
                  {program.loyaltyConditions && program.loyaltyConditions.filter(c => c.isActive).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Award className="w-4 h-4" style={{ color: primaryColor }} />
                        Program Terms
                      </h3>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                        {program.loyaltyConditions
                          .filter(condition => condition.isActive)
                          .map((condition, index) => (
                            <div 
                              key={index} 
                              className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <div 
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" 
                                style={{ backgroundColor: primaryColor }}
                              ></div>
                              <span className="text-xs text-gray-700 line-clamp-2">{condition.text}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Special Benefits + Sign Up */}
                <div className="lg:col-span-3 space-y-2">
                  {/* Special Benefits */}
                  {program.loyaltySpecialConditions && program.loyaltySpecialConditions.filter(c => c.isActive).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                        Special Benefits
                      </h3>
                      <div className="space-y-1.5">
                        {program.loyaltySpecialConditions
                          .filter(condition => condition.isActive)
                          .slice(0, 2)
                          .map((condition, index) => (
                            <div 
                              key={index} 
                              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-md p-2 border border-purple-200"
                            >
                              <h4 className="font-semibold text-gray-900 text-xs leading-tight">
                                {condition.title}
                              </h4>
                              {condition.subTitle && (
                                <p className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">
                                  {condition.subTitle}
                                </p>
                              )}
                            </div>
                          ))}
                        {program.loyaltySpecialConditions.filter(c => c.isActive).length > 2 && (
                          <p className="text-[10px] text-gray-500 text-center mt-1">
                            +{program.loyaltySpecialConditions.filter(c => c.isActive).length - 2} more benefits
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Sign Up Section or Registered Status */}
                  <div className="flex flex-col items-center space-y-2 pt-1">
                    {!isRegistered ? (
                      <>
                        <div className="text-center w-full">
                          <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                            Join & Save
                          </h3>
                          <p className="text-[10px] text-gray-600 mb-2">
                            Exclusive discounts on every booking
                          </p>
                        </div>

                        <button
                          onClick={() => setShowSignUpModal(true)}
                          className="w-full px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <User className="w-4 h-4" />
                          <span>Sign Up Now</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center w-full">
                          <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                            You're a Member! 🎉
                          </h3>
                          <p className="text-[10px] text-gray-600 mb-2">
                            Loyalty discount will be applied at checkout
                          </p>
                        </div>

                        <div 
                          className="w-full px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2"
                          style={{ 
                            borderColor: primaryColor,
                            backgroundColor: `${primaryColor}10`
                          }}
                        >
                          <User className="w-4 h-4" style={{ color: primaryColor }} />
                          <span className="text-sm font-semibold text-gray-900">{registeredEmail}</span>
                        </div>

                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-xs font-medium text-green-700">
                            {getDiscountDisplay()} Applied
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6" style={{ color: primaryColor }} />
                Join {loyaltyProgram.propertyName} Loyalty Program
              </DialogTitle>
              <DialogDescription>
                Complete your registration to start enjoying member benefits
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignUpSubmit} className="mt-6">
              <div className="space-y-6">
                {/* Discount Info Banner */}
                <div 
                  className="p-5 rounded-xl border-2"
                  style={{ 
                    backgroundColor: `${primaryColor}08`,
                    borderColor: primaryColor
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">
                        Member Discount: {getDiscountDisplay()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied automatically on all your bookings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Fields */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Registration Information</h4>
                  
                  {program.LoyaltyProgramFieldConfig && 
                   program.LoyaltyProgramFieldConfig.filter(field => field.visibleInRegistration).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email field (required, prominently displayed) */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          required
                          value={formData.email || ""}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Other dynamic fields */}
                      {program.LoyaltyProgramFieldConfig
                        .filter(field => field.visibleInRegistration && field.fieldName.toLowerCase() !== 'email')
                        .map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.fieldName} className="text-sm font-medium">
                              {field.fieldName.replaceAll("_", " ")}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id={field.fieldName}
                              type="text"
                              placeholder={`Enter ${field.fieldName.toLowerCase().replaceAll("_", " ")}`}
                              required={field.required}
                              value={formData[field.fieldName] || ""}
                              onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No registration fields configured for this loyalty program.
                    </div>
                  )}
                </div>

                
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSignUpModal(false);
                    setFormData({});
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Complete Registration
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
