import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, MoreVertical, Layers, FolderTree, Package, Languages, PlusCircle } from "lucide-react";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "../../management/components/multilang/ManagementTranslationDialogs";
import { usePropertyContext } from "@/contexts/PropertyContext";
import { upsertAddonCategoryTranslation, getAllAddonCategoryTranslations, deleteAddonCategoryTranslationLocale } from "../api/category-lang.api";
import { upsertAddonSubCategoryTranslation, getAllAddonSubCategoryTranslations, deleteAddonSubCategoryTranslationLocale } from "../api/sub-cate-lang.api";
import { upsertAddonVariantTranslation, getAllAddonVariantTranslations, deleteAddonVariantTranslationLocale } from "../api/variant-lang.api";
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
import type { IAddonCategory, IAddonSubCategory, IAddonVariant } from "../interface";

interface ManagementTabsProps {
    categories: IAddonCategory[];
    subCategories: IAddonSubCategory[];
    variants: IAddonVariant[];
    onCreateCategory: () => void;
    onEditCategory: (category: IAddonCategory) => void;
    onDeleteCategory: (categoryId: string) => Promise<void>;
    onCreateSubCategory: () => void;
    onEditSubCategory: (subCategory: IAddonSubCategory) => void;
    onDeleteSubCategory: (subCategoryId: string) => Promise<void>;
    onCreateVariant: () => void;
    onEditVariant: (variant: IAddonVariant) => void;
    onDeleteVariant: (variantId: string) => Promise<void>;
}

export default function ManagementTabs({
    categories,
    subCategories,
    variants,
    onCreateCategory,
    onEditCategory,
    onDeleteCategory,
    onCreateSubCategory,
    onEditSubCategory,
    onDeleteSubCategory,
    onCreateVariant,
    onEditVariant,
    onDeleteVariant,
}: ManagementTabsProps) {
    const { t } = useTranslation();

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "category" | "subcategory" | "variant" | null;
        id: string | null;
        name: string | null;
    }>({ open: false, type: null, id: null, name: null });

    const { languages: propertyLanguages } = usePropertyContext();
    const activeLanguageCodes = propertyLanguages.map((l) => l.language);

    const [translationDialog, setTranslationDialog] = useState<{
        openAdd: boolean;
        openCheck: boolean;
        openEdit: boolean;
        type: "category" | "subcategory" | "variant" | null;
        entityId: string | null;
        editingLocale: string;
        editingData: Record<string, any>;
    }>({
        openAdd: false,
        openCheck: false,
        openEdit: false,
        type: null,
        entityId: null,
        editingLocale: "",
        editingData: {},
    });

    const handleDelete = async () => {
        if (!deleteDialog.id || !deleteDialog.type) return;

        switch (deleteDialog.type) {
            case "category":
                await onDeleteCategory(deleteDialog.id);
                break;
            case "subcategory":
                await onDeleteSubCategory(deleteDialog.id);
                break;
            case "variant":
                await onDeleteVariant(deleteDialog.id);
                break;
        }
        setDeleteDialog({ open: false, type: null, id: null, name: null });
    };

    return (
        <>
            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="categories">
                        <Layers className="w-4 h-4 mr-2" />
                        {t("Addon.ManagementTabs.tabs.categories", { count: categories.length })}
                    </TabsTrigger>
                    <TabsTrigger value="subcategories">
                        <FolderTree className="w-4 h-4 mr-2" />
                        {t("Addon.ManagementTabs.tabs.subcategories", { count: subCategories.length })}
                    </TabsTrigger>
                    <TabsTrigger value="variants">
                        <Package className="w-4 h-4 mr-2" />
                        {t("Addon.ManagementTabs.tabs.variants", { count: variants.length })}
                    </TabsTrigger>
                </TabsList>

                {/* ── Categories Tab ── */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            {t("Addon.ManagementTabs.categories.description")}
                        </p>
                        <Button onClick={onCreateCategory} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("Addon.ManagementTabs.categories.newButton")}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                {category._translations ? category._translations.name : category.name}
                                            </h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEditCategory(category)}>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    {t("Addon.ManagementTabs.actions.edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, openEdit: false, type: "category", entityId: category.id }))}
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                    {t("Addon.ManagementTabs.actions.addTranslation")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, openEdit: false, type: "category", entityId: category.id }))}
                                                >
                                                    <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                    {t("Addon.ManagementTabs.actions.checkTranslations")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, type: "category", id: category.id, name: category.name })}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t("Addon.ManagementTabs.actions.delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {t("Addon.ManagementTabs.categories.subcategoryCount", {
                                            count: subCategories.filter(s => s.categoryId === category.id).length,
                                        })}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Subcategories Tab ── */}
                <TabsContent value="subcategories" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            {t("Addon.ManagementTabs.subcategories.description")}
                        </p>
                        <Button onClick={onCreateSubCategory} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("Addon.ManagementTabs.subcategories.newButton")}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subCategories?.map((subCategory) => (
                            <Card key={subCategory.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                {subCategory._translations ? subCategory._translations.name : subCategory.name}
                                            </h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEditSubCategory(subCategory)}>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    {t("Addon.ManagementTabs.actions.edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, openEdit: false, type: "subcategory", entityId: subCategory.id }))}
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                    {t("Addon.ManagementTabs.actions.addTranslation")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, openEdit: false, type: "subcategory", entityId: subCategory.id }))}
                                                >
                                                    <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                    {t("Addon.ManagementTabs.actions.checkTranslations")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, type: "subcategory", id: subCategory.id, name: subCategory.name })}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t("Addon.ManagementTabs.actions.delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {subCategory._translations ? subCategory._translations.name : subCategory.name || t("Addon.ManagementTabs.common.unknown")}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {t("Addon.ManagementTabs.subcategories.variantCount", {
                                                count: variants.filter(v => v.subcategoryId === subCategory.id).length,
                                            })}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Variants Tab ── */}
                <TabsContent value="variants" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            {t("Addon.ManagementTabs.variants.description")}
                        </p>
                        <Button onClick={onCreateVariant} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("Addon.ManagementTabs.variants.newButton")}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {variants.map((variant) => {
                            const subCategory = subCategories.find(s => s.id === variant.subcategoryId);
                            const category = categories.find(c => c.id === subCategory?.categoryId);
                            return (
                                <Card key={variant.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">
                                                    {variant._translations ? variant._translations.name : variant.name}
                                                </h3>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onEditVariant(variant)}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        {t("Addon.ManagementTabs.actions.edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, openEdit: false, type: "variant", entityId: variant.id }))}
                                                    >
                                                        <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                        {t("Addon.ManagementTabs.actions.addTranslation")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, openEdit: false, type: "variant", entityId: variant.id }))}
                                                    >
                                                        <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                        {t("Addon.ManagementTabs.actions.checkTranslations")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteDialog({ open: true, type: "variant", id: variant.id, name: variant.name })}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {t("Addon.ManagementTabs.actions.delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <Badge variant="secondary" className="text-xs w-fit">
                                                {category?._translations ? category._translations.name : category?.name || t("Addon.ManagementTabs.common.unknown")}
                                                {" → "}
                                                {subCategory?._translations ? subCategory._translations.name : subCategory?.name || t("Addon.ManagementTabs.common.unknown")}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ── Delete Dialog ── */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) =>
                setDeleteDialog({ open, type: null, id: null, name: null })
            }>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Addon.ManagementTabs.deleteDialog.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Addon.ManagementTabs.deleteDialog.description", {
                                type: deleteDialog.type,
                                name: deleteDialog.name,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Addon.ManagementTabs.deleteDialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t("Addon.ManagementTabs.deleteDialog.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Translation Dialogs — Category ── */}
            {translationDialog.entityId && translationDialog.type === "category" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.category.addTitle")}
                        fields={[
                            { key: "name", label: t("Addon.ManagementTabs.translationDialogs.category.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.category.fieldPlaceholder") }
                        ]}
                        allowedLanguageCodes={activeLanguageCodes}
                        onSave={async (id, locale, data) => await upsertAddonCategoryTranslation(id, { [locale]: data })}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.category.checkTitle")}
                        displayFields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.fieldName") }]}
                        onFetch={getAllAddonCategoryTranslations}
                        onDelete={deleteAddonCategoryTranslationLocale}
                        onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, openCheck: false, editingLocale: locale, editingData: data }))}
                    />
                    <EditTranslationDialog
                        open={translationDialog.openEdit}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                        entityId={translationDialog.entityId!}
                        locale={translationDialog.editingLocale}
                        initialData={translationDialog.editingData}
                        title={t("Addon.ManagementTabs.translationDialogs.category.editTitle")}
                        fields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.category.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.category.fieldPlaceholder") }]}
                        onSave={async (id, locale, data) => upsertAddonCategoryTranslation(id, { [locale]: data })}
                    />
                </>
            )}

            {/* ── Translation Dialogs — Subcategory ── */}
            {translationDialog.entityId && translationDialog.type === "subcategory" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.subcategory.addTitle")}
                        fields={[
                            { key: "name", label: t("Addon.ManagementTabs.translationDialogs.subcategory.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.subcategory.fieldPlaceholder") }
                        ]}
                        allowedLanguageCodes={activeLanguageCodes}
                        onSave={async (id, locale, data) => await upsertAddonSubCategoryTranslation(id, { [locale]: data })}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.subcategory.checkTitle")}
                        displayFields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.fieldName") }]}
                        onFetch={getAllAddonSubCategoryTranslations}
                        onDelete={deleteAddonSubCategoryTranslationLocale}
                        onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, openCheck: false, editingLocale: locale, editingData: data }))}
                    />
                    <EditTranslationDialog
                        open={translationDialog.openEdit}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                        entityId={translationDialog.entityId!}
                        locale={translationDialog.editingLocale}
                        initialData={translationDialog.editingData}
                        title={t("Addon.ManagementTabs.translationDialogs.subcategory.editTitle")}
                        fields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.subcategory.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.subcategory.fieldPlaceholder") }]}
                        onSave={async (id, locale, data) => upsertAddonSubCategoryTranslation(id, { [locale]: data })}
                    />
                </>
            )}

            {/* ── Translation Dialogs — Variant ── */}
            {translationDialog.entityId && translationDialog.type === "variant" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.variant.addTitle")}
                        fields={[
                            { key: "name", label: t("Addon.ManagementTabs.translationDialogs.variant.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.variant.fieldPlaceholder") }
                        ]}
                        allowedLanguageCodes={activeLanguageCodes}
                        onSave={async (id, locale, data) => await upsertAddonVariantTranslation(id, { [locale]: data })}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title={t("Addon.ManagementTabs.translationDialogs.variant.checkTitle")}
                        displayFields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.fieldName") }]}
                        onFetch={getAllAddonVariantTranslations}
                        onDelete={deleteAddonVariantTranslationLocale}
                        onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, openCheck: false, editingLocale: locale, editingData: data }))}
                    />
                    <EditTranslationDialog
                        open={translationDialog.openEdit}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                        entityId={translationDialog.entityId!}
                        locale={translationDialog.editingLocale}
                        initialData={translationDialog.editingData}
                        title={t("Addon.ManagementTabs.translationDialogs.variant.editTitle")}
                        fields={[{ key: "name", label: t("Addon.ManagementTabs.translationDialogs.variant.fieldLabel"), placeholder: t("Addon.ManagementTabs.translationDialogs.variant.fieldPlaceholder") }]}
                        onSave={async (id, locale, data) => upsertAddonVariantTranslation(id, { [locale]: data })}
                    />
                </>
            )}
        </>
    );
}