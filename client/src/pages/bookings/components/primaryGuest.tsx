"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { IPrimaryGuest } from "../types";
import { Mail, Phone, MapPin, FileText, Shield, Download } from "lucide-react";

interface PrimaryGuestDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  primaryGuest: IPrimaryGuest | null;
}

export default function PrimaryGuestDetailsDialog({
  isOpen,
  onOpenChange,
  primaryGuest,
}: PrimaryGuestDetailsDialogProps) {
  if (!primaryGuest) return null;

  const handleDownloadIdentityImage = async () => {
    if (!primaryGuest.identityCardImage) return;

    try {
      const response = await fetch(primaryGuest.identityCardImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${primaryGuest.firstName}_${primaryGuest.lastName}_identity_card.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {primaryGuest.firstName} {primaryGuest.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {primaryGuest.isALoyalityGuest && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <Shield className="w-3 h-3 mr-1" />
                Loyalty Guest
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {primaryGuest.userType}
            </Badge>
          </div>

          {/* Contact Information Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm w-24">Email:</span>
                <p className="text-gray-900 font-medium text-sm break-all">
                  {primaryGuest.email}
                </p>
              </div>
              {primaryGuest.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 text-sm w-20">Phone:</span>
                  <p className="text-gray-900 font-medium text-sm">
                    {primaryGuest.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information Card */}
          {(primaryGuest.address ||
            primaryGuest.city ||
            primaryGuest.state ||
            primaryGuest.country ||
            primaryGuest.zipCode) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Address Information
              </h3>
              <div className="space-y-2 text-sm">
                {primaryGuest.address && (
                  <p className="text-gray-900">
                    <span className="text-gray-600 font-medium">Street: </span>
                    {primaryGuest.address}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {primaryGuest.city && (
                    <p className="text-gray-900">
                      <span className="text-gray-600 font-medium">City: </span>
                      {primaryGuest.city}
                    </p>
                  )}
                  {primaryGuest.state && (
                    <p className="text-gray-900">
                      <span className="text-gray-600 font-medium">State: </span>
                      {primaryGuest.state}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {primaryGuest.country && (
                    <p className="text-gray-900">
                      <span className="text-gray-600 font-medium">Country: </span>
                      {primaryGuest.country}
                    </p>
                  )}
                  {primaryGuest.zipCode && (
                    <p className="text-gray-900">
                      <span className="text-gray-600 font-medium">ZIP: </span>
                      {primaryGuest.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(primaryGuest.userIdentityCardType ||
            primaryGuest.identityCardNumber ||
            primaryGuest.identityCardImage) && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Identity Information
              </h3>
              <div className="space-y-3">
                {primaryGuest.userIdentityCardType && (
                  <div>
                    <p className="text-gray-600 text-sm font-medium">ID Type</p>
                    <p className="text-gray-900 text-sm capitalize mt-1">
                      {primaryGuest.userIdentityCardType.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
                {primaryGuest.identityCardNumber && (  
                  <div>
                    <p className="text-gray-600 text-sm font-medium">ID Number</p>
                    <p className="text-gray-900 text-sm font-mono mt-1">
                      {primaryGuest.identityCardNumber}
                    </p>
                  </div>
                )}
                {primaryGuest.identityCardImage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm font-medium">
                        ID Document
                      </p>
                      <button
                        onClick={handleDownloadIdentityImage}
                        className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                    <div className="relative bg-white rounded-lg border-2 border-dashed border-purple-200 p-2 overflow-hidden">
                      <img
                        src={primaryGuest.identityCardImage}
                        alt="Identity Document"
                        className="w-full h-auto rounded max-h-96 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
