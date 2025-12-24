import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../Loader/Loader';
import { getBankDetailsByPropertyId } from "../api/show/bankDetails";
import { type IBankDetails, type PaymentMethods } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Landmark, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PaymentMethodUi from "../update/PaymentMethods";
import UpdateBankDetailsUi from '../update/BankDetails';
import { updateBankDetails, updatePaymentMethod } from "../api/update/bankDetails";
interface PropertyId {
  propertyId: string;
}

export default function BankDetails({ propertyId }: PropertyId) {
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<IBankDetails>({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upiId: ""
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    bankTransfer: false,
    gateway: false,
    payAtHotel: false,
    upi: false
  });

  const fetchBankDetails = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getBankDetailsByPropertyId(propertyId);
      if (response.success) {
        const data = response.data;
        setBankDetails(data);
        setPaymentMethods(data.activatedPaymentMethod);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };
  const updateBankDetailsQ = async (propertyId: string, payload: IBankDetails) => {
    try {
      setLoading(true)
      const res = await updateBankDetails(propertyId, payload)
      if (res.success) {
        toast.success("Bank details Updated successfully")
      } else {
        toast.error(res?.message || "Failed to Update Bank Details")
      }
    } catch (error) {
      toast.error("Failed to Update Bank Details")

    } finally {
      setLoading(false)
    }
  }
  const updatePaymentMethodsQ = async (propertyId: string, payload: PaymentMethods) => {
    try {
      setLoading(true)
      const res = await updatePaymentMethod(propertyId, payload)
      if (res.success) {
        toast.success("payment methods Updated successfully")
      } else {
        toast.error(res?.message || "Failed to Update payment methods")
      }
    } catch (error) {
      toast.error("Failed to Update payment methods")

    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchBankDetails(propertyId);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader text="Loading Bank Details" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Bank & Payment Details
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Manage your banking information and accepted payment methods
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Details Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bank Account Details
                </h3>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-primary-600 hover:text-primary-700">
                    <PenTool className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                  <AlertDialogHeader>
                    <div className="flex w-full justify-between items-start">
                      <div>
                        <AlertDialogTitle className="text-xl">
                          Update Bank Details
                        </AlertDialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Modify your banking information for transactions
                        </p>
                      </div>
                      <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </AlertDialogCancel>
                    </div>
                    <UpdateBankDetailsUi
                      bankDetails={bankDetails}
                      setBankDetails={setBankDetails}
                    />
                  </AlertDialogHeader>
                  <AlertDialogFooter className="border-t pt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e: any) => {
                        e.preventDefault();
                        updateBankDetailsQ(propertyId, bankDetails);
                      }}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Details"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Account Holder Name
                </label>
                <p className="text-base text-gray-900">
                  {bankDetails.accountHolder || (
                    <span className="text-gray-400 italic">Not specified</span>
                  )}
                </p>
              </div>

              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Account Number
                </label>
                <p className="text-base text-gray-900 font-mono">
                  {bankDetails.accountNumber || (
                    <span className="text-gray-400 italic font-sans">Not specified</span>
                  )}
                </p>
              </div>

              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  IFSC Code
                </label>
                <p className="text-base text-gray-900 font-mono uppercase">
                  {bankDetails.ifsc || (
                    <span className="text-gray-400 italic font-sans normal-case">
                      Not specified
                    </span>
                  )}
                </p>
              </div>

              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  UPI ID
                </label>
                <p className="text-base text-gray-900 font-mono">
                  {bankDetails.upiId || (
                    <span className="text-gray-400 italic font-sans">Not specified</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green/100 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Methods
                </h3>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-primary-600 hover:text-primary-700">
                    <PenTool className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                  <AlertDialogHeader>
                    <div className="flex w-full justify-between items-start">
                      <div>
                        <AlertDialogTitle className="text-xl">
                          Update Payment Methods
                        </AlertDialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Select which payment methods you accept
                        </p>
                      </div>
                      <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </AlertDialogCancel>
                    </div>
                    <PaymentMethodUi
                      paymentMethod={paymentMethods}
                      setPaymentMethods={setPaymentMethods}
                    />
                  </AlertDialogHeader>
                  <AlertDialogFooter className="border-t pt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e: any) => {
                        e.preventDefault();
                        updatePaymentMethodsQ(propertyId, paymentMethods);
                      }}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Methods"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-3">
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${paymentMethods.upi
                  ? "bg-success/10 border-success/20"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethods.upi ? "bg-green-500" : "bg-gray-400"
                      }`}
                  >
                    {paymentMethods.upi ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">UPI</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${paymentMethods.upi
                    ? "bg-success/20 text-success-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {paymentMethods.upi ? "Active" : "Inactive"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${paymentMethods.bankTransfer
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethods.bankTransfer ? "bg-green-500" : "bg-gray-400"
                      }`}
                  >
                    {paymentMethods.bankTransfer ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Bank Transfer</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${paymentMethods.bankTransfer
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {paymentMethods.bankTransfer ? "Active" : "Inactive"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${paymentMethods.gateway
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethods.gateway ? "bg-green-500" : "bg-gray-400"
                      }`}
                  >
                    {paymentMethods.gateway ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Online Gateway</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${paymentMethods.gateway
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {paymentMethods.gateway ? "Active" : "Inactive"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${paymentMethods.payAtHotel
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethods.payAtHotel ? "bg-green-500" : "bg-gray-400"
                      }`}
                  >
                    {paymentMethods.payAtHotel ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Pay at Hotel</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${paymentMethods.payAtHotel
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {paymentMethods.payAtHotel ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}