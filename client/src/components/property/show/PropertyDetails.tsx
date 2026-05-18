"use client";

import { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { type IPropertyDetails, type IPropertyEmail } from "../types/types";
import { getPropertyDetails } from "../api/show/propertyDetails";
import { Button } from "../../ui/button";
import { PenTool, X, AlertCircle, CheckCircle, Mail, Phone, Tag, House, Plus, Pencil, Trash2, MailPlus, Copy, Settings, Globe, Languages } from "lucide-react";
import ExpandableDescription from "@/components/ExplandableDescription";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AddPropertyDetailsLangDialog from "../multilang/components/AddPropertyDetailsLangDialog";
import CheckPropertyDetailsLangDialog from "../multilang/components/CheckPropertyDetailsLangDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import PropertyInfo from "@/components/property/update/PropertyInfo";
import { updatePropertyById } from "../api/create/propertyinfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPropertyEmail,
  deletePropertyEmail,
  getPropertyEmails,
  updatePropertyEmail,
} from "../api/create/propertyEmails.apis";
import { useNavigate } from "react-router-dom";

export default function PropertyDetails({
  propertyId,
}: {
  propertyId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    description: "",
    propertyEmail: "",
    propertyCode: "",
    propertyCategory: {
      masterCategory: {
        id: "",
        categoryName: "",
        categoryDescription: "",
        _translations: {
          categoryDescription:"",
          categoryName:""
        }


      }
    },
    propertyContact: "",
    propertyType: {
      masterPropertyType: {
        id: "",
        propertyTypeDescription: "",
        propertyTypeName: "",
        _translations:{
          propertyTypeDescription:"",
          propertyTypeName:""
        }
      }
    },
    image: [],
    propertyEmails: [],
    creationId: "",
    _translations: {
      propertyName: "",
      description: "string"
    }


  });
  // Property emails state
  const [propertyEmails, setPropertyEmails] = useState<IPropertyEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [addEmailOpen, setAddEmailOpen] = useState(false);
  const [addEmailValue, setAddEmailValue] = useState("");
  const [addEmailLoading, setAddEmailLoading] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<IPropertyEmail | null>(null);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [editEmailLoading, setEditEmailLoading] = useState(false);
  const [deleteEmailId, setDeleteEmailId] = useState<string | null>(null);
  const [deleteEmailLoading, setDeleteEmailLoading] = useState(false);
  const navigate = useNavigate();

  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchPropertyDetails(propertyId);
    fetchEmails(propertyId);
  }, [propertyId]);
  // console.log(propertyDetails,"propertyDetails.creationId")
  const fetchEmails = async (propId: string) => {
    setEmailsLoading(true);
    try {
      const response = await getPropertyEmails(propId);
      if (response.success) {
        setPropertyEmails(response.data || []);
      }
    } catch {
      // silently fail — emails section shows empty state
    } finally {
      setEmailsLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!addEmailValue.trim()) return;
    setAddEmailLoading(true);
    try {
      const response = await createPropertyEmail(propertyId, addEmailValue.trim());
      if (response.success) {
        toast.success("Email added successfully");
        setAddEmailValue("");
        setAddEmailOpen(false);
        fetchEmails(propertyId);
      } else {
        toast.error(response.message || "Failed to add email");
      }
    } catch {
      toast.error("Failed to add email");
    } finally {
      setAddEmailLoading(false);
    }
  };

  const handleEditEmail = async () => {
    if (!editingEmail || !editEmailValue.trim()) return;
    setEditEmailLoading(true);
    try {
      const response = await updatePropertyEmail(editingEmail.id, editEmailValue.trim());
      if (response.success) {
        toast.success("Email updated successfully");
        setEditEmailOpen(false);
        setEditingEmail(null);
        setEditEmailValue("");
        fetchEmails(propertyId);
      } else {
        toast.error(response.message || "Failed to update email");
      }
    } catch {
      toast.error("Failed to update email");
    } finally {
      setEditEmailLoading(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!deleteEmailId) return;
    setDeleteEmailLoading(true);
    try {
      const response = await deletePropertyEmail(deleteEmailId);
      if (response.success) {
        toast.success("Email deleted successfully");
        setDeleteEmailId(null);
        setPropertyEmails((prev) => prev.filter((e) => e.id !== deleteEmailId));
      } else {
        toast.error(response.message || "Failed to delete email");
      }
    } catch {
      toast.error("Failed to delete email");
    } finally {
      setDeleteEmailLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPropertyDetails(propertyId);
      if (response.success) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
          description: data.description,
          propertyCode: data.propertyCode,
          propertyCategory: data.propertyCategory,
          propertyContact: data.propertyContact,
          propertyEmail: data.propertyEmail,
          propertyType: data.propertyType,
          image: data.image,
          propertyEmails: data.propertyEmails || [],
          creationId: data.creationId,
_translations:data._translations
        });
      } else {
        throw new Error(response.message || "Failed to fetch property details");
      }
    } catch (error: any) {
      setError(error?.message || "Failed to fetch property details");
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const updateDetails = async (
    propertyId: string,
    payload: IPropertyDetails
  ) => {
    setIsUpdating(true);
    try {
      const response = await updatePropertyById(propertyId, payload);
      if (response.success) {
        toast.success("Property Details Updated successfully");
        setPropertyDetails(payload);
      } else {
        throw new Error(response.message || "Failed to Update Property Details");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to Update Property please try again later");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading Property Details" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Property Details</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => fetchPropertyDetails(propertyId)} size="sm">
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} size="sm">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {propertyDetails._translations?propertyDetails._translations.propertyName:propertyDetails.propertyName}
              </h1>
              <span className="px-3 py-1 bg-success/10 text-success-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
              {propertyDetails.propertyCategory?.masterCategory?.categoryName && (
                <span className="px-3 py-1 bg-primary/10 text-primary-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {propertyDetails.propertyCategory.masterCategory.categoryName}
                </span>
              )}
            </div>
            <ExpandableDescription description={propertyDetails.description} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-4 shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
                <PenTool className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between items-center">
                  <AlertDialogTitle className="text-xl font-semibold">
                    Update Property Details
                  </AlertDialogTitle>
                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </div>
                <PropertyInfo
                  property={propertyDetails}
                  modifyPropertyDetails={setPropertyDetails}
                  isLoading={isUpdating}
                />
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="mt-0" disabled={isUpdating}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    updateDetails(propertyId, propertyDetails);
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Property Details"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className="ml-4 shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90"
            onClick={() => navigate(`/app/property/property/${propertyDetails?.creationId}`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Property Configuration
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-4 shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
                <Globe className="h-4 w-4 mr-2" />
                Translations
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAddTranslationOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Translation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCheckTranslationsOpen(true)}>
                <Languages className="h-4 w-4 mr-2" /> Check Translations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AddPropertyDetailsLangDialog open={addTranslationOpen} onOpenChange={setAddTranslationOpen} propertyId={propertyId} />
          <CheckPropertyDetailsLangDialog open={checkTranslationsOpen} onOpenChange={setCheckTranslationsOpen} propertyId={propertyId} />

        </div>
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact & Details Card */}
        <Card>
          <CardContent className="md:p-6 p-2">
            <div className="flex items-center gap-2 lg:mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Contact & Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Email
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyEmail || "Not provided"}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Contact
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyContact || "Not provided"}
                </span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <House className="h-4 w-4 text-gray-400" />
                  Property Code
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyCode.replace(/[A-Z0-9]/g, "*")}
                  <Button variant={"ghost"} size={"sm"} onClick={() => navigator.clipboard.writeText(propertyDetails.propertyCode || "")}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <House className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <House className="h-4 w-4 text-gray-400" />
                  Property Type
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyType?.masterPropertyType._translations?propertyDetails.propertyType?.masterPropertyType._translations.propertyTypeName:propertyDetails.propertyType?.masterPropertyType.propertyTypeName || "Not specified"}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Category
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyCategory?.masterCategory._translations?propertyDetails.propertyCategory?.masterCategory._translations.categoryName:propertyDetails.propertyCategory?.masterCategory.categoryName || "Not specified"}
                </span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Booking Engine Url
                </span>
                <a className="text-xs text-gray-900 font-medium text-right" target="_blank" rel="noopener noreferrer"
                  href={`${import.meta.env.VITE_BOOKING_ENGINE_URL}/Rooms/?code=${propertyDetails.propertyCode}`}
                >

                  {`${import.meta.env.VITE_BOOKING_ENGINE_URL}/Rooms/?code=${propertyDetails.propertyCode.replace(/[A-Z0-9]/g, "*")}`}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Property Emails */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MailPlus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Additional Emails</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Extra contact emails for this property</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => { setAddEmailValue(""); setAddEmailOpen(true); }}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Email
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {emailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : propertyEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="h-7 w-7 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">No additional emails yet</p>
                <p className="text-xs text-gray-500 mt-1">Add extra contact emails for this property</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setAddEmailValue(""); setAddEmailOpen(true); }}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add First Email
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {propertyEmails.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-mono text-gray-500 px-2">
                      {index + 1}
                    </Badge>
                    <span className="text-sm text-gray-800 font-medium">{entry.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEditingEmail(entry);
                        setEditEmailValue(entry.email);
                        setEditEmailOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteEmailId(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Email Dialog */}
      <Dialog open={addEmailOpen} onOpenChange={setAddEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Email Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="add-email">Email Address</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="e.g. reservations@hotel.com"
              value={addEmailValue}
              onChange={(e) => setAddEmailValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={addEmailLoading} onClick={() => setAddEmailOpen(false)}>
              Cancel
            </Button>
            <Button disabled={addEmailLoading || !addEmailValue.trim()} onClick={handleAddEmail}>
              {addEmailLoading ? "Adding..." : "Add Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={editEmailOpen} onOpenChange={(open) => { setEditEmailOpen(open); if (!open) setEditingEmail(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Email Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="e.g. reservations@hotel.com"
              value={editEmailValue}
              onChange={(e) => setEditEmailValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditEmail()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={editEmailLoading} onClick={() => setEditEmailOpen(false)}>
              Cancel
            </Button>
            <Button disabled={editEmailLoading || !editEmailValue.trim()} onClick={handleEditEmail}>
              {editEmailLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Email Confirmation */}
      <AlertDialog open={!!deleteEmailId} onOpenChange={(open) => { if (!open) setDeleteEmailId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Address?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600 px-1">
            This will permanently remove the email address from this property. This action cannot be undone.
          </p>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteEmailLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEmailLoading}
              onClick={(e) => { e.preventDefault(); handleDeleteEmail(); }}
            >
              {deleteEmailLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}