"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import AgencyApplicationForm from "../components/AgencyApplicationForm";
import { BackButton } from "../components/BackButton";

export default function ApplicationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <BackButton onClick={() => router.push("/agency-application")} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Agency Application</h2>
                <p className="text-sm text-gray-300">Takes about 5 minutes to complete</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <AgencyApplicationForm onSuccess={() => router.push("/agency-application/track-application")} />
          </div>
        </div>
      </div>
    </div>
  );
}