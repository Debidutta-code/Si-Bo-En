import { useState } from "react";
import { toast } from "react-hot-toast";
import { languages } from "@/components/language/language";
import { usePropertyContextSafe } from "@/contexts/PropertyContext";
import { upsertPropertyTranslationService } from "../services/property.services";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

export default function AddPropertyDetailsLangDialog({ open, onOpenChange, propertyId }: Props) {
  const [selectedLang, setSelectedLang] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const propertyCtx = usePropertyContextSafe();
  const availableLanguages = propertyCtx?.languages && propertyCtx.languages.length > 0
    ? languages.filter((l) => propertyCtx.languages.some((pl) => pl.language === l.code))
    : languages;

  const handleSave = async () => {
    if (!selectedLang) { toast.error("Please select a language"); return; }
    if (!propertyName && !description) { toast.error("Please provide at least one translated field"); return; }
    
    setLoading(true);
    const payload = {
      [selectedLang]: { propertyName, description }
    };
    
    const res = await upsertPropertyTranslationService(propertyId, payload);
    if (res.success) {
      toast.success("Translation added successfully!");
      setPropertyName("");
      setDescription("");
      setSelectedLang("");
      onOpenChange(false);
    } else {
      toast.error(res.message || "Failed to add translation");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Property Details Translation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Property Name</Label>
            <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
