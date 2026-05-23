import { useState } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import { usePropertyContextSafe } from "@/contexts/PropertyContext";
import { upsertCreationTranslationService } from "@/pages/property/service/creation-lang.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface AddCreationLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creationId: string;
}

export default function AddCreationLanguageDialog({
  open,
  onOpenChange,
  creationId,
}: AddCreationLanguageDialogProps) {
  const { t } = useTranslation();

  const [selectedLang, setSelectedLang] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages =
    propertyCtx?.languages && propertyCtx.languages.length > 0
      ? languages.filter((l) => propertyCtx.languages.some((pl) => pl.language === l.code))
      : languages;

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error(t("AddCreationLanguageDialog.toast.languageRequired"));
      return;
    }
    if (!name.trim()) {
      toast.error(t("AddCreationLanguageDialog.toast.nameRequired"));
      return;
    }

    setLoading(true);
    const payload = { [selectedLang]: { name } };

    const res = await upsertCreationTranslationService(creationId, payload);
    if (res.success) {
      toast.success(t("AddCreationLanguageDialog.toast.saveSuccess"));
      setName("");
      setSelectedLang("");
      onOpenChange(false);
    } else {
      toast.error(res.message || t("AddCreationLanguageDialog.toast.saveFailed"));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("AddCreationLanguageDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("AddCreationLanguageDialog.form.languageLabel")}</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger>
                <SelectValue placeholder={t("AddCreationLanguageDialog.form.languagePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("AddCreationLanguageDialog.form.translatedNameLabel")}</Label>
            <Input
              placeholder={t("AddCreationLanguageDialog.form.translatedNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("AddCreationLanguageDialog.buttons.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("AddCreationLanguageDialog.buttons.saving") : t("AddCreationLanguageDialog.buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}