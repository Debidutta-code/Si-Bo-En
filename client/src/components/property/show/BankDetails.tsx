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

  // Helper component to render a payment method status
  const PaymentMethodBadge = ({ method, status }: { method: string; status: boolean }) => (
    <div className="flex items-center space-x-2">
      {status ? (
        <Check className="h-4 w-4 text-white bg-green-500 rounded-full p-0.5" />
      ) : (
        <X className="h-4 w-4 text-white bg-gray-500 rounded-full p-0.5" />
      )}
      <span className="font-medium">{method}</span>
    </div>
  );

  return (
    <div className="bg-white text-black font-sans p-8 mx-auto">
      <Card className="shadow-none border-none md:rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Bank & Payment Details</CardTitle>

        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Bank Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b flex justify-between item-center border-gray-200 pb-2 mb-2 flex items-center space-x-2">
                <span className='flex items-center'>
                  <Landmark className='h-5 w-5' />
                  Bank Account Details
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm"
                      variant="ghost"
                    >
                      <PenTool className='h-4 w-4 mr-2' /> Update
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <AlertDialogHeader>
                      <div className="flex w-full justify-between">
                        <AlertDialogTitle>Update Bank Details</AlertDialogTitle>
                        <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                          <X className="h-4 w-4 " />
                        </AlertDialogCancel>
                      </div>
                      <UpdateBankDetailsUi bankDetails={bankDetails} setBankDetails={setBankDetails} />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e: any) => {
                          e.preventDefault();
                          updateBankDetailsQ(propertyId,bankDetails)
                        }}
                      >
                        {loading
                          ? "Updating Bank Details ..."
                          : "Update Bank Details"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-700">Account Holder:</span>
                  <span>{bankDetails.accountHolder || '-'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-700">Account Number:</span>
                  <span>{bankDetails.accountNumber || '-'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-700">IFSC Code:</span>
                  <span>{bankDetails.ifsc || '-'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-700">UPI ID:</span>
                  <span>{bankDetails.upiId || '-'}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b flex justify-between item-center border-gray-200 pb-2 mb-2 flex items-center space-x-2">
                <span className='flex items-center'>
                  <Landmark className='h-5 w-5' />
                  Activated Payment Methods
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm"
                      variant="ghost"
                    >
                      <PenTool className='h-4 w-4 mr-2' /> Update
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <AlertDialogHeader>
                      <div className="flex w-full justify-between">
                        <AlertDialogTitle>Update Payment Method</AlertDialogTitle>
                        <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                          <X className="h-4 w-4 " />
                        </AlertDialogCancel>
                      </div>
                      <PaymentMethodUi paymentMethod={paymentMethods} setPaymentMethods={setPaymentMethods} />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e: any) => {
                          e.preventDefault();
                          updatePaymentMethodsQ(propertyId,paymentMethods)
                        }}
                      >
                        {loading
                          ? "Updating Payment Method..."
                          : "Update Payment Method"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </h3>
              <div className="space-y-3 text-sm">
                <PaymentMethodBadge method="UPI" status={paymentMethods.upi || false} />
                <PaymentMethodBadge method="Bank Transfer" status={paymentMethods.bankTransfer || false} />
                <PaymentMethodBadge method="Online Gateway" status={paymentMethods.gateway || false} />
                <PaymentMethodBadge method="Pay at Hotel" status={paymentMethods.payAtHotel || false} />
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}