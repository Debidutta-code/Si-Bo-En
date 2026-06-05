import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBrandCreationId, getUsersForMapping, updateCreationService } from "../service/creation-filter.service"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { IBrandDetails, IBrandManagersMapping, ICreation, IUpdateCreation } from '../types/types';
import Loader from '@/components/Loader/Loader';
import CreateEntityDialog from '@/components/creation/creationDialog';
import BackButton from '@/components/shared/BackButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User2Icon, MoreVertical, CloudCog, Upload, Trash2, Settings } from 'lucide-react';
import { assignUserToProperty } from '../api/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageSlider from '@/components/shared/ImageSlider';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import DeleteCreationDialog from "@/components/creation/Delete-Creation.dialog";
import { Plus, Globe } from "lucide-react";
import AddCreationLanguageDialog from "@/components/creation/AddCreationLanguageDialog";
import CheckCreationLanguagesDialog from "@/components/creation/CheckCreationLanguagesDialog";
import { EditTranslationDialog } from "@/pages/management/components/multilang/ManagementTranslationDialogs";
import { upsertCreationTranslationService } from "../service/creation-lang.service";
import { useTranslation } from 'react-i18next';


export default function page() {
        const { t } = useTranslation();

    const { creationId } = useParams<{ creationId: string }>();
    const [brandManagers, setBrandManagers] = useState<IBrandManagersMapping>({
        brandManagers: []
    })
    const [assignBrandManagerDialogOpen, setAssignBrandManagerDialogOpen] = useState<boolean>(false)
    const [isAssigningUser, setIsAssigningUser] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<string>("")
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true)
    const [creations, setCreations] = useState<ICreation[]>([])
    const [brandDetails, setBrandDetails] = useState<IBrandDetails>({
        createdAt: "",
        id: "",
        isActive: false,
        name: "",
        under: "",
        users: [],
        images: [],
        _translations: {
            name: ""
        }
    })
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    const [updateBrandDetails, setUpdateBrandDetails] = useState<IUpdateCreation>({
        id: "",
        name: "",
        images: [],
        isActive: true
    });
    const currentTab = "property"

    const [addLanguageDialogOpen, setAddLanguageDialogOpen] = useState(false);
    const [checkLanguagesDialogOpen, setCheckLanguagesDialogOpen] = useState(false);
    const [editTranslationOpen, setEditTranslationOpen] = useState(false);
    const [editingLocale, setEditingLocale] = useState<string>("");
    const [editingData, setEditingData] = useState<Record<string, any>>({});

    const fetchGroup = async () => {
        try {

            if (!creationId) return;
            const response = await getBrandCreationId(creationId);
            if (response.success) {
                setCreations(response.data.properties)
                setBrandDetails(response.data.brandData)
            } else {
                toast.error(response.message || t('Toast.failedToFetch'));
            }
        } catch (error) {
            // console.log(error)
        } finally {
            setIsLoading(false)
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await getUsersForMapping();
            if (response.success) {
                // console.log("Fetched users for mapping:", response.data);
                const data = response.data;
                setBrandManagers(data);
            } else {
                toast.error(response.message || t('Toast.failedToFetchUsers'));
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error(t('Toast.failedToFetchUsers'));
        }
    }

    const handleAddMember = async () => {
        if (!selectedUser) {
            toast.error(t('Toast.pleaseSelectUser'));
            return;
        }
        if (!creationId) {
            toast.error(t('Toast.creationIdMissing'));
            return;
        }
        setIsAssigningUser(true);
        try {
            const response = await assignUserToProperty({
                creationId: creationId,
                userId: selectedUser,
                role: "group_manager"
            });
            if (response.success) {
                toast.success(t('Toast.userAssignedSuccessfully'));
                // Reset form
                setSelectedUser('');
                // You might want to refresh the property data or user list here
            } else {
                toast.error(response.message || t('Toast.failedToAssignUser'));
            }
        } catch (error) {
            console.error("Error assigning user:", error);
            toast.error(t('Toast.failedToAssignUser'));
        } finally {
            setIsAssigningUser(false);
        }
    }

    const openUpdateDialog = () => {
        setUpdateBrandDetails({
            id: brandDetails.id,
            name: brandDetails.name || '',
            images: brandDetails.images || [],
            isActive: brandDetails.isActive
        });
        setIsUpdateDialogOpen(true);
    };

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setUpdateBrandDetails(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(t('Toast.imagesUploadedSuccessfully', { count: uploadedUrls.length }));
    };

    const handleRemoveImage = (index: number) => {
        setUpdateBrandDetails(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateBrand = async () => {
        if (!creationId) {
            toast.error(t('Toast.invalidBrandId'));
            return;
        }
        try {
            const response = await updateCreationService(creationId, updateBrandDetails.name, updateBrandDetails.images, updateBrandDetails.isActive);
            if (!response.success) {
                toast.error(response.message || t('Toast.failedToUpdateBrand'));
                return;
            }
            toast.success(t('Toast.brandUpdatedSuccessfully'));
            await fetchGroup();
            setIsUpdateDialogOpen(false);
        } catch (err: any) {
            toast.error(t('Toast.failedToUpdateBrand'));
        }
    };

    useEffect(() => {
        fetchGroup();
        fetchUsers()
    }, [creationId])

    const getTabDisplayName = (tab: string): string => {
        const pluralMap: { [key: string]: string } = {
            property: t('Brand.properties')
        };
        return pluralMap[tab] || tab;
    };

    if (isLoading) {
        return (
            <div className='min-h-screen w-full flex justify-center items-center'>
                <Loader text={t('Brand.loadingYourBrands')} />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <BackButton />

            {/* Brand Details Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
                {/* Hero Image Slider Section */}
                {brandDetails.images?.length > 0 && (
                    <div className="w-full">
                        <ImageSlider
                            images={brandDetails.images}
                            alt={brandDetails.name}
                            height="h-80"
                        />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{brandDetails._translations ? brandDetails._translations.name : brandDetails.name}</h1>
                            <div className="flex items-center space-x-3">

                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${brandDetails.isActive
                                    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                    : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                    }`}>
                                    {brandDetails.isActive ? `● ${t('Common.active')}` : `● ${t('Common.inactive')}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t('Brand.totalProperties')}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{creations?.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t('Brand.brandManagers')}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{brandDetails.users?.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <User2Icon className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Managers List */}
                    {brandDetails.users?.length > 0 && (
                        <div className="border-t border-gray-200 pt-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <User2Icon className="h-4 w-4 mr-2 text-gray-500" />
                                {t('Brand.assignedManagers')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {brandDetails.users.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full px-4 py-2 border border-gray-200 hover:shadow-sm transition-shadow">
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-gray-600">
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.firstName} {user.lastName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Bar with Dropdown */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('Brand.title')}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('Brand.subtitle')}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 space-y-2">
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openUpdateDialog(); }} className="cursor-pointer">
                            <Button variant={"secondary"}>

                                <CloudCog className="h-4 w-4 mr-2 text-gray-600" /> {t('Brand.updateBrand')}
                            </Button>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAddLanguageDialogOpen(true); }} className="cursor-pointer">
                            <Button variant={"secondary"}>
                                <Plus className="h-4 w-4 mr-2 text-gray-600" /> {t("Common.addTranslation")}
                            </Button>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCheckLanguagesDialogOpen(true); }} className="cursor-pointer">
                            <Button variant={"secondary"}>
                                <Globe className="h-4 w-4 mr-2 text-gray-600" /> {t("Common.checkTranslation")}
                            </Button>
                        </DropdownMenuItem>

                        <Dialog onOpenChange={() => setAssignBrandManagerDialogOpen} open={assignBrandManagerDialogOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                    <Button variant={"secondary"} onClick={() => { setAssignBrandManagerDialogOpen(true) }}>

                                        <User2Icon className='h-4 w-4 mr-2' /> {t('Brand.assignBrandManager')}
                                    </Button>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-[425px]'>
                                <DialogHeader>
                                    <DialogTitle>{t('Brand.assignBrandManager')}</DialogTitle>
                                    <DialogDescription>
                                        {t('Brand.assignBrandManagerDescription')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4 py-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='user'>{t('Common.name')}</Label>
                                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('Brand.selectUser')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brandManagers?.brandManagers?.length > 0 ? (
                                                    brandManagers.brandManagers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.firstName} {user.lastName} {user.email && `(${user.email})`}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="qq" disabled>
                                                        {t('Brand.noUsersAvailable')}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleAddMember}
                                        disabled={!selectedUser || isAssigningUser}
                                    >
                                        {isAssigningUser ? t('Common.assigning') : t('Common.assignUser')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="px-2">
                            <CreateEntityDialog creationType={"brand"} currentTab={currentTab} creationId={creationId ? creationId : ""} level={2} fetchProperties={fetchGroup} />
                        </div>
                        <div className="px-2">
                            <DeleteCreationDialog type={t(`CreateEntity.types.${"brand"}`)as any} name={updateBrandDetails.name} id={creationId ? creationId : ""} />
                        </div>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>

            {/* Update Brand Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('Brand.updateBrand')}</DialogTitle>
                        <DialogDescription>{t('Brand.assignBrandManagerDescription')}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-sm font-medium">{t('Common.name')}</Label>
                            <Input
                                value={updateBrandDetails.name}
                                onChange={(e) => setUpdateBrandDetails({ ...updateBrandDetails, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        {/* Images Section */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('Property.images')}</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImageUploadModalOpen(true)}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {t('Common.uploadImages')}
                            </Button>

                            {/* Image Preview Grid */}
                            {updateBrandDetails.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {updateBrandDetails.images.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="active"
                                type="checkbox"
                                checked={updateBrandDetails.isActive}
                                onChange={(e) => setUpdateBrandDetails({ ...updateBrandDetails, isActive: e.target.checked })}
                            />
                            <Label htmlFor="active" className="text-sm cursor-pointer">{t('Common.active')}</Label>
                        </div>
                    </div>

                    {/* Image Upload Modal */}
                    <ImageUploadModal
                        isOpen={isImageUploadModalOpen}
                        onClose={() => setIsImageUploadModalOpen(false)}
                        // uploadImages={uploadImages}
                        onUploadSuccess={handleUploadSuccess}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>{t('Common.cancel')}</Button>
                        <Button onClick={handleUpdateBrand}>{t('Common.save')}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Content Display */}
            <div className="bg-white p-6 rounded-lg shadow">

                {/* Data Grid */}
                {creations?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M9 21h4"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {t('Brand.noFound', { item: getTabDisplayName(currentTab) })}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {t('Brand.getStarted', { item: currentTab })}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{creations?.map((item: ICreation) => (
  <div
    key={item.id}
    className={`border rounded-lg overflow-hidden flex flex-col transition-shadow duration-200
      ${item.isDeleted
        ? "border-red-300 bg-red-50 opacity-60 pointer-events-none"
        : "hover:shadow-md"
      }`}
  >
    {/* Image */}
    <div className="relative w-full h-48 overflow-hidden bg-gray-100">
      {item.images?.[0] ? (
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
            e.currentTarget.className = 'w-full h-full object-contain bg-gray-100 p-4';
          }}
        />
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center
          ${item.isDeleted ? "bg-red-50" : "bg-gray-100"}`}>
          <svg className={`w-12 h-12 mb-2 ${item.isDeleted ? "text-red-300" : "text-gray-400"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={`text-sm ${item.isDeleted ? "text-red-300" : "text-gray-400"}`}>
            {t('Common.noImage')}
          </p>
        </div>
      )}

      {/* Deleted badge */}
      {item.isDeleted && (
        <span className="absolute top-2 right-2 flex items-center gap-1 bg-red-700 text-red-100
          text-xs font-medium px-2.5 py-1 rounded-full">
          <Trash2 className="w-3 h-3" />
          {t('Common.deleted') ?? 'Deleted'}
        </span>
      )}

      {/* Diagonal stripe overlay */}
      {item.isDeleted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(185,28,28,0.06) 6px, rgba(185,28,28,0.06) 12px)"
          }}
        />
      )}
    </div>

    {/* Body */}
    <div className="p-4 flex-1 flex flex-col gap-3">
      <h3 className={`font-semibold text-lg line-clamp-2
        ${item.isDeleted ? "text-red-800 line-through decoration-red-300" : "text-gray-900"}`}>
        {item._translations ? item._translations.name : item.name}
      </h3>

      <div className="mt-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={item.isDeleted}
          className={`${item.type === "property" ? item.property?.isDraft ? "flex-1" : "hidden" : "flex-1"}
            ${item.isDeleted ? "border-red-200 text-red-400 cursor-not-allowed" : ""}`}
          onClick={() => {
            item.type !== "property"
              ? navigate(`/app/property/${currentTab}/${item.id}`)
              : navigate(`/property/${item.property?.id}`)
          }}
        >
          {t('Common.viewDetails')}
        </Button>

        {item.type === "property" && (
          <Button
            variant="outline"
            size="sm"
            disabled={item.isDeleted}
            className={`${!item.property?.isDraft ? "flex-1" : ""}
              ${item.isDeleted ? "border-red-200 text-red-400 cursor-not-allowed" : ""}`}
            onClick={() => navigate(`/app/property/${currentTab}/${item.id}`)}
          >
            <Settings className="h-4 w-4" />
            {!item.property?.isDraft && (
              <span className="ml-2">{t('Common.completeSetup')}</span>
            )}
          </Button>
        )}
      </div>
    </div>
  </div>
))}
                    </div>
                )}
            </div>

            {brandDetails.id && (
                <>
                    <AddCreationLanguageDialog
                        open={addLanguageDialogOpen}
                        onOpenChange={setAddLanguageDialogOpen}
                        creationId={brandDetails.id}
                    />
                    <CheckCreationLanguagesDialog
                        open={checkLanguagesDialogOpen}
                        onOpenChange={setCheckLanguagesDialogOpen}
                        creationId={brandDetails.id}
                        onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
                    />
                    <EditTranslationDialog
                        open={editTranslationOpen}
                        onOpenChange={setEditTranslationOpen}
                        entityId={brandDetails.id}
                        locale={editingLocale}
                        initialData={editingData}
                        title={t("EditBrandTranslation.title")}
                        fields={[
                            { key: "name", label: t("EditBrandTranslation.field"), placeholder: t("EditBrandTranslation.placeholder") },
                        ]}
                        onSave={async (id, locale, data) => upsertCreationTranslationService(id, { [locale]: data })}
                    />
                </>
            )}
        </div>
    )
}
