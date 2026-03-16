"use client";

import { useState, type FC } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Tag,
  Percent,
  RefreshCw,
} from "lucide-react";
import type { IAmendFinalPrice } from "../types/amend.types";
import type { PriceStatus } from "./Amendreservationmodal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IPriceSectionProps {
  currency: string;
  paidAmount: number;
  originalAmount: number;
  updatedAmount: number;
  finalPrice: IAmendFinalPrice;
  priceStatus: PriceStatus;
  loading: boolean;
  paymentMethod: string;
  onRetry: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (currency: string, n: number) =>
  `${currency} ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PriceSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
    <div className="px-5 py-4 border-b border-border">
      <div className="h-3 w-20 bg-muted rounded mb-3" />
      <div className="h-8 w-36 bg-muted rounded mb-2" />
      <div className="h-3 w-24 bg-muted rounded" />
    </div>
    <div className="px-5 py-4 space-y-3">
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-4 w-1/2 bg-muted rounded" />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PriceSection: FC<IPriceSectionProps> = ({
  currency,
  paidAmount,
  originalAmount,
  updatedAmount,
  finalPrice,
  priceStatus,
  loading,
  paymentMethod,
  onRetry,
  onBack,
  onConfirm,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isPayAtHotel = paymentMethod === "pay_at_hotel" || paymentMethod === "payAtHotel";
  const isLoading = priceStatus === "loading";
  const isSuccess = priceStatus === "success";
  const isError = priceStatus === "error";
  const numberOfNights = [...new Set(finalPrice.dailyPriceBrakeDown.map((d) => d.date))].length;

  return (
    <div className="space-y-5">

      {/* ── Status bar ── */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-2">
          <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Checking availability & price...</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Availability confirmed</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Price Card ── */}
      {isLoading ? (
        <PriceSkeleton />
      ) : isSuccess ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">

          {/* Top */}
          {isPayAtHotel ? (
            <div className="px-5 py-4 flex items-start justify-between border-b border-border">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pay at Hotel</p>
                <p className="text-3xl font-bold text-card-foreground tabular-nums">{fmt(currency, updatedAmount)}</p>
                {updatedAmount !== originalAmount && (
                  <p className="text-sm text-muted-foreground mt-1 line-through">{fmt(currency, originalAmount)}</p>
                )}
              </div>
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium mt-1"
              >
                <Info className="h-4 w-4" />
                {showBreakdown ? "Hide" : "Details"}
                {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          ) : (
            <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-border">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Original</p>
                <p className="text-2xl font-bold text-card-foreground tabular-nums">{fmt(currency, originalAmount)}</p>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Updated</p>
                  <p className="text-2xl font-bold text-primary tabular-nums">{fmt(currency, updatedAmount)}</p>
                </div>
                <button
                  onClick={() => setShowBreakdown((v) => !v)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium mt-1"
                >
                  <Info className="h-4 w-4" />
                  {showBreakdown ? "Hide" : "Details"}
                  {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>
          )}

          {/* Breakdown panel */}
          {showBreakdown && (
            <div className="bg-muted/30 px-5 py-4 border-b border-border space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Price Breakdown</p>

              {finalPrice.amountBeforeTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Base Rate{numberOfNights > 0 ? ` · ${numberOfNights} ${numberOfNights === 1 ? "night" : "nights"}` : ""}
                  </span>
                  <span className="font-medium text-card-foreground">{fmt(currency, finalPrice.amountBeforeTax)}</span>
                </div>
              )}

              {finalPrice.totalAddonAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />Add-ons
                  </span>
                  <span className="font-medium text-card-foreground">{fmt(currency, finalPrice.totalAddonAmount)}</span>
                </div>
              )}

              {finalPrice.totalPromotionAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" />Promotion Discount</span>
                  <span>− {fmt(currency, finalPrice.totalPromotionAmount)}</span>
                </div>
              )}

              {finalPrice.loyalityDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Loyalty Discount</span>
                  <span>− {fmt(currency, finalPrice.loyalityDiscount)}</span>
                </div>
              )}

              {finalPrice.taxBrakeDown?.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1.5">
                  {finalPrice.taxBrakeDown.map((t, i) => (
                    <div key={i} className="flex justify-between text-sm text-muted-foreground">
                      <span>{t.name}</span>
                      <span>{fmt(currency, t.taxedAmount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-bold text-base border-t border-border pt-2.5">
                <span className="text-card-foreground">Total</span>
                <span className="text-primary">{fmt(currency, finalPrice.totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Payment diff — online only */}
          {!isPayAtHotel && (
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-semibold text-card-foreground">{fmt(currency, paidAmount)}</span>
              </div>

              {(finalPrice.booking?.finalPayable ?? 0) > 0 && (
                <div className="flex justify-between items-center bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-destructive">Additional Amount Due</span>
                  <span className="text-sm font-bold text-destructive">{fmt(currency, finalPrice.booking!.finalPayable)}</span>
                </div>
              )}

              {(finalPrice.booking?.refundAmount ?? 0) > 0 && (
                <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Refund Amount</span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">{fmt(currency, finalPrice.booking!.refundAmount)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ── Policy Notes ── */}
      <div className="rounded-xl bg-muted/40 border border-border/60 px-4 py-3.5 space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Policy Notes</p>
        <p className="text-xs text-muted-foreground">· Date changes are subject to availability</p>
        <p className="text-xs text-muted-foreground">· Changes within 72 hours of check-in may incur fees</p>
        <p className="text-xs text-muted-foreground">· Reducing length of stay may be subject to cancellation policy</p>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-medium
            text-muted-foreground hover:text-card-foreground hover:bg-accent transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!isSuccess || loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm
            bg-primary text-primary-foreground hover:bg-primary/90 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating Reservation...
            </>
          ) : "Confirm Amendment"}
        </button>
      </div>
    </div>
  );
};

export default PriceSection;