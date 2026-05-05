
import { useState, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {IBankDetails} from "../types/types"
const bankDetailsSchema = z.object({
  accountHolder: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string()
    .min(8, "Account number must be at least 8 digits"),
  ifsc: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  upiId: z.string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format"),
  
});

type FormErrors = z.inferFormattedError<typeof bankDetailsSchema>;

export default function UpdateBankDetailsUi({bankDetails,setBankDetails}:{bankDetails:IBankDetails,setBankDetails:Dispatch<SetStateAction<IBankDetails>>}) {


  const [errors, setErrors] = useState<FormErrors | null>(null);

  // Update field value
  const updateField = (field: string, value: any) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
    if (errors) {
      setErrors((prev) => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete (newErrors as any)[field];
        return newErrors;
      });
    }
  };


  return (
    <div className=" bg-white">
      <div className=" mx-auto">
        <div className="bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden">
          

          {/* Content */}
          <div className="sm:p-8 bg-white">
            <div className="">

              {/* Bank Account Info */}
              <div className="space-y-6">
                

                <div>
                  <Label htmlFor="accountHolder">Account Holder Name *</Label>
                  <Input
                    id="accountHolder"
                    value={bankDetails.accountHolder}
                    onChange={(e) => updateField("accountHolder", e.target.value)}
                    placeholder="Enter full name as per bank records"
                    className={cn(
                      "mt-2 h-12 border-2",
                      errors?.accountHolder ? "border-red-500" : "border-gray-300 focus:border-black"
                    )}
                  />
                  {errors?.accountHolder?._errors[0] && (
                    <p className="text-red-500 text-sm mt-1">{errors.accountHolder._errors[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => updateField("accountNumber", e.target.value)}
                      placeholder="e.g., 1234567890"
                      className={cn(
                        "mt-2 h-12 border-2",
                        errors?.accountNumber ? "border-red-500" : "border-gray-300 focus:border-black"
                      )}
                    />
                    {errors?.accountNumber?._errors[0] && (
                      <p className="text-red-500 text-sm mt-1">{errors.accountNumber._errors[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ifsc">IFSC Code *</Label>
                    <Input
                      id="ifsc"
                      value={bankDetails.ifsc}
                      onChange={(e) => updateField("ifsc", e.target.value.toUpperCase())}
                      placeholder="e.g., SBIN0001234"
                      className={cn(
                        "mt-2 h-12 border-2 uppercase",
                        errors?.ifsc ? "border-red-500" : "border-gray-300 focus:border-black"
                      )}
                    />
                    {errors?.ifsc?._errors[0] && (
                      <p className="text-red-500 text-sm mt-1">{errors.ifsc._errors[0]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input
                    id="upiId"
                    value={bankDetails.upiId}
                    onChange={(e) => updateField("upiId", e.target.value)}
                    placeholder="e.g., user@paytm"
                    className={cn(
                      "mt-2 h-12 border-2",
                      errors?.upiId ? "border-red-500" : "border-gray-300 focus:border-black"
                    )}
                  />
                  {errors?.upiId?._errors[0] && (
                    <p className="text-red-500 text-sm mt-1">{errors.upiId._errors[0]}</p>
                  )}
                </div>
              </div>


              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}