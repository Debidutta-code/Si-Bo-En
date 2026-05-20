import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

import type { ISpaCategory, ISpaSubCategory } from '../types';
import {
  getAllSpaCategoryService,
  createSpaCategoryService,
  updateSpaCategoryService,
  deleteSpaCategoryService,
  getAllSpaSubCategoriesService,
  createSpaSubCategoryService,
  updateSpaSubCategoryService,
  deleteSpaSubCategoryService,
} from '../services/spa.services';
import { AddTranslationDialog, CheckTranslationsDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertSpaCategoryTranslationService,
  getAllSpaCategoryTranslationsService,
  deleteSpaCategoryTranslationLocaleService,
  upsertSpaSubCategoryTranslationService,
  getAllSpaSubCategoryTranslationsService,
  deleteSpaSubCategoryTranslationLocaleService,
} from '../services/multilanguage.services';

export default function Spa() {
  const [categories, setCategories] = useState<ISpaCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ISpaSubCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit states
  const [selectedCategory, setSelectedCategory] = useState<ISpaCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ISpaSubCategory | null>(null);
  
  // Delete state
  const [deleteItem, setDeleteItem] = useState<{ id: string, type: 'category' | 'subcategory', name: string } | null>(null);

  // Translation state
  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [translationEntityType, setTranslationEntityType] = useState<'category' | 'subcategory'>('category');
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);

  // Filter state
  const [selectedCategoryIdFilter, setSelectedCategoryIdFilter] = useState<string>("all");

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryData, setSubCategoryData] = useState({
    name: "",
    categoryId: "",
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [selectedCategoryIdFilter]);

  const fetchSubCategories = async () => {
    try {
      const res = await getAllSpaSubCategoriesService(
        selectedCategoryIdFilter === "all" ? undefined : selectedCategoryIdFilter
      );
      if (res.success) setSubCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch sub-categories");
    }
  };

  const fetchData = async () => {
    try {
      const [catRes, subCatRes] = await Promise.all([
        getAllSpaCategoryService(),
        getAllSpaSubCategoriesService(
          selectedCategoryIdFilter === "all" ? undefined : selectedCategoryIdFilter
        )
      ]);
      
      if (catRes.success) setCategories(catRes.data);
      if (subCatRes.success) setSubCategories(subCatRes.data);
    } catch (error) {
      toast.error("Failed to fetch Spa data");
    }
  };

  // --- Category Actions ---
  const handleOpenCategoryDialog = (category?: ISpaCategory) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryName(category.name);
    } else {
      setSelectedCategory(null);
      setCategoryName("");
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      let res;
      if (selectedCategory) {
        res = await updateSpaCategoryService(selectedCategory.id, { name: categoryName });
      } else {
        res = await createSpaCategoryService({ name: categoryName });
      }
      if (res.success) {
        toast.success(`Category ${selectedCategory ? 'updated' : 'created'} successfully`);
        fetchData();
        setIsCategoryDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to save category");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- SubCategory Actions ---
  const handleOpenSubCategoryDialog = (subCategory?: ISpaSubCategory) => {
    if (subCategory) {
      setSelectedSubCategory(subCategory);
      setSubCategoryData({
        name: subCategory.name,
        categoryId: subCategory.categoryId,
        isActive: subCategory.isActive
      });
    } else {
      setSelectedSubCategory(null);
      setSubCategoryData({
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        isActive: true
      });
    }
    setIsSubCategoryDialogOpen(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryData.name.trim()) {
      toast.error("Sub-Category name is required");
      return;
    }
    if (!subCategoryData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    setLoading(true);
    try {
      let res;
      if (selectedSubCategory) {
        res = await updateSpaSubCategoryService(selectedSubCategory.id, {
          name: subCategoryData.name,
          isActive: subCategoryData.isActive
        });
      } else {
        res = await createSpaSubCategoryService({
          name: subCategoryData.name,
          categoryId: subCategoryData.categoryId
        });
      }
      if (res.success) {
        toast.success(`Sub-Category ${selectedSubCategory ? 'updated' : 'created'} successfully`);
        fetchData();
        setIsSubCategoryDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to save sub-category");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Actions ---
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setLoading(true);
    try {
      let res;
      if (deleteItem.type === 'category') {
        res = await deleteSpaCategoryService(deleteItem.id);
      } else {
        res = await deleteSpaSubCategoryService(deleteItem.id);
      }
      if (res.success) {
        toast.success("Deleted successfully");
        fetchData();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteItem(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Spa Categories</CardTitle>
          <Button onClick={() => handleOpenCategoryDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 border rounded-lg flex items-center justify-between shadow-sm bg-white">
              <span className="font-medium capitalize">{cat._translations?.name ?? cat.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenCategoryDialog(cat)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTranslationEntityId(cat.id); setTranslationEntityType('category'); setAddTranslationOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Translation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTranslationEntityId(cat.id); setTranslationEntityType('category'); setCheckTranslationsOpen(true); }}>
                    <Languages className="mr-2 h-4 w-4" /> Check Translations
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                        setDeleteItem({ id: cat.id, type: 'category', name: cat.name });
                        setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500">
               No categories configured 
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sub-Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex flex-col space-y-2">
            <CardTitle>Spa Sub-Categories</CardTitle>
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-gray-500 whitespace-nowrap">Filter by Category:</Label>
              <select 
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedCategoryIdFilter}
                onChange={(e) => setSelectedCategoryIdFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="capitalize">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={() => handleOpenSubCategoryDialog()} disabled={categories.length === 0}>
            <Plus className="mr-2 h-4 w-4" /> Add Sub-Category
          </Button>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subCategories.map((sub) => {
            const parentCat = categories.find(c => c.id === sub.categoryId);
            return (
              <div key={sub.id} className="p-4 border rounded-lg flex flex-col justify-between shadow-sm bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium block capitalize text-lg">{sub._translations?.name ?? sub.name}</span>
                    <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded-full mt-2 inline-block">
                      {parentCat?.name || 'Unknown Category'}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenSubCategoryDialog(sub)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setTranslationEntityId(sub.id); setTranslationEntityType('subcategory'); setAddTranslationOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Translation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setTranslationEntityId(sub.id); setTranslationEntityType('subcategory'); setCheckTranslationsOpen(true); }}>
                        <Languages className="mr-2 h-4 w-4" /> Check Translations
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                            setDeleteItem({ id: sub.id, type: 'subcategory', name: sub.name });
                            setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                       <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {sub.isActive ? 'Active' : 'Inactive'}
                       </span>
                   </div>
                </div>
              </div>
            );
          })}
          {subCategories.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500">
               No sub-categories configured 
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Spa Category' : 'Create Spa Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                placeholder="e.g. Massages" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Form Dialog */}
      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubCategory ? 'Edit Sub-Category' : 'Create Sub-Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                placeholder="e.g. Deep Tissue" 
                value={subCategoryData.name}
                onChange={(e) => setSubCategoryData({...subCategoryData, name: e.target.value})}
              />
            </div>
            
            {/* Category dropdown is disabled in edit mode because update subCat API doesn't support changing category */}
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={subCategoryData.categoryId}
                onChange={(e) => setSubCategoryData({...subCategoryData, categoryId: e.target.value})}
                disabled={!!selectedSubCategory}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="capitalize">{c.name}</option>
                ))}
              </select>
            </div>

            {selectedSubCategory && (
              <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                <Switch 
                  checked={subCategoryData.isActive} 
                  onCheckedChange={(checked) => setSubCategoryData({...subCategoryData, isActive: checked})}
                />
                <Label>Active Status</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubCategory} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete the {deleteItem?.type} "{deleteItem?.name}"? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title={translationEntityType === 'category' ? 'Add Spa Category Translation' : 'Add Spa Sub-Category Translation'}
            fields={[{ key: "name", label: "Name", placeholder: "e.g., Masajes" }]}
            onSave={async (id, locale, data) => {
              if (translationEntityType === 'category') {
                return await upsertSpaCategoryTranslationService(id, { [locale]: data });
              }
              return await upsertSpaSubCategoryTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={translationEntityType === 'category' ? 'Spa Category Translations' : 'Spa Sub-Category Translations'}
            displayFields={[{ key: "name", label: "Name" }]}
            onFetch={translationEntityType === 'category' ? getAllSpaCategoryTranslationsService : getAllSpaSubCategoryTranslationsService}
            onDelete={translationEntityType === 'category' ? deleteSpaCategoryTranslationLocaleService : deleteSpaSubCategoryTranslationLocaleService}
          />
        </>
      )}
    </div>
  );
}
