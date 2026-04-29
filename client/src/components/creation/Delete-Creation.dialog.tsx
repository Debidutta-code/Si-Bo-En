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
interface DeleteCreationDialogProps {
  name: string;
  id: string;
  type:"group"|"brand"|"property"|"region"
}

export default function DeleteCreationDialog({
  name,
  id,
  type
}: DeleteCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const delRes=await deleteCreationService(id);
      if(delRes.success){
        toast.success("Property deleted successfully");
      }else{
        toast.error(delRes.message || "Failed to delete property");
      }
      
      navigate(-1); 
      setOpen(false);
    } catch (err) {
      
      toast.error("An error occurred while deleting the property");

    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="text-right">
          <Trash2 className="h-4 w-4" />
          <span className="ml-2">Delete {type.charAt(0).toUpperCase()}{type.slice(1)}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-destructive">
            ⚠️ This action cannot be undone!
          </p>
          
          {type === "property" && (
            <p>
              Deleting this property will permanently remove <span className="font-semibold">{name}</span> and all associated data including:
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>All rooms and room configurations</li>
                <li>All rate plans and pricing</li>
                <li>All reservations and booking history</li>
                <li>All policies, taxes, and add-ons</li>
                <li>All property configurations</li>
              </ul>
            </p>
          )}
          
          {(type === "brand" ||type =="region")&& (
            <p>
              Deleting this brand will permanently remove <span className="font-semibold">{name}</span> and cascade delete:
              <ul className="list-disc list-inside ml-2 mt-1">
                <li><span className="font-semibold">All properties under this {type}</span></li>
                <li>All rooms, rate plans, and reservations for each property</li>
                <li>All configurations, policies, and data associated with these properties</li>
              </ul>
              <span className="text-destructive font-semibold">This will delete multiple properties and all their data!</span>
            </p>
          )}
          
          {type === "group" && (
            <p>
              Deleting this group will permanently remove <span className="font-semibold">{name}</span> and cascade delete:
              <ul className="list-disc list-inside ml-2 mt-1">
                <li><span className="font-semibold">All brands under this group</span></li>
                <li><span className="font-semibold">All properties under this group and its brands</span></li>
                <li>All rooms, rate plans, and reservations for all properties</li>
                <li>All configurations, policies, and data across the entire group</li>
              </ul>
              <span className="text-destructive font-semibold">This will delete the entire group hierarchy and all associated data!</span>
            </p>
          )}
          
          <p className="font-semibold">
            Are you sure you want to proceed with this deletion?
          </p>
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Deleting...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}