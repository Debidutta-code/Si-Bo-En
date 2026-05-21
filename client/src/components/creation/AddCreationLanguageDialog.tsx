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
  const [selectedLang, setSelectedLang] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages = propertyCtx?.languages && propertyCtx.languages.length > 0
    ? languages.filter((l) => propertyCtx.languages.some((pl) => pl.language === l.code))
    : languages;

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error("Please select a language.");
      return;
    }
    if (!name.trim()) {
      toast.error("Translated name is required.");
      return;
    }

    setLoading(true);
    const payload = {
      [selectedLang]: { name },
    };

    const res = await upsertCreationTranslationService(creationId, payload);
    if (res.success) {
      toast.success("Translation added successfully!");
      setName("");
      setSelectedLang("");
      onOpenChange(false);
    } else {
      toast.error(res.message || "Failed to add translation.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Name Translation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
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
            <Label>Translated Name</Label>
            <Input
              placeholder="e.g., Mi Grupo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Translation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
