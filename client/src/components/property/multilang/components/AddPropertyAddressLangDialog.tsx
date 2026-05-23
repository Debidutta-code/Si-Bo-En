import { useState } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import { usePropertyContextSafe } from "@/contexts/PropertyContext";
import { upsertPropertyAddressTranslationService } from "../services/property-address.services";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyAddressId: string;
}

export default function AddPropertyAddressLangDialog({ open, onOpenChange, propertyAddressId }: Props) {
  const { t } = useTranslation();

  const [selectedLang, setSelectedLang] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages =
    propertyCtx?.languages && propertyCtx.languages.length > 0
      ? languages.filter((l) => propertyCtx.languages.some((pl) => pl.language === l.code))
      : languages;

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error(t("AddPropertyAddressLangDialog.toast.languageRequired"));
      return;
    }

    setLoading(true);
    const payload = {
      [selectedLang]: { addressLine1, addressLine2, country, state, city, location, landmark },
    };

    const res = await upsertPropertyAddressTranslationService(propertyAddressId, payload);
    if (res.success) {
      toast.success(t("AddPropertyAddressLangDialog.toast.saveSuccess"));
      setAddressLine1(""); setAddressLine2(""); setCountry(""); setState("");
      setCity(""); setLocation(""); setLandmark(""); setSelectedLang("");
      onOpenChange(false);
    } else {
      toast.error(res.message || t("AddPropertyAddressLangDialog.toast.saveFailed"));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("AddPropertyAddressLangDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>{t("AddPropertyAddressLangDialog.form.languageLabel")}</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger>
                <SelectValue placeholder={t("AddPropertyAddressLangDialog.form.languagePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>{t("AddPropertyAddressLangDialog.form.addressLine1")}</Label>
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>{t("AddPropertyAddressLangDialog.form.addressLine2")}</Label>
            <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("AddPropertyAddressLangDialog.form.city")}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("AddPropertyAddressLangDialog.form.state")}</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("AddPropertyAddressLangDialog.form.country")}</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("AddPropertyAddressLangDialog.form.location")}</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>{t("AddPropertyAddressLangDialog.form.landmark")}</Label>
            <Input value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("AddPropertyAddressLangDialog.buttons.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("AddPropertyAddressLangDialog.buttons.saving") : t("AddPropertyAddressLangDialog.buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}