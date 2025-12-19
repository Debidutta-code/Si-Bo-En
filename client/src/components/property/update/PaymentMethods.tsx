import {  CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethods } from "../types/types";


export default function PaymentMethodsUi({
  paymentMethod,
  setPaymentMethods,
}: {
  paymentMethod: PaymentMethods;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethods>>;
}) {

  // 🔁 Toggle individual payment method
  const togglePaymentMethod = (method: keyof PaymentMethods) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };
  return (
    <div className=" bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden">
          

          {/* Content */}
          <div className="px-6 py-8 bg-white">
            <div className="space-y-8">
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    key: "payAtHotel",
                    label: "Pay at Hotel",
                    desc: "Guests can pay directly at the property upon arrival or departure.",
                  },
                  {
                    key: "bankTransfer",
                    label: "Bank Transfer",
                    desc: "Enable direct bank account transfers for bookings.",
                  },
                  {
                    key: "upi",
                    label: "UPI Payment",
                    desc: "Accept instant UPI payments via QR or ID.",
                  },
                  {
                    key: "gateway",
                    label: "Payment Gateway",
                    desc: "Accept credit/debit cards, net banking, and digital wallets.",
                  },
                ].map(({ key, label, desc }) => {
                  const isSelected = Boolean(paymentMethod[key as keyof PaymentMethods]);

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => togglePaymentMethod(key as keyof PaymentMethods)}
                      className={cn(
                        "p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md focus:outline-none",
                        isSelected
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white border-gray-300 text-gray-800 hover:border-black"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm sm:text-base">{label}</h4>
                        <div
                          className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full border-2",
                            isSelected
                              ? "bg-white border-white"
                              : "border-gray-400 bg-white"
                          )}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}