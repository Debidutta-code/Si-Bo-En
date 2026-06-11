import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { deleteCreationService } from "@/pages/property/service/creation-filter.service";
import { useTranslation } from "react-i18next";

interface DeleteCreationDialogProps {
  name: string;
  id: string;
  type: "group" | "brand" | "property" | "region";
}

export default function DeleteCreationDialog({
  name,
  id,
  type,
}: DeleteCreationDialogProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const typeName = type.charAt(0).toUpperCase() + type.slice(1);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const delRes = await deleteCreationService(id);
      if (delRes.success) {
        toast.success(t("DeleteCreationDialog.toast.deleteSuccess"));
      } else {
        toast.error(delRes.message || t("DeleteCreationDialog.toast.deleteFailed"));
      }

      navigate(-1);
      setOpen(false);
    } catch (err) {
      toast.error(t("DeleteCreationDialog.toast.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="text-right w-48">
          <Trash2 className="h-4 w-4" />
          <span className="ml-2">{t("DeleteCreationDialog.triggerButton", { typeName })}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("DeleteCreationDialog.dialogTitle", { name })}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-destructive">
            {t("DeleteCreationDialog.warning")}
          </p>

          {type === "property" && (
            <p>
              {t("DeleteCreationDialog.property.description", { name })}
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>{t("DeleteCreationDialog.property.items.rooms")}</li>
                <li>{t("DeleteCreationDialog.property.items.ratePlans")}</li>
                <li>{t("DeleteCreationDialog.property.items.reservations")}</li>
                <li>{t("DeleteCreationDialog.property.items.policies")}</li>
                <li>{t("DeleteCreationDialog.property.items.configurations")}</li>
              </ul>
            </p>
          )}

          {(type === "brand" || type === "region") && (
            <p>
              {t("DeleteCreationDialog.brandRegion.description", { name })}
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>
                  <span className="font-semibold">
                    {t("DeleteCreationDialog.brandRegion.items.properties", { type })}
                  </span>
                </li>
                <li>{t("DeleteCreationDialog.brandRegion.items.rooms")}</li>
                <li>{t("DeleteCreationDialog.brandRegion.items.configurations")}</li>
              </ul>
              <span className="text-destructive font-semibold">
                {t("DeleteCreationDialog.brandRegion.danger")}
              </span>
            </p>
          )}

          {type === "group" && (
            <p>
              {t("DeleteCreationDialog.group.description", { name })}
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>
                  <span className="font-semibold">{t("DeleteCreationDialog.group.items.brands")}</span>
                </li>
                <li>
                  <span className="font-semibold">{t("DeleteCreationDialog.group.items.properties")}</span>
                </li>
                <li>{t("DeleteCreationDialog.group.items.rooms")}</li>
                <li>{t("DeleteCreationDialog.group.items.configurations")}</li>
              </ul>
              <span className="text-destructive font-semibold">
                {t("DeleteCreationDialog.group.danger")}
              </span>
            </p>
          )}

          <p className="font-semibold">{t("DeleteCreationDialog.confirmQuestion")}</p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("DeleteCreationDialog.buttons.cancel")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2">{t("DeleteCreationDialog.buttons.deleting")}</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              t("DeleteCreationDialog.buttons.delete")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}