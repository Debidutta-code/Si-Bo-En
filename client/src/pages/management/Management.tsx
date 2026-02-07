import { useState, useEffect } from "react";
import Loader from "@/components/Loader/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag, Home, Sparkles, Users } from "lucide-react";
import toast from "react-hot-toast";
import type { ICategory, IPropertyType, IAmenity, ILoyaltyGuestField } from "./types";
import {
  getCategoriesService,
  createCategoryService,
  deleteCategoryService,
  getPropertyTypesService,
  createPropertyTypeService,
  deletePropertyTypeService,
  getPropertyAmenitiesService,
  createPropertyAmenitiesService,
  deletePropertyAmenitiesService,
  getRoomAmenitiesService,
  createRoomAmenitiesService,
  deleteRoomAmenitiesService,
  getLoyaltyGuestFieldsService,
  createLoyaltyGuestFieldsService,
  deleteLoyaltyGuestFieldService,
} from "./services/management.services";

export default function ManagementPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<IAmenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<IAmenity[]>([]);
  const [loyaltyGuestFields, setLoyaltyGuestFields] = useState<ILoyaltyGuestField[]>([]);

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPropertyTypeDialogOpen, setIsPropertyTypeDialogOpen] = useState(false);
  const [isPropertyAmenityDialogOpen, setIsPropertyAmenityDialogOpen] = useState(false);
  const [isRoomAmenityDialogOpen, setIsRoomAmenityDialogOpen] = useState(false);
  const [isLoyaltyFieldDialogOpen, setIsLoyaltyFieldDialogOpen] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [propertyTypeForm, setPropertyTypeForm] = useState({ name: "", description: "" });
  const [propertyAmenityInput, setPropertyAmenityInput] = useState("");
  const [roomAmenityInput, setRoomAmenityInput] = useState("");
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [loyaltyFieldInput, setLoyaltyFieldInput] = useState("");
  const [loyaltyFieldsList, setLoyaltyFieldsList] = useState<string[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [catRes, propTypeRes, propAmenRes, roomAmenRes, loyaltyFieldsRes] = await Promise.all([
        getCategoriesService(),
        getPropertyTypesService(),
        getPropertyAmenitiesService("property"),
        getRoomAmenitiesService(),
        getLoyaltyGuestFieldsService(),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (propTypeRes.success) setPropertyTypes(propTypeRes.data);
      if (propAmenRes.success) setPropertyAmenities(propAmenRes.data);
      if (roomAmenRes.success) setRoomAmenities(roomAmenRes.data);
      if (loyaltyFieldsRes.success) setLoyaltyGuestFields(loyaltyFieldsRes.data);
    } catch (error: any) {
      toast.error("Failed to fetch management data");
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    const response = await createCategoryService(categoryForm.name, categoryForm.description);
    if (response.success) {
      toast.success("Category created successfully");
      setCategories([...categories, response.data]);
      setCategoryForm({ name: "", description: "" });
      setIsCategoryDialogOpen(false);
    } else {
      toast.error(response.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const response = await deleteCategoryService(categoryName);
    if (response.success) {
      toast.success("Category deleted successfully");
      setCategories(categories.filter((c) => c.categoryName !== categoryName));
    } else {
      toast.error(response.message || "Failed to delete category");
    }
  };

  // Property Type handlers
  const handleCreatePropertyType = async () => {
    const response = await createPropertyTypeService(propertyTypeForm.name, propertyTypeForm.description);
    if (response.success) {
      toast.success("Property type created successfully");
      setPropertyTypes([...propertyTypes, response.data]);
      setPropertyTypeForm({ name: "", description: "" });
      setIsPropertyTypeDialogOpen(false);
    } else {
      toast.error(response.message || "Failed to create property type");
    }
  };

  const handleDeletePropertyType = async (propertyTypeName: string) => {
    const response = await deletePropertyTypeService(propertyTypeName);
    if (response.success) {
      toast.success("Property type deleted successfully");
      setPropertyTypes(propertyTypes.filter((pt) => pt.propertyTypeName !== propertyTypeName));
    } else {
      toast.error(response.message || "Failed to delete property type");
    }
  };


  // Property Amenity handlers
  const handleAddPropertyAmenityToList = () => {
    if (!propertyAmenityInput.trim()) return;
    if (amenitiesList.includes(propertyAmenityInput.trim())) {
      toast.error("Amenity already added");
      return;
    }
    setAmenitiesList([...amenitiesList, propertyAmenityInput.trim()]);
    setPropertyAmenityInput("");
  };

  const handleCreatePropertyAmenities = async () => {
    const response = await createPropertyAmenitiesService(amenitiesList);
    if (response.success) {
      toast.success("Amenities created successfully");
      setPropertyAmenities(response.data);
      setAmenitiesList([]);
      setIsPropertyAmenityDialogOpen(false);
    } else {
      toast.error(response.message || "Failed to create amenities");
    }
  };

  const handleDeletePropertyAmenity = async (amenityName: string) => {
    const response = await deletePropertyAmenitiesService([amenityName]);
    if (response.success) {
      toast.success("Amenity deleted successfully");
      setPropertyAmenities(response.data);
    } else {
      toast.error(response.message || "Failed to delete amenity");
    }
  };

  // Room Amenity handlers
  const handleAddRoomAmenityToList = () => {
    if (!roomAmenityInput.trim()) return;
    if (amenitiesList.includes(roomAmenityInput.trim())) {
      toast.error("Amenity already added");
      return;
    }
    setAmenitiesList([...amenitiesList, roomAmenityInput.trim()]);
    setRoomAmenityInput("");
  };

  const handleCreateRoomAmenities = async () => {
    const response = await createRoomAmenitiesService(amenitiesList);
    if (response.success) {
      toast.success("Amenities created successfully");
      setRoomAmenities(response.data);
      setAmenitiesList([]);
      setIsRoomAmenityDialogOpen(false);
    } else {
      toast.error(response.message || "Failed to create amenities");
    }
  };

  const handleDeleteRoomAmenity = async (amenityName: string) => {
    const response = await deleteRoomAmenitiesService([amenityName]);
    if (response.success) {
      toast.success("Amenity deleted successfully");
      setRoomAmenities(response.data);
    } else {
      toast.error(response.message || "Failed to delete amenity");
    }
  };

  // Loyalty Guest Fields handlers
  const handleAddLoyaltyFieldToList = () => {
    if (!loyaltyFieldInput.trim()) return;
    if (loyaltyFieldsList.includes(loyaltyFieldInput.trim())) {
      toast.error("Field already added");
      return;
    }
    setLoyaltyFieldsList([...loyaltyFieldsList, loyaltyFieldInput.trim()]);
    setLoyaltyFieldInput("");
  };

  const handleCreateLoyaltyFields = async () => {
    const response = await createLoyaltyGuestFieldsService(loyaltyFieldsList);
    if (response.success) {
      toast.success("Loyalty fields created successfully");
      // Refetch to get updated data
      const fieldsRes = await getLoyaltyGuestFieldsService();
      if (fieldsRes.success) setLoyaltyGuestFields(fieldsRes.data);
      setLoyaltyFieldsList([]);
      setIsLoyaltyFieldDialogOpen(false);
    } else {
      toast.error(response.message || "Failed to create loyalty fields");
    }
  };

  const handleDeleteLoyaltyField = async (id: string) => {
    const response = await deleteLoyaltyGuestFieldService(id);
    if (response.success) {
      toast.success("Loyalty field deleted successfully");
      // Refetch to get updated data
      const fieldsRes = await getLoyaltyGuestFieldsService();
      if (fieldsRes.success) setLoyaltyGuestFields(fieldsRes.data);
    } else {
      toast.error(response.message || "Failed to delete loyalty field");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text="Loading Management Data" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage categories, types, and amenities for your properties
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="property-types">
            <Home className="h-4 w-4 mr-2" />
            Property Types
          </TabsTrigger>
          <TabsTrigger value="property-amenities">
            <Sparkles className="h-4 w-4 mr-2" />
            Property Amenities
          </TabsTrigger>
          <TabsTrigger value="room-amenities">
            <Sparkles className="h-4 w-4 mr-2" />
            Room Amenities
          </TabsTrigger>
          <TabsTrigger value="loyalty-fields">
            <Users className="h-4 w-4 mr-2" />
            Loyalty Fields
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Categories</CardTitle>
                  <CardDescription>Manage property categories</CardDescription>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>Add a new property category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="e.g., Luxury"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Input
                          id="categoryDescription"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          placeholder="Describe this category"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{category.categoryName}</CardTitle>
                          <CardDescription className="mt-1">{category.categoryDescription}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.categoryName)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    No categories found. Create your first category to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Types Tab */}
        <TabsContent value="property-types">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Types</CardTitle>
                  <CardDescription>Manage property types</CardDescription>
                </div>
                <Dialog open={isPropertyTypeDialogOpen} onOpenChange={setIsPropertyTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Property Type</DialogTitle>
                      <DialogDescription>Add a new property type</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="propertyTypeName">Property Type Name</Label>
                        <Input
                          id="propertyTypeName"
                          value={propertyTypeForm.name}
                          onChange={(e) => setPropertyTypeForm({ ...propertyTypeForm, name: e.target.value })}
                          placeholder="e.g., Hotel"
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertyTypeDescription">Description</Label>
                        <Input
                          id="propertyTypeDescription"
                          value={propertyTypeForm.description}
                          onChange={(e) =>
                            setPropertyTypeForm({ ...propertyTypeForm, description: e.target.value })
                          }
                          placeholder="Describe this property type"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPropertyTypeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePropertyType}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyTypes.map((type) => (
                  <Card key={type.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{type.propertyTypeName}</CardTitle>
                          <CardDescription className="mt-1">{type.propertyTypeDescription}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePropertyType(type.propertyTypeName)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {propertyTypes.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    No property types found. Create your first property type to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Amenities Tab */}
        <TabsContent value="property-amenities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Amenities</CardTitle>
                  <CardDescription>Manage property amenities</CardDescription>
                </div>
                <Dialog
                  open={isPropertyAmenityDialogOpen}
                  onOpenChange={(open) => {
                    setIsPropertyAmenityDialogOpen(open);
                    if (!open) setAmenitiesList([]);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Amenities
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Property Amenities</DialogTitle>
                      <DialogDescription>Add new property amenities</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={propertyAmenityInput}
                          onChange={(e) => setPropertyAmenityInput(e.target.value)}
                          placeholder="e.g., Swimming Pool"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddPropertyAmenityToList();
                            }
                          }}
                        />
                        <Button onClick={handleAddPropertyAmenityToList}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {amenitiesList.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {amenity}
                            <button
                              onClick={() => setAmenitiesList(amenitiesList.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsPropertyAmenityDialogOpen(false);
                          setAmenitiesList([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePropertyAmenities}>Create All</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {propertyAmenities.map((amenity) => (
                  <Badge key={amenity.id} variant="outline" className="text-sm py-2 px-3">
                    {amenity.amenityName}
                    <button
                      onClick={() => handleDeletePropertyAmenity(amenity.amenityName)}
                      className="ml-2 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {propertyAmenities.length === 0 && (
                  <div className="w-full text-center py-12 text-gray-500">
                    No property amenities found. Create your first amenity to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Amenities Tab */}
        <TabsContent value="room-amenities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Room Amenities</CardTitle>
                  <CardDescription>Manage room amenities</CardDescription>
                </div>
                <Dialog
                  open={isRoomAmenityDialogOpen}
                  onOpenChange={(open) => {
                    setIsRoomAmenityDialogOpen(open);
                    if (!open) setAmenitiesList([]);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Amenities
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Room Amenities</DialogTitle>
                      <DialogDescription>Add new room amenities</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={roomAmenityInput}
                          onChange={(e) => setRoomAmenityInput(e.target.value)}
                          placeholder="e.g., Air Conditioning"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddRoomAmenityToList();
                            }
                          }}
                        />
                        <Button onClick={handleAddRoomAmenityToList}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {amenitiesList.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {amenity}
                            <button
                              onClick={() => setAmenitiesList(amenitiesList.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsRoomAmenityDialogOpen(false);
                          setAmenitiesList([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRoomAmenities}>Create All</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {roomAmenities.map((amenity) => (
                  <Badge key={amenity.id} variant="outline" className="text-sm py-2 px-3">
                    {amenity.amenityName}
                    <button
                      onClick={() => handleDeleteRoomAmenity(amenity.amenityName)}
                      className="ml-2 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {roomAmenities.length === 0 && (
                  <div className="w-full text-center py-12 text-gray-500">
                    No room amenities found. Create your first amenity to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Guest Fields Tab */}
        <TabsContent value="loyalty-fields">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Loyalty Guest Registration Fields</CardTitle>
                  <CardDescription>Manage custom fields for loyalty program registration</CardDescription>
                </div>
                <Dialog open={isLoyaltyFieldDialogOpen} onOpenChange={setIsLoyaltyFieldDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fields
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Loyalty Registration Fields</DialogTitle>
                      <DialogDescription>Add new custom fields for guest registration</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={loyaltyFieldInput}
                          onChange={(e) => setLoyaltyFieldInput(e.target.value)}
                          placeholder="e.g., Phone Number, Date of Birth"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLoyaltyFieldToList();
                            }
                          }}
                        />
                        <Button onClick={handleAddLoyaltyFieldToList}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {loyaltyFieldsList.map((field, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {field}
                            <button
                              onClick={() => setLoyaltyFieldsList(loyaltyFieldsList.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsLoyaltyFieldDialogOpen(false);
                          setLoyaltyFieldsList([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateLoyaltyFields}>Create All</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {loyaltyGuestFields.map((field) => (
                  <Badge key={field.id} variant="outline" className="text-sm py-2 px-3">
                    {field.fieldName}
                    <button
                      onClick={() => handleDeleteLoyaltyField(field.id)}
                      className="ml-2 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {loyaltyGuestFields.length === 0 && (
                  <div className="w-full text-center py-12 text-gray-500">
                    No loyalty fields found. Create your first field to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}