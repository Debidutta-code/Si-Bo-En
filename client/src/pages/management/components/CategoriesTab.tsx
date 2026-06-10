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
import { useTranslation } from "react-i18next";

interface CategoriesTabProps {
  categories: ICategory[];
  setCategories: React.Dispatch<React.SetStateAction<ICategory[]>>;
}

export default function CategoriesTab({ categories, setCategories }: CategoriesTabProps) {
  const { t } = useTranslation();

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
      toast.success(t('Toast.categoryCreatedSuccessfully'));
      setCategories([...categories, response.data]);
      setCategoryForm({ name: "", description: "" });
      setIsCategoryDialogOpen(false);
    } else {
      toast.error(response.error || t('Toast.failedToCreateCategory'));
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const response = await deleteCategoryService(categoryName);
    if (response.success) {
      toast.success(t('Toast.categoryDeletedSuccessfully'));
      setCategories(categories.filter((cat) => cat.categoryName !== categoryName));
    } else {
      toast.error(response.error || t('Toast.failedToDeleteCategory'));
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('Management.propertyCategories')}</CardTitle>
            <CardDescription>{t('Management.managePropertyCategories')}</CardDescription>
          </div>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Management.addCategory')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Management.createNewCategory')}</DialogTitle>
                <DialogDescription>{t('Management.addNewPropertyCategory')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">{t('Management.categoryName')}</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Luxury"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">{t('Common.description')}</Label>
                  <Input
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Describe this category"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>                  {t('Common.cancel')}
                </Button>
                <Button onClick={handleCreateCategory}>{t('Common.create')}</Button>
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
                    <CardTitle className="text-lg">{category._translations?.categoryName || category.categoryName}</CardTitle>
                    <CardDescription className="mt-1">
                      {category._translations?.categoryDescription || category.categoryDescription}
                    </CardDescription>                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAddTranslation(category.id)}>
                        <Plus className="h-4 w-4 mr-2" /> {t("Common.addTranslation")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCheckTranslations(category.id)}>
                        <Languages className="h-4 w-4 mr-2" /> {t("Common.checkTranslation")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category.categoryName)}>
                        <Trash2 className="h-4 w-4 mr-2" /> {t("Common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              {t('Management.noCategoriesFound')}
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
            title={t("Addon.ManagementTabs.translationDialogs.category.addTitle")}
            fields={[
              { key: "categoryName", label: t("Management.Category.name"), placeholder: t("Management.Category.namePlaceholder") },
              { key: "categoryDescription", label: t("Management.Category.description"), placeholder: t("Management.Category.descriptionPlaceholder") },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterPropertyCategoryTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={t("Management.Category.translations")}
            displayFields={[
              { key: "categoryName", label: t("Management.Category.name") },
              { key: "categoryDescription", label: t("Management.Category.description") },
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
            title={t("Management.Category.editTranslation")}
            fields={[
              { key: "categoryName", label: t("Management.Category.name"), placeholder: t("Management.Category.namePlaceholder") },
              { key: "categoryDescription", label: t("Management.Category.description"), placeholder: t("Management.Category.descriptionPlaceholder") },
            ]}
            onSave={async (id, locale, data) => upsertMasterPropertyCategoryTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
