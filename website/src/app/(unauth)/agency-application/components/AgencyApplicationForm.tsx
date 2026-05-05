"use client";

import { useState } from "react";
import { IAgencyApplicationForm } from "../types/agencyApplication.types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Loader2, User, Building2, BadgePercent, Info, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { submitAgencyApplicationService } from "../service";
import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";
import { currencies } from "@/src/components/currencyCode/cuurency";

interface Props {
  onSuccess: () => void;
}

const empty: IAgencyApplicationForm = {
  applicantEmail: "",
  applicantName: "",
  applicantPhone: "",
  applicantPassword: "",
  agencyName: "",
  agencyType: "travel_agency",
  agencyEmail: "",
  contactNo: "",
  taxNo: "",
  commissionType: "percentage",
  commissionValue: 0,
  commissionCurrency: "USD",
  iataCode: "",
  address: "",
};

export default function AgencyApplicationForm({ onSuccess }: Props) {
  const [form, setForm] = useState<IAgencyApplicationForm>(empty);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof IAgencyApplicationForm, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitAgencyApplicationService(form);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
      } else {
        toast.error(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Applicant Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Applicant Details</p>
            <p className="text-xs text-gray-400">Your personal account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Full Name</Label>
            <Input
              type="text"
              value={form.applicantName}
              onChange={(e) => set("applicantName", e.target.value)}
              placeholder="John Doe"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Email</Label>
            <Input
              type="email"
              value={form.applicantEmail}
              onChange={(e) => set("applicantEmail", e.target.value)}
              placeholder="john@example.com"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Phone</Label>
            <Input
              type="tel"
              value={form.applicantPhone}
              onChange={(e) => set("applicantPhone", e.target.value)}
              placeholder="e.g. +1 555 000 1234"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Password</Label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={form.applicantPassword}
                onChange={(e) => set("applicantPassword", e.target.value)}
                placeholder="Min. 6 characters"
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 pr-10 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> This will be your login password once approved.
            </p>
          </div>
        </div>
      </div>

      {/* Agency Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Agency Details</p>
            <p className="text-xs text-gray-400">Information about your travel business</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Agency Name</Label>
            <Input
              type="text"
              value={form.agencyName}
              onChange={(e) => set("agencyName", e.target.value)}
              placeholder="Wanderlust Travels"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Agency Email</Label>
            <Input
              type="email"
              value={form.agencyEmail}
              onChange={(e) => set("agencyEmail", e.target.value)}
              placeholder="info@wanderlust.com"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Contact Number</Label>
            <Input
              type="tel"
              value={form.contactNo}
              onChange={(e) => set("contactNo", e.target.value)}
              placeholder="+91 98765 43210"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Tax Number</Label>
            <Input
              type="text"
              value={form.taxNo}
              onChange={(e) => set("taxNo", e.target.value)}
              placeholder="GST / VAT number"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">IATA Code</Label>
            <Input
              type="text"
              value={form.iataCode}
              onChange={(e) => set("iataCode", e.target.value)}
              placeholder="e.g. 12345678"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> Optional — leave blank if not applicable.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Agency Type</Label>
            <Select value={form.agencyType} onValueChange={(v) => set("agencyType", v)}>
              <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel_agency">Travel Agency</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-gray-600">Address</Label>
            <Input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full business address"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Commission Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
            <BadgePercent className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Commission Details</p>
            <p className="text-xs text-gray-400">How you'd like to earn on each booking</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700 flex gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Commission is applied per confirmed booking. Choose <strong>Percentage</strong> for a cut of the booking value,
            or <strong>Fixed</strong> for a flat amount per booking regardless of price.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Commission Type</Label>
            <Select value={form.commissionType} onValueChange={(v) => set("commissionType", v)}>
              <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Value {form.commissionType === "percentage" ? "(%)" : "(amount)"}
            </Label>
            <Input
              type="number"
              value={form.commissionValue || ""}
              onChange={(e) => set("commissionValue", Number(e.target.value))}
              placeholder={form.commissionType === "percentage" ? "e.g. 10" : "e.g. 500"}
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Currency</Label>
            <Select
              value={form.commissionCurrency}
              onValueChange={(v) => set("commissionCurrency", v as CurrencyCode)}
            >
              <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {currencies.map(({ code, symbol, name }) => (
                  <SelectItem key={code} value={code}>
                    ({symbol}) {code} — {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live preview */}
        {form.commissionValue > 0 && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-xs text-green-700">
            You'll earn{" "}
            <strong>
              {form.commissionType === "percentage"
                ? `${form.commissionValue}%`
                : `${currencies.find(c => c.code === form.commissionCurrency)?.symbol ?? form.commissionCurrency} ${form.commissionValue}`}
            </strong>{" "}
            {form.commissionType === "percentage"
              ? "of each confirmed booking value."
              : "flat per confirmed booking."}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our partner terms. Our team will review your application within 2–3 business days.
      </p>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-11 text-sm font-semibold"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting Application...</>
        ) : (
          "Submit Application →"
        )}
      </Button>
    </div>
  );
}