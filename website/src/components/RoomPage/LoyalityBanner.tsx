import { IPropertyLoyalityWithLoyality } from "@/src/app/Rooms/interface";
import { Award, Gift, Star, User, Sparkles, CheckCircle2, Mail } from "lucide-react";
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
      <div className="px-3 py-2">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative overflow-hidden rounded-xl shadow-md border"
            style={{ 
              borderColor: `${primaryColor}20`,
              background: 'white'
            }}
          >
            {/* Show loading overlay while verifying */}
            {isVerifying && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200" style={{ borderTopColor: primaryColor }}></div>
                  <span className="text-xs font-medium text-gray-600">Verifying...</span>
                </div>
              </div>
            )}
            
            <div className="p-3 md:p-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-base md:text-lg font-bold text-gray-900">
                    {loyaltyProgram.propertyName}
                  </h2>
                  <span className="text-xs text-gray-500 hidden sm:inline">Loyalty Program</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="px-3 py-1 rounded-lg text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {getDiscountDisplay()}
                  </div>
                  {isBasicProgram && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-semibold hidden sm:inline">
                      Basic
                    </span>
                  )}
                  {isAdvancedProgram && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white rounded text-xs font-semibold hidden sm:inline">
                      Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Logo */}
                <div className="lg:col-span-2">
                  {loyaltyLogo ? (
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <img 
                        src={loyaltyLogo} 
                        alt="Loyalty Program" 
                        className="w-full h-auto rounded object-contain max-h-16"
                      />
                    </div>
                  ) : (
                    <div 
                      className="bg-gray-50 rounded-lg p-3 border flex items-center justify-center h-16"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <Award className="w-8 h-8 opacity-20" style={{ color: primaryColor }} />
                    </div>
                  )}
                </div>

                {/* Program Terms */}
                <div className="lg:col-span-6">
                  {program.loyaltyConditions && program.loyaltyConditions.filter(c => c.isActive).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Award className="w-3 h-3" style={{ color: primaryColor }} />
                        Program Terms
                      </h3>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                        {program.loyaltyConditions
                          .filter(condition => condition.isActive)
                          .map((condition, index) => (
                            <div 
                              key={index} 
                              className="flex items-start gap-2 bg-gray-50 rounded p-2"
                            >
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                              <span className="text-xs text-gray-700 line-clamp-1">{condition.text}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Benefits & CTA */}
                <div className="lg:col-span-4 flex gap-2">
                  {/* Special Benefits */}
                  {program.loyaltySpecialConditions && program.loyaltySpecialConditions.filter(c => c.isActive).length > 0 && (
                    <div className="flex-1">
                      <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: primaryColor }} />
                        Benefits
                      </h3>
                      <div className="space-y-1.5">
                        {program.loyaltySpecialConditions
                          .filter(condition => condition.isActive)
                          .slice(0, 2)
                          .map((condition, index) => (
                            <div 
                              key={index} 
                              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded p-2 border border-purple-200"
                            >
                              <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">
                                {condition.title}
                              </h4>
                            </div>
                          ))}
                        {program.loyaltySpecialConditions.filter(c => c.isActive).length > 2 && (
                          <p className="text-[9px] text-gray-500 text-center">
                            +{program.loyaltySpecialConditions.filter(c => c.isActive).length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="flex-1">
                    {!isRegistered ? (
                      <div className="h-full flex flex-col justify-center">
                        <button
                          onClick={() => setShowSignUpModal(true)}
                          className="w-full px-3 py-2 rounded-lg text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <User className="w-3.5 h-3.5" />
                          Sign Up
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div 
                          className="rounded-lg p-2 text-center"
                          style={{ backgroundColor: `${primaryColor}15` }}
                        >
                          <Award className="w-4 h-4 mx-auto mb-1" style={{ color: primaryColor }} />
                          <p className="text-[9px] font-bold text-gray-900">Active Member</p>
                        </div>
                        <div 
                          className="rounded-lg px-2 py-1.5 bg-green-600 text-center"
                        >
                          <p className="text-[10px] font-bold text-white">
                            {getDiscountDisplay()}
                          </p>
                          <p className="text-[8px] text-white/90">Auto-applied</p>
                        </div>
                      </div>
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
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5" style={{ color: primaryColor }} />
                Join {loyaltyProgram.propertyName}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Register to get {getDiscountDisplay()} on all bookings
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignUpSubmit} className="mt-4">
              <div className="space-y-4">
                {/* Discount Banner */}
                <div 
                  className="p-3 rounded-lg border flex items-center gap-3"
                  style={{ 
                    backgroundColor: `${primaryColor}10`,
                    borderColor: `${primaryColor}40`
                  }}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {getDiscountDisplay()} Discount
                    </p>
                    <p className="text-xs text-gray-600">
                      Auto-applied on every booking
                    </p>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Other Fields */}
                {program.LoyaltyProgramFieldConfig && 
                 program.LoyaltyProgramFieldConfig.filter(field => field.visibleInRegistration && field.fieldName.toLowerCase() !== 'email').length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {program.LoyaltyProgramFieldConfig
                      .filter(field => field.visibleInRegistration && field.fieldName.toLowerCase() !== 'email')
                      .map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label htmlFor={field.fieldName} className="text-sm font-medium">
                            {field.fieldName.charAt(0).toUpperCase() + field.fieldName.slice(1).replaceAll("_", " ")}
                            {field.required && <span className="text-red-500">*</span>}
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
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-6">
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
                    <span className="flex items-center gap-1.5">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
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
      `}</style>
    </>
  );
};