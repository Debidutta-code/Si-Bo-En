import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────────────────────
// Generic {t("Common.addTranslation")} Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface Field {
  key: string;
  label: string;
  placeholder?: string;
}

interface AddTranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  title: string;
  fields: Field[];
  onSave: (id: string, locale: string, data: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
  /** When provided, only these language codes are shown in the dropdown (property active languages) */
  allowedLanguageCodes?: string[];
}

export function AddTranslationDialog({ open, onOpenChange, entityId, title, fields, onSave, allowedLanguageCodes }: AddTranslationDialogProps) {
  const [selectedLang, setSelectedLang] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const availableLanguages = allowedLanguageCodes && allowedLanguageCodes.length > 0
    ? languages.filter((l) => allowedLanguageCodes.includes(l.code))
    : languages;

  useEffect(() => {
    if (!open) {
      setSelectedLang("");
      setFieldValues({});
    }
  }, [open]);

  const handleSave = async () => {
    if (!selectedLang) { toast.error("Please select a language"); return; }
    const hasValue = Object.values(fieldValues).some((v) => v.trim());
    if (!hasValue) { toast.error("Please fill in at least one field"); return; }

    setLoading(true);
    const res = await onSave(entityId, selectedLang, fieldValues);
    if (res.success) {
      toast.success("Translation saved successfully!");
      onOpenChange(false);
    } else {
      toast.error(res.message || "Failed to save translation");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("AddCreationLanguageDialog.form.languageLabel")}</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                placeholder={field.placeholder || field.label}
                value={fieldValues[field.key] || ""}
                onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{t("Common.cancel")}</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? t("Common.saving") : t("Common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Edit Translation Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface EditTranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  locale: string;
  initialData: Record<string, any>;
  title: string;
  fields: Field[];
  onSave: (id: string, locale: string, data: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
}

export function EditTranslationDialog({
  open,
  onOpenChange,
  entityId,
  locale,
  initialData,
  title,
  fields,
  onSave,
}: EditTranslationDialogProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const languageName = languages.find((l) => l.code === locale)?.name || locale;
const {t}=useTranslation();
  // Re-populate whenever the dialog opens with new data
  useEffect(() => {
    if (open && initialData) {
      const prefilled: Record<string, string> = {};
      fields.forEach((f) => { prefilled[f.key] = initialData[f.key] ?? ""; });
      setFieldValues(prefilled);
    }
  }, [open, locale, initialData]);

  const handleUpdate = async () => {
    const hasValue = Object.values(fieldValues).some((v) => v?.trim());
    if (!hasValue) { toast.error("Please fill in at least one field"); return; }

    setLoading(true);
    const res = await onSave(entityId, locale, fieldValues);
    if (res.success) {
      toast.success("Translation updated successfully!");
      onOpenChange(false);
      // Refresh so the updated translation is immediately visible
      window.location.reload();
    } else {
      toast.error(res.message || "Failed to update translation");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title} — {languageName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Locale badge — read-only */}
          <div className="space-y-1">
            <Label>{t("Common.language")}</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted text-sm font-medium">
              {languageName}
              <span className="ml-auto text-xs text-muted-foreground uppercase tracking-wide">{locale}</span>
            </div>
          </div>
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                placeholder={field.placeholder || field.label}
                value={fieldValues[field.key] ?? ""}
                onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{t("Common.cancel")}</Button>
          <Button onClick={handleUpdate} disabled={loading}>{loading ? t("EditBrandTranslation.updating") : t("EditBrandTranslation.update")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic {t("Common.checkTranslation")} Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface CheckTranslationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  title: string;
  displayFields: { key: string; label: string }[];
  onFetch: (id: string) => Promise<{ success: boolean; data?: Record<string, any>; message?: string }>;
  onDelete: (id: string, locale: string) => Promise<{ success: boolean; message?: string }>;
  /** Optional: when provided, an Edit (pencil) button is shown for each locale row */
  onEdit?: (locale: string, data: Record<string, any>) => void;
}

export function CheckTranslationsDialog({ open, onOpenChange, entityId, title, displayFields, onFetch, onDelete, onEdit }: CheckTranslationsDialogProps) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && entityId) {
      setLoading(true);
      onFetch(entityId).then((res) => {
        if (res.success && res.data) setTranslations(res.data);
        else setTranslations({});
        setLoading(false);
      });
    }
  }, [open, entityId]);

  const handleDelete = async (locale: string) => {
    const res = await onDelete(entityId, locale);
    if (res.success) {
      toast.success("Translation deleted!");
      const updated = { ...translations };
      delete updated[locale];
      setTranslations(updated);
    } else {
      toast.error(res.message || "Failed to delete");
    }
  };

  const getLangName = (code: string) => languages.find((l) => l.code === code)?.name || code;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          {loading && <p className="text-center text-gray-500 py-4">Loading translations...</p>}
          {!loading && Object.keys(translations).length === 0 && (
            <p className="text-center text-gray-500 py-4">No translations found.</p>
          )}
          {!loading && Object.entries(translations).map(([locale, data]) => (
            <div key={locale} className="flex justify-between items-start border rounded-lg p-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{getLangName(locale)}</p>
                {displayFields.map((f) => data[f.key] && (
                  <p key={f.key} className="text-xs text-gray-600 truncate">
                    <span className="font-medium">{f.label}:</span> {data[f.key]}
                  </p>
                ))}
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
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(locale)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
