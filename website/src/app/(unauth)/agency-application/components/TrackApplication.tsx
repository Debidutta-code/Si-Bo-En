"use client";

import { useState } from "react";
import { IAgencyApplication } from "../types/agencyApplication.types";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Loader2, Search, Info, Building2, Briefcase,
  Mail, Phone, FileText, Globe, DollarSign, MapPin, Calendar,
  CheckCircle2, Clock, XCircle, AlertCircle,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { trackAgencyApplicationService } from "../service";
import { useRouter } from "next/navigation";

const statusConfig = {
  pending: {
    heroBg: "bg-amber-50 border-b border-amber-200",
    avatarBg: "bg-amber-200 text-amber-950",
    pill: "bg-amber-50 border border-amber-400 text-amber-800",
    dot: "bg-amber-700",
    stepDone: { circle: "bg-amber-200 border-amber-700", icon: "text-amber-900", label: "text-amber-700" },
    stepActive: { circle: "bg-amber-50 border-amber-400", icon: "text-amber-600", label: "text-amber-600" },
    stepIdle: { circle: "bg-gray-100 border-gray-300", icon: "text-gray-400", label: "text-gray-400" },
    lineDone: "bg-amber-300",
    lineIdle: "bg-gray-200",
    descBg: "bg-amber-50 text-amber-900",
    commTag: "bg-amber-50 text-amber-800",
    label: "Under review",
    sublabel: "Your agency application is being reviewed by our team",
    desc: (email: string) => (
      <>Typically takes <strong className="text-gray-800">2–3 business days</strong>. A decision will be emailed to <strong className="text-gray-800">{email}</strong>.</>
    ),
  },
  approved: {
    heroBg: "bg-green-50 border-b border-green-200",
    avatarBg: "bg-green-200 text-green-950",
    pill: "bg-green-50 border border-green-400 text-green-800",
    dot: "bg-green-700",
    stepDone: { circle: "bg-green-200 border-green-700", icon: "text-green-900", label: "text-green-700" },
    stepActive: { circle: "bg-green-600 border-green-700", icon: "text-white", label: "text-green-800 font-medium" },
    stepIdle: { circle: "bg-gray-100 border-gray-300", icon: "text-gray-400", label: "text-gray-400" },
    lineDone: "bg-green-300",
    lineIdle: "bg-gray-200",
    descBg: "bg-green-50 text-green-900",
    commTag: "bg-green-50 text-green-800",
    label: "Approved",
    sublabel: "Your agency account is ready to use",
    desc: (email: string) => (
      <>Your agency is now active. Login credentials have been sent to <strong className="text-green-800">{email}</strong>. You can start managing bookings right away.</>
    ),
  },
  rejected: {
    heroBg: "bg-red-50 border-b border-red-200",
    avatarBg: "bg-red-200 text-red-950",
    pill: "bg-red-50 border border-red-400 text-red-800",
    dot: "bg-red-700",
    stepDone: { circle: "bg-red-200 border-red-700", icon: "text-red-900", label: "text-red-700" },
    stepActive: { circle: "bg-red-500 border-red-700", icon: "text-white", label: "text-red-800 font-medium" },
    stepIdle: { circle: "bg-gray-100 border-gray-300", icon: "text-gray-400", label: "text-gray-400" },
    lineDone: "bg-red-300",
    lineIdle: "bg-gray-200",
    descBg: "bg-red-50 text-red-900",
    commTag: "bg-red-50 text-red-800",
    label: "Not approved",
    sublabel: "Your application was not approved at this time",
    desc: () => (
      <>Please review the reason below. You&apos;re welcome to reapply after addressing the issue.</>
    ),
  },
};

type StepState = "done" | "active" | "idle";

function StepCircle({
  state,
  cfg,
  icon,
}: {
  state: StepState;
  cfg: (typeof statusConfig)["pending"];
  icon: "check" | "dot" | "cross";
}) {
  const s = state === "done" ? cfg.stepDone : state === "active" ? cfg.stepActive : cfg.stepIdle;
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${s.circle}`}>
      {icon === "check" && (
        <CheckCircle2 className={`w-3.5 h-3.5 ${s.icon}`} />
      )}
      {icon === "dot" && (
        <div className={`w-2 h-2 rounded-full ${state === "active" ? "bg-amber-400" : state === "done" ? "bg-current" : "bg-gray-300"}`} />
      )}
      {icon === "cross" && (
        <XCircle className={`w-3.5 h-3.5 ${s.icon}`} />
      )}
    </div>
  );
}

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

function Field({
  icon,
  label,
  value,
  mono,
  strikethrough,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  strikethrough?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={`p-3.5 bg-white flex flex-col gap-1 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        <span className="w-3 h-3 flex-shrink-0">{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-sm font-medium text-gray-800 ${mono ? "font-mono text-xs" : ""} ${strikethrough ? "line-through text-red-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default function TrackApplication() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IAgencyApplication | null>(null);
  const [searched, setSearched] = useState(false);
  const [id, setId] = useState("");
  const router = useRouter();

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

  const cfg = result ? statusConfig[result.status] : null;

  const initials = result
    ? result.agencyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  // Step states per status
  const steps = {
    pending: { submitted: "done", reviewed: "active", decision: "idle" },
    approved: { submitted: "done", reviewed: "done", decision: "active" },
    rejected: { submitted: "done", reviewed: "done", decision: "active" },
  } as const;

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
        <div className="border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
          <div className="p-5 bg-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-24" />
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                  {i < 3 && <div className="flex-1 h-1 bg-gray-200 rounded" />}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 bg-white space-y-1.5">
                <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3.5 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result card */}
      {result && cfg && !loading && (
        <div className="rounded-2xl border border-gray-200 overflow-hidden">

          {/* Hero */}
          <div className={`p-5 flex flex-col gap-4 ${cfg.heroBg}`}>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-medium flex-shrink-0 tracking-tight ${cfg.avatarBg}`}>
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-[15px] leading-tight">{result.agencyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {result.agencyType.replace("_", " ")} · IATA:{" "}
                    <span className="font-mono">{result.iataCode ?? "—"}</span>
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cfg.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>

            {/* Progress stepper */}
            <div className="flex items-center gap-0">
              {/* Step 1 - Submitted */}
              <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${cfg.stepDone.circle}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${cfg.stepDone.icon}`} />
                </div>
                <span className={`text-[10px] font-medium ${cfg.stepDone.label}`}>Submitted</span>
              </div>
              <div className={`flex-1 h-0.5 mb-4 ${cfg.lineDone}`} />

              {/* Step 2 - Reviewed */}
              <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${steps[result.status].reviewed === "done" ? cfg.stepDone.circle : cfg.stepActive.circle
                  }`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${steps[result.status].reviewed === "done" ? cfg.stepDone.icon : cfg.stepActive.icon
                    }`} />
                </div>
                <span className={`text-[10px] font-medium ${steps[result.status].reviewed === "done" ? cfg.stepDone.label : cfg.stepActive.label
                  }`}>Reviewed</span>
              </div>
              <div className={`flex-1 h-0.5 mb-4 ${result.status !== "pending" ? cfg.lineDone : cfg.lineIdle
                }`} />

              {/* Step 3 - Decision */}
              <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${result.status === "pending" ? cfg.stepIdle.circle : cfg.stepActive.circle
                  }`}>
                  {result.status === "approved" && <CheckCircle2 className={`w-3.5 h-3.5 ${cfg.stepActive.icon}`} />}
                  {result.status === "rejected" && <XCircle className={`w-3.5 h-3.5 ${cfg.stepActive.icon}`} />}
                  {result.status === "pending" && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                </div>
                <span className={`text-[10px] font-medium ${result.status === "pending" ? cfg.stepIdle.label : cfg.stepActive.label
                  }`}>
                  {result.status === "approved" ? "Approved" : result.status === "rejected" ? "Rejected" : "Decision"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4">
            <p className={`text-sm rounded-xl px-4 py-3 ${cfg.descBg}`}>
              {cfg.desc(result.agencyEmail)}
            </p>
          </div>

          {/* Rejection reason */}
          {result.status === "rejected" && result.rejectionReason && (
            <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-red-200">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Reason for rejection</span>
              </div>
              <div className="px-4 py-3 bg-white">
                <p className="text-sm text-gray-700 leading-relaxed">{result.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Section label */}
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-5 pb-2">
            Agency details
          </p>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-100 border-t border-gray-100">
            <Field icon={<Building2 className="w-3 h-3" />} label="Agency name" value={result.agencyName} />
            <Field icon={<Briefcase className="w-3 h-3" />} label="Type" value={result.agencyType.replace("_", " ")} />
            <Field icon={<Mail className="w-3 h-3" />} label="Agency email" value={result.agencyEmail} />
            <Field icon={<Phone className="w-3 h-3" />} label="Contact" value={result.contactNo} />
            <Field icon={<FileText className="w-3 h-3" />} label="Tax number" value={result.taxNo} mono />
            <Field
              icon={<Globe className="w-3 h-3" />}
              label="IATA code"
              value={result.iataCode ?? "—"}
              mono
            />
            <Field
              icon={<DollarSign className="w-3 h-3" />}
              label="Commission"
              value={`${result.commissionValue}${result.commissionType === "percentage" ? "%" : ""} · ${result.commissionCurrency}`}
            />
            <Field icon={<MapPin className="w-3 h-3" />} label="Address" value={result.address} />
          </div>
          {result.status === "rejected" && (
            <div className="px-5 pb-4">
              <button
                onClick={() => router.push("/agency-application/application")}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-sm font-medium transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Reapply now
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Your previous details will not be pre-filled — please fill the form again.
              </p>
            </div>
          )}
          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              Applied {new Date(result.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <span className="font-mono text-[11px] text-gray-400">
              ID: {result.id.slice(0, 8)}
            </span>
          </div>
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
              We couldn&apos;t find an application for{" "}
              <span className="font-medium text-gray-600">&quot;{id}&quot;</span>.
              Double-check the ID from your confirmation email and try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}