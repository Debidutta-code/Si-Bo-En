"use client";

import { useState } from "react";
import { IAgencyApplication } from "../types/agencyApplication.types";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Loader2, Search, CheckCircle2, Clock, XCircle,
  Building2, User, Calendar, Hash, Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { trackAgencyApplicationService } from "../service";

const statusConfig = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    label: "Under Review",
    sublabel: "Your application is being reviewed by our team",
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
    desc: "Our team is currently reviewing your agency application. This typically takes 2–3 business days. You'll receive an email once a decision is made.",
  },
  approved: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: "Approved",
    sublabel: "Your agency account is ready to use",
    bg: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700 border-green-200",
    iconBg: "bg-green-100 text-green-600",
    desc: "Congratulations! Your agency account is ready. Check your registered email for login credentials and next steps to start booking.",
  },
  rejected: {
    icon: <XCircle className="w-5 h-5" />,
    label: "Rejected",
    sublabel: "Application was not approved",
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700 border-red-200",
    iconBg: "bg-red-100 text-red-600",
    desc: "Unfortunately your application was not approved at this time. Please review the reason below and feel free to reapply.",
  },
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
      <Search className="w-6 h-6 text-gray-400" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-gray-700">Search for your application</p>
      <p className="text-xs text-gray-400 max-w-xs">
        Enter the application ID you received after submitting your agency application.
      </p>
    </div>
    <div className="w-full max-w-xs p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-left">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">What you'll see</p>
      {[
        { color: "bg-amber-400", label: "Pending", desc: "application is under review" },
        { color: "bg-green-400", label: "Approved", desc: "agency account is ready" },
        { color: "bg-red-400", label: "Rejected", desc: "with reason provided" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
          <span className="text-xs text-gray-600">
            <span className="font-medium">{item.label}</span> — {item.desc}
          </span>
        </div>
      ))}
    </div>
    <div className="flex items-start gap-2 text-[11px] text-gray-400 max-w-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
      <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
      <span>Your application ID was sent to your email right after you submitted the form.</span>
    </div>
  </div>
);

export default function TrackApplication() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IAgencyApplication | null>(null);
  const [searched, setSearched] = useState(false);
  const [id, setId] = useState("");

  const handleTrack = async () => {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    setResult(null);
    try {
      const res = await trackAgencyApplicationService(id);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        toast.error(res.message || "Application not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const config = result ? statusConfig[result.status] : null;

  return (
    <div className="space-y-5">

      {/* Search bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter your application ID..."
            value={id}
            onChange={(e) => { setId(e.target.value); setSearched(false); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            className="h-11 bg-gray-50 border-gray-200 focus:bg-white"
          />
          <Button onClick={handleTrack} disabled={loading || !id.trim()} className="h-11 px-5">
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Search className="w-4 h-4 mr-1.5" />Search</>}
          </Button>
        </div>
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pl-1">
          <Info className="w-3 h-3" />
          Use the application ID sent to your email after submitting.
        </p>
      </div>

      {/* Empty state */}
      {!searched && !result && <EmptyState />}

      {/* Loading skeleton */}
      {loading && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && config && !loading && (
        <div className={`border rounded-xl overflow-hidden ${config.bg}`}>
          {/* Status header */}
          <div className="p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{config.label}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${config.badge}`}>
                  {result.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{config.sublabel}</p>
            </div>
          </div>

          <div className="px-5 pb-3">
            <p className="text-sm text-gray-600">{config.desc}</p>
            {result.status === "rejected" && result.rejectionReason && (
              <div className="mt-3 p-3 bg-red-100/60 rounded-lg border border-red-200">
                <p className="text-xs font-medium text-red-700 mb-0.5">Rejection Reason</p>
                <p className="text-sm text-red-600">{result.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="mx-5 my-4 p-4 bg-white/70 rounded-xl border border-white/80 grid grid-cols-2 gap-4">
            {[
              { icon: <Building2 className="w-3.5 h-3.5" />, label: "Agency", value: result.agencyName },
              { icon: <User className="w-3.5 h-3.5" />, label: "Applicant", value: result.applicantName },
              { icon: <Hash className="w-3.5 h-3.5" />, label: "Agency Type", value: result.agencyType.replace("_", " ") },
              {
                icon: <Calendar className="w-3.5 h-3.5" />,
                label: "Applied On",
                value: new Date(result.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                }),
              },
            ].map((item, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-1 text-gray-400">
                  {item.icon}
                  <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          {result.applicationNoForThisUser > 1 && (
            <div className="px-5 pb-4">
              <p className="text-xs text-gray-400">
                Application attempt #{result.applicationNoForThisUser}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Not found */}
      {searched && !loading && !result && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">No application found</p>
            <p className="text-xs text-gray-400 max-w-xs">
              We couldn't find an application for{" "}
              <span className="font-medium text-gray-600">"{id}"</span>.
              Double-check the ID from your confirmation email and try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}