import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { languages } from "@/components/language/language";
import { usePropertyContextSafe } from "@/contexts/PropertyContext";
import { upsertRatePlanTranslationService } from "../services/ratePlan-language.service";
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

interface AddRatePlanLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ratePlanId: string;
}

export default function AddRatePlanLanguageDialog({
  open,
  onOpenChange,
  ratePlanId,
}: AddRatePlanLanguageDialogProps) {
  const { t } = useTranslation("AddRatePlanLanguageDialog");

  const [selectedLang, setSelectedLang] = useState("");
  const [ratePlanName, setRatePlanName] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages =
    propertyCtx?.languages && propertyCtx.languages.length > 0
      ? languages.filter((l) =>
          propertyCtx.languages.some((pl) => pl.language === l.code)
        )
      : languages;

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error(t("RatePlan.AddRatePlanLanguageDialog.toast.selectLanguage"));
      return;
    }
    if (!ratePlanName.trim()) {
      toast.error(t("RatePlan.AddRatePlanLanguageDialog.toast.nameRequired"));
      return;
    }

    setLoading(true);
    const payload = { [selectedLang]: { ratePlanName } };

    const res = await upsertRatePlanTranslationService(ratePlanId, payload);
    if (res.success) {
      toast.success(t("RatePlan.AddRatePlanLanguageDialog.toast.saveSuccess"));
      setRatePlanName("");
      setSelectedLang("");
      onOpenChange(false);
    } else {
      toast.error(res.message || t("RatePlan.AddRatePlanLanguageDialog.toast.saveFailed"));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("RatePlan.AddRatePlanLanguageDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("RatePlan.AddRatePlanLanguageDialog.form.languageLabel")}</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger>
                <SelectValue placeholder={t("RatePlan.AddRatePlanLanguageDialog.form.languagePlaceholder")} />
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
            <Label>{t("RatePlan.AddRatePlanLanguageDialog.form.nameLabel")}</Label>
            <Input
              placeholder={t("RatePlan.AddRatePlanLanguageDialog.form.namePlaceholder")}
              value={ratePlanName}
              onChange={(e) => setRatePlanName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("RatePlan.AddRatePlanLanguageDialog.form.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("RatePlan.AddRatePlanLanguageDialog.form.saving") : t("RatePlan.AddRatePlanLanguageDialog.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}