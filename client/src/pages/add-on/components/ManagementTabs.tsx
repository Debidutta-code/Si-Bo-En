import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, MoreVertical, Layers, FolderTree, Package, Languages, PlusCircle } from "lucide-react";
import { AddTranslationDialog, CheckTranslationsDialog } from "../../management/components/multilang/ManagementTranslationDialogs";
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
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "category" | "subcategory" | "variant" | null;
        id: string | null;
        name: string | null;
    }>({ open: false, type: null, id: null, name: null });

    const [translationDialog, setTranslationDialog] = useState<{
        openAdd: boolean;
        openCheck: boolean;
        type: "category" | "subcategory" | "variant" | null;
        entityId: string | null;
    }>({
        openAdd: false,
        openCheck: false,
        type: null,
        entityId: null,
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
                        Categories ({categories.length})
                    </TabsTrigger>
                    <TabsTrigger value="subcategories">
                        <FolderTree className="w-4 h-4 mr-2" />
                        Subcategories ({subCategories.length})
                    </TabsTrigger>
                    <TabsTrigger value="variants">
                        <Package className="w-4 h-4 mr-2" />
                        Variants ({variants.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Manage add-on categories
                        </p>
                        <Button onClick={onCreateCategory} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Category
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{category._translations?category._translations.name:category.name}</h3>
                                            
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
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog({ openAdd: true, openCheck: false, type: 'category', entityId: category.id })}
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                    Add Translation
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setTranslationDialog({ openAdd: false, openCheck: true, type: 'category', entityId: category.id })}
                                                >
                                                    <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                    Check Translations
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({
                                                        open: true,
                                                        type: "category",
                                                        id: category.id,
                                                        name: category.name
                                                    })}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {subCategories.filter(s => s.categoryId === category.id).length} subcategories
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="subcategories" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Manage add-on subcategories
                        </p>
                        <Button onClick={onCreateSubCategory} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Subcategory
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subCategories?.map((subCategory) => {
                            return (
                                <Card key={subCategory.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{subCategory._translations?subCategory._translations.name:subCategory.name}</h3>
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
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog({ openAdd: true, openCheck: false, type: 'subcategory', entityId: subCategory.id })}
                                                    >
                                                        <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                        Add Translation
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog({ openAdd: false, openCheck: true, type: 'subcategory', entityId: subCategory.id })}
                                                    >
                                                        <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                        Check Translations
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteDialog({
                                                            open: true,
                                                            type: "subcategory",
                                                            id: subCategory.id,
                                                            name: subCategory.name
                                                        })}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {subCategory._translations?subCategory._translations.name:subCategory.name || "Unknown"}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {variants.filter(v => v.subcategoryId === subCategory.id).length} variants
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Manage add-on variants
                        </p>
                        <Button onClick={onCreateVariant} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Variant
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
                                                <h3 className="font-semibold text-lg">{variant._translations?variant._translations.name:variant.name}</h3>
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
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog({ openAdd: true, openCheck: false, type: 'variant', entityId: variant.id })}
                                                    >
                                                        <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                        Add Translation
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTranslationDialog({ openAdd: false, openCheck: true, type: 'variant', entityId: variant.id })}
                                                    >
                                                        <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                        Check Translations
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteDialog({
                                                            open: true,
                                                            type: "variant",
                                                            id: variant.id,
                                                            name: variant.name
                                                        })}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <Badge variant="secondary" className="text-xs w-fit">
                                                {category?._translations?category._translations.name:category?.name || "Unknown"} → {subCategory?._translations?subCategory?._translations.name:subCategory?.name || "Unknown"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
                setDeleteDialog({ open, type: null, id: null, name: null })
            }>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the {deleteDialog.type} "{deleteDialog.name}". 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Translation Dialogs */}
            {translationDialog.entityId && translationDialog.type === "category" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title="Add Category Translation"
                        fields={[
                            { key: "name", label: "Category Name", placeholder: "e.g. Comida..." }
                        ]}
                        onSave={async (id, locale, data) => {
                            return await upsertAddonCategoryTranslation(id, { [locale]: data });
                        }}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title="Category Translations"
                        displayFields={[{ key: "name", label: "Name" }]}
                        onFetch={getAllAddonCategoryTranslations}
                        onDelete={deleteAddonCategoryTranslationLocale}
                    />
                </>
            )}
            {translationDialog.entityId && translationDialog.type === "subcategory" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title="Add Subcategory Translation"
                        fields={[
                            { key: "name", label: "Subcategory Name", placeholder: "e.g. Desayuno..." }
                        ]}
                        onSave={async (id, locale, data) => {
                            return await upsertAddonSubCategoryTranslation(id, { [locale]: data });
                        }}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title="Subcategory Translations"
                        displayFields={[{ key: "name", label: "Name" }]}
                        onFetch={getAllAddonSubCategoryTranslations}
                        onDelete={deleteAddonSubCategoryTranslationLocale}
                    />
                </>
            )}
            {translationDialog.entityId && translationDialog.type === "variant" && (
                <>
                    <AddTranslationDialog
                        open={translationDialog.openAdd}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                        entityId={translationDialog.entityId}
                        title="Add Variant Translation"
                        fields={[
                            { key: "name", label: "Variant Name", placeholder: "e.g. Grande..." }
                        ]}
                        onSave={async (id, locale, data) => {
                            return await upsertAddonVariantTranslation(id, { [locale]: data });
                        }}
                    />
                    <CheckTranslationsDialog
                        open={translationDialog.openCheck}
                        onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                        entityId={translationDialog.entityId}
                        title="Variant Translations"
                        displayFields={[{ key: "name", label: "Name" }]}
                        onFetch={getAllAddonVariantTranslations}
                        onDelete={deleteAddonVariantTranslationLocale}
                    />
                </>
            )}
        </>
    );
}
