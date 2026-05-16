import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import {
  getAllCreationTranslationsService,
  deleteCreationTranslationLocaleService,
} from "@/pages/property/service/creation-lang.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader/Loader";

interface CheckCreationLanguagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creationId: string;
}

export default function CheckCreationLanguagesDialog({
  open,
  onOpenChange,
  creationId,
}: CheckCreationLanguagesDialogProps) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchTranslations = async () => {
    setLoading(true);
    const res = await getAllCreationTranslationsService(creationId);
    if (res.success && res.data) {
      setTranslations(res.data);
    } else {
      setTranslations({});
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && creationId) {
      fetchTranslations();
    }
  }, [open, creationId]);

  const handleDelete = async (locale: string) => {
    setDeleteLoading(locale);
    const res = await deleteCreationTranslationLocaleService(creationId, locale);
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
                  className="flex justify-between items-center border p-4 rounded-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-gray-800">{getLangName(locale)}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Name:</span> {data.name}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(locale)}
                    disabled={deleteLoading === locale}
                  >
                    {deleteLoading === locale ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
