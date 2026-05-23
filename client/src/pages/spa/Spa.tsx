import  { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Edit, Trash, CalendarPlus, X, Eye, UserPlus, Languages, PlusCircle } from 'lucide-react';
import type { ILoader } from '../dashboard/interface';
import type { ISpa, ICSpaC, IUSpaR } from './interfaces/spa.type';
import { getSpaService, createSpaService, updateSpaService, deleteSpaService } from './services';
import { getAllSpaCategoryService, getAllSpaSubCategoriesService } from '../management/services/spa.services';
import type { ISpaCategory, ISpaSubCategory } from '../management/types';
import { getSpaUsersForPropertyService, assignSpaToUserService } from './services';
import type { ISpaUser } from './interfaces'; 
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from '../management/components/multilang/ManagementTranslationDialogs';
import { upsertSpaTranslationService, getAllSpaTranslationsService, deleteSpaTranslationLocaleService } from './services/multilang.services';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Loader from '@/components/Loader/Loader';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import { currencies } from '@/components/currency-code/cuurency';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { format } from 'date-fns';
import SpaCalendar from './components/SpaCalendar';
import SpaViewDialog from './components/SpaViewDialog';
import SpaAssignUserDialog from './components/SpaAssignUserDialog';
import BackButton from '@/components/shared/BackButton';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { languages } from '@/components/language/language';

export default function Spa() {
  const { t } = useTranslation();
  const { propertyId, spaId } = useParams();
  const navigate = useNavigate();
  const { languages: propertyLanguages } = usePropertyContext();
  const availableLanguages = propertyLanguages && propertyLanguages.length > 0
    ? languages.filter((l) => propertyLanguages.some((pl) => pl.language === l.code))
    : languages;

  const [loader, setLoader] = useState<ILoader>({ isLoading: true, message: t('Spa.loader.loading') });
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [categories, setCategories] = useState<ISpaCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ISpaSubCategory[]>([]);
  const [spaUsers, setSpaUsers] = useState<ISpaUser[]>([]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<string>("");
  
  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [selectedSpa, setSelectedSpa] = useState<ISpa | null>(null);
  const [editIsActive, setEditIsActive] = useState(false);

  // Form State
  const initialFormState: ICSpaC = {
    name: '',
    itemCode: '',
    description: '',
    benefits: [],
    conditions: {},
    isInclusive: false,
    images: [],
    serviceTime: 30,
    location: '',
    discountValue: null,
    currencyCode: null,
    categoryId: '',
    subCategoryId: '',
    propertyId: propertyId || ''
  };
  const [formData, setFormData] = useState<ICSpaC>(initialFormState);

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    if (!propertyId) return;
    setLoader({ isLoading: true, message: t('Spa.Spa.loader.fetchingSpas') });
    try {
      const [spaRes, catRes, subCatRes, spaUserRes] = await Promise.all([
        getSpaService(propertyId),
        getAllSpaCategoryService(),
        getAllSpaSubCategoriesService(),
        getSpaUsersForPropertyService(propertyId)
      ]);
      if (spaRes.success) setSpas(spaRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (subCatRes.success) setSubCategories(subCatRes.data);
      if (spaUserRes.success) setSpaUsers(spaUserRes.data.level0Users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoader({ isLoading: false, message: '' });
    }
  };

  const handleCreate = async () => {
    setLoader({ isLoading: true, message: t('Spa.loader.creating') });
    const res = await createSpaService(formData);
    if (res.success) {
      setIsCreateOpen(false);
      fetchData();
      setFormData(initialFormState);
    }
    setLoader({ isLoading: false, message: '' });
  };

  const handleUpdate = async () => {
    if (!selectedSpa) return;
    setLoader({ isLoading: true, message: t('Spa.loader.updating') });
    const updateData: IUSpaR = {
      name: formData.name,
      itemCode: formData.itemCode,
      description: formData.description,
      benefits: formData.benefits,
      conditions: formData.conditions,
      isInclusive: formData.isInclusive,
      images: formData.images,
      serviceTime: formData.serviceTime,
      location: formData.location,
      discountValue: formData.discountValue,
      currencyCode: formData.currencyCode,
      categoryId: formData.categoryId,
      subCategoryId: formData.subCategoryId,
      isActive: editIsActive
    };
    const res = await updateSpaService((selectedSpa as any).id, updateData);
    if (res.success) {
      setIsEditOpen(false);
      fetchData();
    }
    setLoader({ isLoading: false, message: '' });
  };

  const handleDelete = async () => {
    if (!selectedSpa) return;
    setLoader({ isLoading: true, message: t('Spa.loader.deleting') });
    const res = await deleteSpaService((selectedSpa as any).id);
    if (res.success) {
      setIsDeleteOpen(false);
      fetchData();
    }
    setLoader({ isLoading: false, message: '' });
  };

  const handleImageUploadSuccess = (uploadedUrls: string[]) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openEdit = (spa: ISpa) => {
    setSelectedSpa(spa);
    setEditIsActive(spa.isActive);
    setFormData({
      name: spa.name,
      itemCode: spa.itemCode,
      description: spa.description,
      benefits: spa.benefits || [],
      conditions: spa.conditions || {},
      isInclusive: spa.isInclusive,
      images: spa.images || [],
      serviceTime: spa.serviceTime,
      location: spa.location,
      discountValue: spa.discountValue,
      currencyCode: spa.currencyCode,
      categoryId: spa.categoryId,
      subCategoryId: spa.subCategoryId,
      propertyId: spa.propertyId
    });
    setIsEditOpen(true);
  };

  const openDelete = (spa: ISpa) => {
    setSelectedSpa(spa);
    setIsDeleteOpen(true);
  };

  const openView = (spa: ISpa) => {
    setSelectedSpa(spa);
    setIsViewOpen(true);
  };

  const openAssign = (spa: ISpa) => {
    setSelectedSpa(spa);
    setSelectedUserForAssign('');
    setIsAssignOpen(true);
  };

  const handleAssignUser = async () => {
    if (!selectedSpa || !selectedUserForAssign) return;
    setLoader({ isLoading: true, message: t('Spa.loader.assigningUser') });
    const res = await assignSpaToUserService((selectedSpa as any).id, selectedUserForAssign);
    if (res.success) {
      setIsAssignOpen(false);
      fetchData();
    }
    setLoader({ isLoading: false, message: '' });
  };

  if (loader.isLoading) return <Loader text={loader.message} />;

  // Detailed Spa Slot View
  if (spaId) {
    const spaDetails = spas.find(s => s.id === spaId);
    return (
      <div className="p-4 h-[calc(100vh-4rem)] bg-gray-50/50">
        {spaDetails ? (
          <SpaCalendar spaId={spaId} propertyId={propertyId || ''} spaDetails={spaDetails} />
        ) : (
          <Loader text={t('Spa.loader.loadingSpaDetails')} />
        )}
      </div>
    );
  }

  // Shared form fields used in both Create and Edit dialogs
  const renderFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t('Spa.form.name')}</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>{t('Spa.form.itemCode')}</Label>
        <Input value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})} />
      </div>
      <div className="space-y-2 col-span-2">
        <Label>{t('Spa.form.description')}</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>{t('Spa.form.category')}</Label>
        <select className="w-full border rounded-md p-2" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
          <option value="">{t('Spa.form.selectCategory')}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c._translations ? c._translations.name : c.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>{t('Spa.form.subCategory')}</Label>
        <select className="w-full border rounded-md p-2" value={formData.subCategoryId} onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}>
          <option value="">{t('Spa.form.selectSubCategory')}</option>
          {subCategories.filter(sc => sc.categoryId === formData.categoryId).map(sc => <option key={sc.id} value={sc.id}>{sc._translations ? sc._translations.name : sc.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>{t('Spa.form.serviceTime')}</Label>
        <Input type="number" value={formData.serviceTime} onChange={(e) => setFormData({...formData, serviceTime: Number(e.target.value)})} />
      </div>
      <div className="space-y-2">
        <Label>{t('Spa.form.location')}</Label>
        <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
      </div>
      {!formData.isInclusive && (
        <>
          <div className="space-y-2">
            <Label>{t('Spa.form.discountValue')}</Label>
            <Input type="number" value={formData.discountValue || ''} onChange={(e) => setFormData({...formData, discountValue: e.target.value ? Number(e.target.value) : null})} />
          </div>
          <div className="space-y-2">
            <Label>{t('Spa.form.currencyCode')}</Label>
            <select className="w-full border rounded-md p-2" value={formData.currencyCode || ''} onChange={(e) => setFormData({...formData, currencyCode: e.target.value as CurrencyCode || null})}>
              <option value="">{t('Spa.form.selectCurrency')}</option>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>)}
            </select>
          </div>
        </>
      )}
      <div className="col-span-2 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch checked={formData.isInclusive} onCheckedChange={(checked) => setFormData({...formData, isInclusive: checked})} />
          <Label>{t('Spa.form.isInclusive')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
          <Label>{t('Spa.form.isActive')}</Label>
        </div>
      </div>
      <div className="space-y-2 col-span-2">
        <Label>{t('Spa.form.images')}</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 border rounded-md overflow-hidden">
              <img src={img} alt="spa" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-bl-md p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={() => setIsImageUploadOpen(true)} type="button">
          {t('Spa.form.uploadImages')}
        </Button>
      </div>
    </div>
  );

  // Main Listing View
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold">{t('Spa.title')}</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> {t('Spa.createDialog.trigger')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('Spa.createDialog.title')}</DialogTitle>
            </DialogHeader>
            {renderFormFields()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t('Spa.form.cancel')}</Button>
              <Button onClick={handleCreate}>{t('Spa.form.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Spa.table.name')}</TableHead>
              <TableHead>{t('Spa.table.code')}</TableHead>
              <TableHead>{t('Spa.table.category')}</TableHead>
              <TableHead>{t('Spa.table.subCategory')}</TableHead>
              <TableHead>{t('Spa.table.time')}</TableHead>
              <TableHead>{t('Spa.table.location')}</TableHead>
              <TableHead>{t('Spa.table.createdAt')}</TableHead>
              <TableHead>{t('Spa.table.createdBy')}</TableHead>
              <TableHead>{t('Spa.table.status')}</TableHead>
              <TableHead className="text-right">{t('Spa.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spas.map((spa) => (
              <TableRow key={(spa as any).id}>
                <TableCell className="font-medium">{spa._translations ? spa._translations.name : spa.name}</TableCell>
                <TableCell>{spa.itemCode}</TableCell>
                <TableCell>{spa.Category?._translations ? spa.Category._translations.name : spa.Category?.name || t('Spa.table.na')}</TableCell>
                <TableCell>{spa.SubCategory?._translations ? spa.SubCategory._translations.name : spa.SubCategory?.name || t('Spa.table.na')}</TableCell>
                <TableCell>{spa.serviceTime}</TableCell>
                <TableCell>{spa.location}</TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">{format(new Date((spa as any).createdAt), 'dd MMM yyyy, p')}</span>
                </TableCell>
                <TableCell>
                  {spa.User ? (
                    <div className="flex flex-col text-xs">
                      <span>{spa.User.firstName} {spa.User.lastName}</span>
                      <span className="text-gray-500">{spa.User.email}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">{t('Spa.table.unknown')}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${spa.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {spa.isActive ? t('Spa.table.active') : t('Spa.table.inactive')}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/property/spa/${propertyId}/${(spa as any).id}`)}>
                        <CalendarPlus className="mr-2 h-4 w-4" /> {t('Spa.actions.addDateSlot')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openView(spa)}>
                        <Eye className="mr-2 h-4 w-4" /> {t('Spa.actions.viewDetails')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setTranslationEntityId((spa as any).id); setAddTranslationOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4 text-blue-500" /> {t('Spa.actions.addTranslation')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setTranslationEntityId((spa as any).id); setCheckTranslationsOpen(true); }}>
                        <Languages className="mr-2 h-4 w-4 text-green-600" /> {t('Spa.actions.checkTranslations')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAssign(spa)}>
                        <UserPlus className="mr-2 h-4 w-4" /> {t('Spa.actions.assignUser')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(spa)}>
                        <Edit className="mr-2 h-4 w-4" /> {t('Spa.actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDelete(spa)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> {t('Spa.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {spas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">{t('Spa.table.noSpas')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Spa.editDialog.title')}</DialogTitle>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('Spa.form.cancel')}</Button>
            <Button onClick={handleUpdate}>{t('Spa.form.update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Spa.deleteDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-red-600 font-semibold">
            {t('Spa.deleteDialog.warning')}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('Spa.form.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('Spa.deleteDialog.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <SpaViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        selectedSpa={selectedSpa} 
        onUpdate={() => {
          fetchData();
          setIsViewOpen(false);
        }}
      />
      
      {/* Assign User Dialog */}
      <SpaAssignUserDialog 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        selectedSpa={selectedSpa} 
        spaUsers={spaUsers}
        selectedUserForAssign={selectedUserForAssign}
        setSelectedUserForAssign={setSelectedUserForAssign}
        handleAssignUser={handleAssignUser}
      />

      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        onUploadSuccess={handleImageUploadSuccess}
      />

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title={t('Spa.translation.addTitle')}
            fields={[
              { key: "name", label: t('Spa.translation.fieldName'), placeholder: t('Spa.translation.fieldNamePlaceholder') },
              { key: "description", label: t('Spa.translation.fieldDescription'), placeholder: t('Spa.translation.fieldDescriptionPlaceholder') },
              { key: "location", label: t('Spa.translation.fieldLocation'), placeholder: t('Spa.translation.fieldLocationPlaceholder') }
            ]}
            onSave={async (id, locale, data) => {
              return await upsertSpaTranslationService(id, { [locale]: data });
            }}
            allowedLanguageCodes={availableLanguages.map((l) => l.code)}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={t('Spa.translation.checkTitle')}
            displayFields={[
              { key: "name", label: t('Spa.translation.fieldName') },
              { key: "description", label: t('Spa.translation.fieldDescription') },
              { key: "location", label: t('Spa.translation.fieldLocation') }
            ]}
            onFetch={getAllSpaTranslationsService}
            onDelete={deleteSpaTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title={t('Spa.translation.editTitle')}
            fields={[
              { key: "name", label: t('Spa.translation.fieldName'), placeholder: t('Spa.translation.fieldNamePlaceholder') },
              { key: "description", label: t('Spa.translation.fieldDescription'), placeholder: t('Spa.translation.fieldDescriptionPlaceholder') },
              { key: "location", label: t('Spa.translation.fieldLocation'), placeholder: t('Spa.translation.fieldLocationPlaceholder') }
            ]}
            onSave={async (id, locale, data) => upsertSpaTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </div>
  );
}