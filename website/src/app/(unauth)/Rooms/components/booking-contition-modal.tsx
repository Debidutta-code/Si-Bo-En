"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

interface BookingConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingConditionsModal = ({
  open,
  onOpenChange,
}: BookingConditionsModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {t("Rooms.modal.title")}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t("Rooms.modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t("Rooms.modal.guarantee.title")}
            </h4>
            <p className="text-blue-700 text-sm">
              {t("Rooms.modal.guarantee.description")}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              {t("Rooms.modal.keyConditions")}
            </h4>
            <ul className="space-y-2 text-gray-700">
              {(["one", "two", "three", "four", "five"] as const).map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>{t(`Rooms.modal.conditions.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>{t("Rooms.modal.note")}</strong>{" "}
              {t("Rooms.modal.noteText")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};