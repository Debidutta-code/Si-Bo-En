import { useState } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import { usePropertyContextSafe } from "@/contexts/PropertyContext";
import { upsertRoomTranslationService } from "../services/room.services";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  onSuccess?: () => void;
}

export default function AddRoomLangDialog({ open, onOpenChange, roomId, onSuccess }: Props) {
  const { t } = useTranslation();

  const [selectedLang, setSelectedLang] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages =
    propertyCtx?.languages && propertyCtx.languages.length > 0
      ? languages.filter((l) => propertyCtx.languages.some((pl) => pl.language === l.code))
      : languages;

  const resetForm = () => {
    setSelectedLang("");
    setRoomName("");
    setRoomType("");
    setDescription("");
  };

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error(t("AddRoomLangDialog.toast.languageRequired"));
      return;
    }
    if (!roomName && !description) {
      toast.error(t("AddRoomLangDialog.toast.fieldRequired"));
      return;
    }

    setLoading(true);
    const payload = {
      [selectedLang]: { roomName, roomType, description },
    };

    const res = await upsertRoomTranslationService(roomId, payload);
    if (res.success) {
      toast.success(t("AddRoomLangDialog.toast.saveSuccess"));
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(res.message || t("AddRoomLangDialog.toast.saveFailed"));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("AddRoomLangDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Language selector */}
          <div className="space-y-2">
            <Label>{t("Common.language")}</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger>
                <SelectValue placeholder={t("AddRoomLangDialog.form.languagePlaceholder")} />
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

          {/* Room Name */}
          <div className="space-y-2">
            <Label>{t("AddRoomLangDialog.form.roomName")}</Label>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={t("AddRoomLangDialog.form.roomNamePlaceholder")}
            />
          </div>



          {/* Description */}
          <div className="space-y-2">
            <Label>{t("Common.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("AddRoomLangDialog.form.descriptionPlaceholder")}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { resetForm(); onOpenChange(false); }}
            disabled={loading}
          >
            {t("Common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("Common.saving") : t("Common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}