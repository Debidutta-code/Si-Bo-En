import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CreateRatePlan, RatePlan, LoaderProps } from "./interfaces"
import BackButton from "@/components/shared/BackButton";
import Loader from "@/components/Loader/Loader";
import { createRatePlanService, fetchRatePlansService, removeRatePlanService, updateRatePlanService } from "./services";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Plus, Package } from "lucide-react"; // ✅ ADDED Package
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RatePlanRulesDialog from "./components/ratePlanRuleForm";
import ManageRateWithAddonsForm from "./components/ManageRateWithAddonsForm"; // ✅ ADDED

export default function RatePlan() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [allRatePlans, setAllRatePlans] = useState<RatePlan[]>([]);
  const [newRatePlan, setNewRatePlan] = useState<CreateRatePlan>(
    {
      ratePlanName: "",
      b2bAvailable: false,
      b2cAvailable: true
    });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });
  const [editRatePlanData, setEditRatePlanData] = useState<CreateRatePlan>({
    ratePlanName: "",
    b2bAvailable: false,
    b2cAvailable: true
  });
  const [rulesDialog, setRulesDialog] = useState<{ 
    open: boolean; 
    ratePlan: RatePlan | null 
  }>({
    open: false,
    ratePlan: null,
  });
  
  // ✅ ADDED: State for managing addons dialog
  const [addonsDialog, setAddonsDialog] = useState<{ 
    open: boolean; 
    ratePlan: RatePlan | null 
  }>({
    open: false,
    ratePlan: null,
  });
  
  const [loader, setLoader] = useState<LoaderProps>({ isLoading: false, text: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });

  useEffect(() => {
    fetchRatePlans();
  }, [propertyId]);

  const fetchRatePlans = async () => {
    if (!propertyId) {
      toast.error("Property ID is missing");
      return;
    }
    try {
      setLoader({ isLoading: true, text: "Fetching Rate Plans..." });
      const ratePlans = await fetchRatePlansService(propertyId);
      if (ratePlans.success) {
        // toast.success(ratePlans.message || "Rate Plans fetched successfully");
        setAllRatePlans(ratePlans.data || []);
      } else {
        toast.error(ratePlans.message || "Failed to fetch Rate Plans");
      }
    } catch (error) {
      toast.error("Failed to fetch Rate Plans");
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  };

  const createRatePlan = async () => {
    if (!propertyId) {
      toast.error("Property ID is missing");
      return;
    }
    if (!newRatePlan.ratePlanName.trim()) {
      toast.error("Rate plan name is required");
      return;
    }
    try {
      setLoader({ isLoading: true, text: "Creating Rate Plan..." });
      const response = await createRatePlanService(propertyId, newRatePlan);
      if (response.success) {
        toast.success(response.message || "Rate Plan created successfully");
        setNewRatePlan({ ratePlanName: "", b2bAvailable: false, b2cAvailable: true });
        setCreateDialogOpen(false);
        fetchRatePlans();
      } else {
        toast.error(response.message || "Failed to create Rate Plan");
      }
    } catch (error) {
      toast.error("Failed to create Rate Plan");
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  }

  const deleteRatePlan = async (ratePlanCode: string) => {
    if (!propertyId) {
      toast.error("Property ID is missing");
      return;
    }
    try {
      setLoader({ isLoading: true, text: "Deleting Rate Plan..." });
      const response = await removeRatePlanService(ratePlanCode);
      if (response.success) {
        toast.success(response.message || "Rate Plan deleted successfully");
        fetchRatePlans();
      } else {
        toast.error(response.message || "Failed to delete Rate Plan");
      }
    } catch (error) {
      toast.error("Failed to delete Rate Plan");
    } finally {
      setLoader({ isLoading: false, text: "" });
      setDeleteDialog({ open: false, ratePlan: null });
    }
  }

  const handleDeleteClick = (ratePlan: RatePlan) => {
    setDeleteDialog({ open: true, ratePlan });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.ratePlan) {
      deleteRatePlan(deleteDialog.ratePlan.ratePlanCode);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, ratePlan: null });
  };

  const handleEdit = (ratePlan: RatePlan) => {
    setEditDialog({ open: true, ratePlan });
    setEditRatePlanData({
      ratePlanName: ratePlan.ratePlanName,
      b2bAvailable: ratePlan.b2bAvailable,
      b2cAvailable: ratePlan.b2cAvailable
    });
  };

  const handleUpdateRatePlan = async () => {
    if (!editDialog.ratePlan) return;

    if (!editRatePlanData.ratePlanName.trim()) {
      toast.error("Rate plan name is required");
      return;
    }

    try {
      setLoader({ isLoading: true, text: "Updating Rate Plan..." });
      const response = await updateRatePlanService(
        editDialog.ratePlan.ratePlanCode,
        editRatePlanData
      );

      if (response.success) {
        toast.success(response.message || "Rate Plan updated successfully");
        setEditDialog({ open: false, ratePlan: null });
        setEditRatePlanData({
          ratePlanName: "",
          b2bAvailable: false,
          b2cAvailable: true
        });
        fetchRatePlans();
      } else {
        toast.error(response.message || "Failed to update Rate Plan");
      }
    } catch (error) {
      toast.error("Failed to update Rate Plan");
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  };

  const handleCancelEdit = () => {
    setEditDialog({ open: false, ratePlan: null });
    setEditRatePlanData({
      ratePlanName: "",
      b2bAvailable: false,
      b2cAvailable: true
    });
  };

  const handleAddRulesClick = (ratePlan: RatePlan) => {
    setRulesDialog({ open: true, ratePlan });
  };

  const handleRulesSuccess = () => {
    fetchRatePlans();
    setRulesDialog({ open: false, ratePlan: null });
  };

  // ✅ ADDED: Handler for managing addons
  const handleManageAddonsClick = (ratePlan: RatePlan) => {
    setAddonsDialog({ open: true, ratePlan });
  };

  if (loader.isLoading) {
    return (
      <div className='min-h-screen w-full flex justify-center items-center'>
        <Loader text={loader.text} />
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-6 max-w-7xl">
        <BackButton />

        <div className="mt-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rate Plans</h1>
            <p className="text-gray-600 mt-1 text-sm">Manage your property rate plans</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Rate Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Rate Plan</DialogTitle>
                <DialogDescription>
                  Add a new rate plan for your property. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ratePlanName">
                    Rate Plan Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ratePlanName"
                    value={newRatePlan.ratePlanName}
                    onChange={(e) => setNewRatePlan({ ...newRatePlan, ratePlanName: e.target.value })}
                    placeholder="e.g., Standard Rate, Weekend Special"
                    className="col-span-3"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="b2b-available">B2B Available</Label>
                      <p className="text-xs text-gray-500">
                        Enable this rate plan for business-to-business bookings
                      </p>
                    </div>
                    <Switch
                      id="b2b-available"
                      checked={newRatePlan.b2bAvailable}
                      onCheckedChange={(checked) => 
                        setNewRatePlan({ ...newRatePlan, b2bAvailable: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="b2c-available">B2C Available</Label>
                      <p className="text-xs text-gray-500">
                        Enable this rate plan for direct customer bookings
                      </p>
                    </div>
                    <Switch
                      id="b2c-available"
                      checked={newRatePlan.b2cAvailable}
                      onCheckedChange={(checked) => 
                        setNewRatePlan({ ...newRatePlan, b2cAvailable: checked })
                      }
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Policies and tax can be configured after creation
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewRatePlan({ ratePlanName: "", b2bAvailable: false, b2cAvailable: true });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={createRatePlan}
                  disabled={!newRatePlan.ratePlanName.trim()}
                >
                  Create Rate Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rate Plans List Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">All Rate Plans</h2>
          {allRatePlans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No rate plans found. Create your first rate plan above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRatePlans.map((ratePlan) => (
                <div
                  key={ratePlan.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 relative"
                >
                  {/* More Menu - Top Right */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAddRulesClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          {ratePlan.ratePlanRules ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                          <span>{ratePlan.ratePlanRules ? "Update Rules" : "Add Rules"}</span>
                        </DropdownMenuItem>
                        
                        {/* ✅ ADDED: Manage Addons menu item */}
                        <DropdownMenuItem
                          onClick={() => handleManageAddonsClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          <span>Manage Addons</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => handleEdit(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(ratePlan)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3 pr-8">
                    {ratePlan.ratePlanName}
                  </h3>
                  <div className="space-y-3 mb-4 text-xm">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Code:</span> {ratePlan.ratePlanCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ratePlan.createdAt
                          ? new Date(ratePlan.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Availability Status */}
                    <div className="flex gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.b2bAvailable ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">B2B</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.b2cAvailable ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">B2C</span>
                      </div>
                    </div>

                    {/* Policy and Tax Status Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.cancellationPolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          Cancellation Policy
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.depositPolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          Deposit Policy
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.guaranteePolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          Guarantee Policy
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.taxGroupId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          Tax
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${!ratePlan.ratePlanRules ? 'bg-gray-300' :ratePlan.ratePlanRules.isActive?'bg-green-500' : 'bg-orange-300'}`} />
                        <span className="text-xs text-gray-600">
                          MLOS Rules
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.Addons?.length===0 ? 'bg-gray-300' : 'bg-green-500'}`} />
                        <span className="text-xs text-gray-600">
                          Addon Included
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Rate Plan Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Rate Plan</DialogTitle>
            <DialogDescription>
              Update rate plan details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ratePlanName">
                Rate Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-ratePlanName"
                value={editRatePlanData.ratePlanName}
                onChange={(e) => setEditRatePlanData({ ...editRatePlanData, ratePlanName: e.target.value })}
                placeholder="Enter rate plan name"
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-b2b-available">B2B Available</Label>
                  <p className="text-xs text-gray-500">
                    Enable this rate plan for business-to-business bookings
                  </p>
                </div>
                <Switch
                  id="edit-b2b-available"
                  checked={editRatePlanData.b2bAvailable}
                  onCheckedChange={(checked) => 
                    setEditRatePlanData({ ...editRatePlanData, b2bAvailable: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-b2c-available">B2C Available</Label>
                  <p className="text-xs text-gray-500">
                    Enable this rate plan for direct customer bookings
                  </p>
                </div>
                <Switch
                  id="edit-b2c-available"
                  checked={editRatePlanData.b2cAvailable}
                  onCheckedChange={(checked) => 
                    setEditRatePlanData({ ...editRatePlanData, b2cAvailable: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateRatePlan}
              disabled={!editRatePlanData.ratePlanName.trim()}
            >
              Update Rate Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the rate plan{" "}
              <span className="font-semibold">"{deleteDialog.ratePlan?.ratePlanName}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate Plan Rules Dialog */}
      {rulesDialog.ratePlan && (
        <RatePlanRulesDialog
          open={rulesDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setRulesDialog({ open: false, ratePlan: null });
            }
          }}
          ratePlanId={rulesDialog.ratePlan.id}
          ratePlanName={rulesDialog.ratePlan.ratePlanName}
          existingRule={rulesDialog.ratePlan.ratePlanRules || null}
          onSuccess={handleRulesSuccess}
        />
      )}

      {/* ✅ ADDED: Manage Addons Dialog */}
     {addonsDialog.ratePlan && propertyId && (
  <ManageRateWithAddonsForm
    open={addonsDialog.open}
    onOpenChange={(open) => {
      if (!open) {
        setAddonsDialog({ open: false, ratePlan: null });
      }
    }}
    ratePlanCode={addonsDialog.ratePlan.ratePlanCode}
    ratePlanName={addonsDialog.ratePlan.ratePlanName}
    propertyId={propertyId}
    onSuccess={fetchRatePlans} // ✅ This refetches rate plans after save
  />
)}
    </>
  );
}