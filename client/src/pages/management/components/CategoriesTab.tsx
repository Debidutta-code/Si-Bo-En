import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, MoreVertical, Languages } from "lucide-react";
import toast from "react-hot-toast";
import type { ICategory } from "../types";
import { createCategoryService, deleteCategoryService } from "../services/management.services";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterPropertyCategoryTranslationService,
  getAllMasterPropertyCategoryTranslationsService,
  deleteMasterPropertyCategoryTranslationLocaleService,
} from "../services/multilanguage.services";

interface CategoriesTabProps {
  categories: ICategory[];
  setCategories: React.Dispatch<React.SetStateAction<ICategory[]>>;
}

export default function CategoriesTab({ categories, setCategories }: CategoriesTabProps) {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  const handleCreateCategory = async () => {
    const response = await createCategoryService(categoryForm.name, categoryForm.description);
    if (response.success) {
      toast.success("Category created successfully");
      setCategories([...categories, response.data]);
      setCategoryForm({ name: "", description: "" });
      setIsCategoryDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const response = await deleteCategoryService(categoryName);
    if (response.success) {
      toast.success("Category deleted successfully");
      setCategories(categories.filter((cat) => cat.categoryName !== categoryName));
    } else {
      toast.error(response.error || "Failed to delete category");
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
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
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
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
                    <CardTitle className="text-lg">{category._translations?category._translations.categoryName:category.categoryName}</CardTitle>
                    <CardDescription className="mt-1">{category._translations?category._translations.categoryName:category.categoryName}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAddTranslation(category.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Translation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCheckTranslations(category.id)}>
                        <Languages className="h-4 w-4 mr-2" /> Check Translations
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category.categoryName)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title="Add Category Translation"
            fields={[
              { key: "categoryName", label: "Category Name", placeholder: "e.g., Lujo" },
              { key: "categoryDescription", label: "Description", placeholder: "Describe this category" },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterPropertyCategoryTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Category Translations"
            displayFields={[
              { key: "categoryName", label: "Name" },
              { key: "categoryDescription", label: "Description" },
            ]}
            onFetch={getAllMasterPropertyCategoryTranslationsService}
            onDelete={deleteMasterPropertyCategoryTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title="Edit Category Translation"
            fields={[
              { key: "categoryName", label: "Category Name", placeholder: "e.g., Lujo" },
              { key: "categoryDescription", label: "Description", placeholder: "Describe this category" },
            ]}
            onSave={async (id, locale, data) => upsertMasterPropertyCategoryTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
