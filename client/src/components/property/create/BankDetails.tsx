
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Loader2, DollarSign } from "lucide-react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {addBankDetails} from "../api/create/bankDetails"
import { useNavigate} from "react-router-dom"
import Loader from "@/components/Loader/Loader";
// Zod Schema for Validation
const bankDetailsSchema = z.object({
  activatedPaymentMethod: z.object({
    payAtHotel: z.boolean(),
    gateway: z.boolean(),
  }).refine(
    (methods) => Object.values(methods).some(Boolean),
    { message: "Please activate at least one payment method." }
  ),
});

type FormErrors = z.inferFormattedError<typeof bankDetailsSchema>;

export default function BankDetails() {
  const navigate=useNavigate()
  const { propertyId, previous, markStepAsCompleted } = usePropertyForm();

  const [formData, setFormData] = useState({
    activatedPaymentMethod: {
      payAtHotel: true,
      gateway: false,
    },
  });

  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update payment method toggle
  const togglePaymentMethod = (method: keyof typeof formData.activatedPaymentMethod) => {
    setFormData((prev) => ({
      ...prev,
      activatedPaymentMethod: {
        ...prev.activatedPaymentMethod,
        [method]: !prev.activatedPaymentMethod[method],
      },
    }));
    if (errors?.activatedPaymentMethod) {
      setErrors((prev:any) => {
        const newErrors = { ...prev };
        delete newErrors.activatedPaymentMethod;
        return newErrors;
      });
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    if(!propertyId){
      toast.error("Property Id not found ,go back and try again");
      return
    }
    const result = bankDetailsSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setErrors(null);
    setIsSubmitting(true);

    try {
      // console.log("Submitting bank details:", result.data);
      const res=await addBankDetails(propertyId,result.data)
      if(res.success){

        toast.success("Bank details saved successfully!");
        markStepAsCompleted();
      }

      navigate("/app")
    } catch (error: any) {
      toast.error(error.message || "Failed to save bank details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if(isSubmitting){
     return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Saving Bank information and payment details." />
      </div>
    );
  }
  
  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white">
      <div className=" mx-auto">
        <div className="bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 text-black ">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Bank Details & Payment Methods</h1>
                <p className="text-gray-800">Secure your payment information for seamless transactions</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="sm:p-8 bg-white">
            <div className="">

              {/* Payment Methods */}
              <div className="space-y-6 ">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-white text-black rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Activated Payment Methods</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "payAtHotel",
                      label: "Pay at Hotel",
                      desc: "Guests can pay directly at the property",
                    },
                    {
                      key: "gateway",
                      label: "Payment Gateway",
                      desc: "Online card payments & wallets",
                    },
                  ].map(({ key, label, desc }) => {
                    const isSelected =
                      formData.activatedPaymentMethod[key as keyof typeof formData.activatedPaymentMethod];
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => togglePaymentMethod(key as keyof typeof formData.activatedPaymentMethod)}
                        className={cn(
                          "p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md",
                          isSelected
                            ? "bg-white border-black text-black shadow-md"
                            : "bg-white border-gray-300 text-gray-800 hover:border-black"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{label}</h4>
                          <div
                            className={cn(
                              "flex items-center justify-center w-5 h-5 rounded-full border-2",
                              isSelected
                                ? "bg-black border-black"
                                : "border-gray-400 bg-white"
                            )}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </button>
                    );
                  })}
                </div>
                {errors?.activatedPaymentMethod?._errors[0] && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {errors.activatedPaymentMethod._errors[0]}
                  </p>
                )}
              </div>

              {/* Summary Box */}
              
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-10 border-t border-gray-200">
              <Button
                onClick={previous}
                variant="outline"
                className="border-2 border-black hover:bg-black hover:text-white h-12 px-6"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-black hover:bg-gray-800 text-white h-12 px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit & Complete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}