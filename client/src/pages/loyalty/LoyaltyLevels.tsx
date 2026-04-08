import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Award,
  Percent,
  Shield,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/Loader/Loader";
import {
  getLoyalityLevelsService,
  createLoyalityLevelService,
  updateLoyalityLevelService,
  deleteLoyalityLevelService,
  getLoyalityByCreationService,
} from "./services";
import type { ILoyalityLevels } from "./interfaces";

interface ILoader {
  isLoading: boolean;
  message: string;
}

interface LevelForm {
  level: number;
  discountPercentage: number;
}

const TIER_COLORS: Record<number, { bg: string; badge: string; icon: string }> = {
  1: {
    bg: "from-amber-50 to-yellow-50 border-amber-200",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "text-amber-500",
  },
  2: {
    bg: "from-slate-50 to-gray-50 border-slate-300",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    icon: "text-slate-500",
  },
  3: {
    bg: "from-orange-50 to-amber-50 border-orange-200",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    icon: "text-orange-500",
  },
};

const getTierStyle = (level: number) =>
  TIER_COLORS[level] ?? {
    bg: "from-violet-50 to-purple-50 border-violet-200",
    badge: "bg-violet-100 text-violet-800 border-violet-300",
    icon: "text-violet-500",
  };

const TIER_LABELS: Record<number, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
  5: "Diamond",
};

const getTierLabel = (level: number) => TIER_LABELS[level] ?? `Level ${level}`;

export default function LoyaltyLevels() {
  const { creationId } = useParams();
  const navigate = useNavigate();

  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty levels...",
  });
  const [submitting, setSubmitting] = useState(false);
  const [levels, setLevels] = useState<ILoyalityLevels[]>([]);
  // The actual CreationLoyaltyConfig.id — resolved from creationId on mount
  const [programId, setProgramId] = useState<string | null>(null);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ILoyalityLevels | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ILoyalityLevels | null>(null);

  // Form state
  const [form, setForm] = useState<LevelForm>({
    level: 1,
    discountPercentage: 0,
  });

  useEffect(() => {
    if (creationId) {
      resolveProgramId();
    }
  }, [creationId]);

  // Step 1: resolve the actual loyaltyProgramId (CreationLoyaltyConfig.id)
  const resolveProgramId = async () => {
    if (!creationId) return;
    setLoader({ isLoading: true, message: "Loading loyalty configuration..." });
    try {
      const response = await getLoyalityByCreationService(creationId);
      if (response.success && response.data?.id) {
        setProgramId(response.data.id);
        await fetchLevels(response.data.id);
      } else {
        toast.error(response.message || "Loyalty configuration not found");
        setLoader({ isLoading: false, message: "" });
      }
    } catch {
      toast.error("Failed to load loyalty configuration");
      setLoader({ isLoading: false, message: "" });
    }
  };

  // Step 2: fetch levels using the resolved loyaltyProgramId
  const fetchLevels = async (pid?: string) => {
    const id = pid ?? programId;
    if (!id) return;
    setLoader({ isLoading: true, message: "Loading loyalty levels..." });
    try {
      const response = await getLoyalityLevelsService(id);
      if (response.success) {
        const sorted = [...(response.data ?? [])].sort(
          (a: ILoyalityLevels, b: ILoyalityLevels) => a.level - b.level
        );
        setLevels(sorted);
      } else {
        toast.error(response.message || "Failed to fetch loyalty levels");
      }
    } catch {
      toast.error("Failed to fetch loyalty levels");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const openCreate = () => {
    if (!programId) {
      toast.error("Loyalty configuration not loaded yet");
      return;
    }
    const nextLevel =
      levels.length > 0
        ? Math.max(...levels.map((l) => l.level)) + 1
        : 1;
    setEditingLevel(null);
    setForm({ level: nextLevel, discountPercentage: 0 });
    setIsFormOpen(true);
  };

  const openEdit = (level: ILoyalityLevels) => {
    setEditingLevel(level);
    setForm({
      level: level.level,
      discountPercentage: level.discountPercentage,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!programId) return;

    if (form.level < 1) {
      toast.error("Level must be 1 or greater");
      return;
    }
    if (form.discountPercentage < 0 || form.discountPercentage > 100) {
      toast.error("Discount percentage must be between 0 and 100");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        level: form.level,
        discountPercentage: form.discountPercentage,
        loyaltyProgramId: programId,
      };

      const response = editingLevel
        ? await updateLoyalityLevelService(editingLevel.id, payload)
        : await createLoyalityLevelService(payload);

      if (response.success) {
        toast.success(
          editingLevel
            ? "Level updated successfully"
            : "Level created successfully"
        );
        setIsFormOpen(false);
        await fetchLevels();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const response = await deleteLoyalityLevelService(deleteTarget.id);
      if (response.success) {
        toast.success("Level deleted successfully");
        setDeleteTarget(null);
        await fetchLevels();
      } else {
        toast.error(response.message || "Failed to delete level");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              Loyalty Levels
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Define membership tiers with associated discount percentages for
              this loyalty program.
            </p>
          </div>
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Level
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {levels.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Levels</p>
              <p className="text-2xl font-bold">{levels.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Max Discount</p>
              <p className="text-2xl font-bold text-green-700">
                {Math.max(...levels.map((l) => l.discountPercentage))}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Min Discount</p>
              <p className="text-2xl font-bold text-blue-700">
                {Math.min(...levels.map((l) => l.discountPercentage))}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Highest Tier</p>
              <p className="text-2xl font-bold text-violet-700">
                {getTierLabel(Math.max(...levels.map((l) => l.level)))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Levels Grid */}
      {levels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Award className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No levels defined yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Create your first loyalty level to start defining membership tiers
              and their associated discounts.
            </p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Level
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const style = getTierStyle(level.level);
            return (
              <Card
                key={level.id}
                className={`bg-gradient-to-br ${style.bg} transition-all hover:shadow-md`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-md bg-white/60 shadow-sm`}
                      >
                        <Shield className={`w-5 h-5 ${style.icon}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {getTierLabel(level.level)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Level {level.level}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${style.badge}`}
                    >
                      Tier {level.level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-white/60 rounded-lg">
                    <Percent className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground leading-none mb-0.5">
                        Discount
                      </p>
                      <p className="text-xl font-bold leading-none">
                        {level.discountPercentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/70 hover:bg-white"
                      onClick={() => openEdit(level)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/70 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() => setDeleteTarget(level)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {editingLevel ? "Edit Loyalty Level" : "Create Loyalty Level"}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? "Update the tier number or discount percentage for this level."
                : "Define a new membership tier and its associated discount."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="level-number">
                Level Number{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (1 = lowest tier)
                </span>
              </Label>
              <Input
                id="level-number"
                type="number"
                min={1}
                value={form.level}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    level: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="e.g. 1"
              />
              {form.level >= 1 && (
                <p className="text-xs text-muted-foreground">
                  This will be the{" "}
                  <span className="font-medium text-foreground">
                    {getTierLabel(form.level)}
                  </span>{" "}
                  tier
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-pct">
                Discount Percentage{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (0–100)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="discount-pct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.discountPercentage}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g. 10"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editingLevel ? (
                "Update Level"
              ) : (
                "Create Level"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete{" "}
              {deleteTarget ? getTierLabel(deleteTarget.level) : ""} Level
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                Level {deleteTarget?.level} ({deleteTarget?.discountPercentage}% discount)
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "Deleting..." : "Delete Level"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
