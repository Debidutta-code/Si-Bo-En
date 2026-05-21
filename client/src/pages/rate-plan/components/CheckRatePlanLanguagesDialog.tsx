import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import {
  getAllRatePlanTranslationsService,
  deleteRatePlanTranslationLocaleService,
} from "../services/ratePlan-language.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader/Loader";
import { Trash2 } from "lucide-react";

interface CheckRatePlanLanguagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ratePlanId: string;
  /** Optional: when provided, an Edit (pencil) button is shown for each locale row */
  onEdit?: (locale: string, data: Record<string, any>) => void;
}

export default function CheckRatePlanLanguagesDialog({
  open,
  onOpenChange,
  ratePlanId,
  onEdit,
}: CheckRatePlanLanguagesDialogProps) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchTranslations = async () => {
    setLoading(true);
    const res = await getAllRatePlanTranslationsService(ratePlanId);
    if (res.success && res.data) {
      setTranslations(res.data);
    } else {
      setTranslations({});
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && ratePlanId) {
      fetchTranslations();
    }
  }, [open, ratePlanId]);

  const handleDelete = async (locale: string) => {
    setDeleteLoading(locale);
    const res = await deleteRatePlanTranslationLocaleService(ratePlanId, locale);
    if (res.success) {
      toast.success("Translation deleted successfully!");
      const updated = { ...translations };
      delete updated[locale];
      setTranslations(updated);
    } else {
      toast.error(res.message || "Failed to delete translation.");
    }
    setDeleteLoading(null);
  };

  const getLangName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Translations</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader text="Fetching translations..." />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {Object.entries(translations).length === 0 ? (
              <p className="text-center text-gray-500">No translations found.</p>
            ) : (
              Object.entries(translations).map(([locale, data]) => (
                <div
                  key={locale}
                  className="flex justify-between items-start border p-4 rounded-md shadow-sm gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800">{getLangName(locale)}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Name:</span> {data.ratePlanName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Edit translation"
                        onClick={() => onEdit(locale, data)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleDelete(locale)}
                      disabled={deleteLoading === locale}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
