"use client";

import { useRouter } from "next/navigation";
import {
  Building2, Search, FileText,
  CheckCircle2, Users, Globe, ArrowRight,
} from "lucide-react";

const benefits = [
  {
    icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
    bg: "bg-blue-50",
    title: "Competitive Commission",
    desc: "Earn percentage or fixed commissions on every confirmed booking made through our platform.",
  },
  {
    icon: <Users className="w-4 h-4 text-violet-600" />,
    bg: "bg-violet-50",
    title: "Multi-Agent Access",
    desc: "Onboard your entire team. Manage bookings, track performance, and scale operations easily.",
  },
  {
    icon: <Globe className="w-4 h-4 text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Real-Time Inventory",
    desc: "Access live availability and best rates across all our partner properties worldwide.",
  },
];

const steps = [
  { step: "01", title: "Submit Application", desc: "Fill in your agency and personal details." },
  { step: "02", title: "Review Process", desc: "Our team reviews within 2–3 business days." },
  { step: "03", title: "Get Approved", desc: "Receive credentials and start booking instantly." },
];



export default function AgencyApplicationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Now accepting agency applications
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Grow Your Business With<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Our Partner Network
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">
            Join hundreds of travel agencies and corporates earning commissions through our booking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/agency-application/application")}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/agency-application/track-application")}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Search className="w-4 h-4" /> Track Application
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* Benefits */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">
            Why partner with us
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-lg ${b.bg} flex items-center justify-center mb-4`}>
                  {b.icon}
                </div>
                <p className="font-semibold text-gray-900 mb-1.5">{b.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <span className="text-4xl font-black text-gray-100 absolute top-4 right-5">
                  {s.step}
                </span>
                <p className="font-semibold text-gray-900 mb-1.5 relative">{s.title}</p>
                <p className="text-sm text-gray-500 relative">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gray-900 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">New Here?</h3>
            <p className="text-sm text-gray-400 mb-6 flex-1">
              Submit your agency application and join our growing partner network. Takes only 5 minutes.
            </p>
            <button
              onClick={() => router.push("/agency-application/application")}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Start Application <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
              <Building2 className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Already Applied?</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Check the current status of your application — pending, approved, or rejected — with your agency name.
            </p>
            <button
              onClick={() => router.push("/agency-application/track-application")}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              <Search className="w-4 h-4" /> Track Status
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}