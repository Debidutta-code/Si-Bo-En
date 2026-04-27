import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Edit, Trash, CalendarPlus, X, Eye, UserPlus } from 'lucide-react';
import type { ILoader } from '../dashboard/interface';
import type { ISpa, ICSpaC, IUSpaR } from './interfaces/spa.type';
import { getSpaService, createSpaService, updateSpaService, deleteSpaService } from './services';
import { getAllSpaCategoryService, getAllSpaSubCategoriesService } from '../management/services/spa.services';
import type { ISpaCategory, ISpaSubCategory } from '../management/types';
import { getSpaUsersForPropertyService, assignSpaToUserService } from './services';
import type { ISpaUser } from './interfaces'; 

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Loader from '@/components/Loader/Loader'; // Assuming path
import ImageUploadModal from '@/components/property/ImageUploadModal';
import { currencies } from '@/components/currency-code/cuurency';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { format } from 'date-fns';
import SpaCalendar from './components/SpaCalendar';
import SpaViewDialog from './components/SpaViewDialog';
import SpaAssignUserDialog from './components/SpaAssignUserDialog';

export default function Spa() {
  const { propertyId, spaId } = useParams();
  const navigate = useNavigate();

  const [loader, setLoader] = useState<ILoader>({ isLoading: true, message: 'Loading...' });
  const [spas, setSpas] = useState<ISpa[]>([]);
  const [categories, setCategories] = useState<ISpaCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ISpaSubCategory[]>([]);
  const [spaUsers, setSpaUsers] = useState<ISpaUser[]>([]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<string>("");
  
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
    setLoader({ isLoading: true, message: 'Fetching Spas...' });
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
    setLoader({ isLoading: true, message: 'Creating...' });
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
    setLoader({ isLoading: true, message: 'Updating...' });
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
    setLoader({ isLoading: true, message: 'Deleting...' });
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
  }

  const openAssign = (spa: ISpa) => {
    setSelectedSpa(spa);
    setSelectedUserForAssign('');
    setIsAssignOpen(true);
  }

  const handleAssignUser = async () => {
    if (!selectedSpa || !selectedUserForAssign) return;
    setLoader({ isLoading: true, message: 'Assigning User...' });
    const res = await assignSpaToUserService((selectedSpa as any).id, selectedUserForAssign);
    if (res.success) {
      setIsAssignOpen(false);
      fetchData();
    }
    setLoader({ isLoading: false, message: '' });
  }

  if (loader.isLoading) return <Loader text={loader.message} />;

  // Detailed Spa Slot View
  if (spaId) {
    const spaDetails = spas.find(s => s.id === spaId);
    
    return (
     <div className="p-4 h-[calc(100vh-4rem)] bg-gray-50/50">
        {spaDetails ? (
           <SpaCalendar spaId={spaId} propertyId={propertyId || ''} spaDetails={spaDetails} />
        ) : (
           <Loader text="Loading Spa details..." />
        )}
     </div>
    );
  }

  // Main Listing View
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Spas & Activities</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Spa/Activity</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Spa/Activity</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Item Code</Label>
                <Input value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full border rounded-md p-2" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Sub-Category</Label>
                <select className="w-full border rounded-md p-2" value={formData.subCategoryId} onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}>
                  <option value="">Select Sub-Category</option>
                  {subCategories.filter(sc => sc.categoryId === formData.categoryId).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Service Time (mins)</Label>
                <Input type="number" value={formData.serviceTime} onChange={(e) => setFormData({...formData, serviceTime: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              {!formData.isInclusive && (
                <>
                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <Input type="number" value={formData.discountValue || ''} onChange={(e) => setFormData({...formData, discountValue: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Code</Label>
                    <select className="w-full border rounded-md p-2" value={formData.currencyCode || ''} onChange={(e) => setFormData({...formData, currencyCode: e.target.value as CurrencyCode || null})}>
                      <option value="">Select Currency</option>
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="col-span-2 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.isInclusive} onCheckedChange={(checked) => setFormData({...formData, isInclusive: checked})} />
                  <Label>Is Inclusive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <Label>Is Active</Label>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Images</Label>
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
                  Upload Images
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sub-Category</TableHead>
              <TableHead>Time (mins)</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spas.map((spa) => (
              <TableRow key={(spa as any).id}>
               
                <TableCell className="font-medium">{spa.name}</TableCell>
                <TableCell>{spa.itemCode}</TableCell>
                <TableCell>{spa.Category?.name || 'N/A'}</TableCell>
                <TableCell>{spa.SubCategory?.name || 'N/A'}</TableCell>
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
                    <span className="text-gray-500 text-xs">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${spa.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {spa.isActive ? 'Active' : 'Inactive'}
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
                        <CalendarPlus className="mr-2 h-4 w-4" /> Add Date/Slot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openView(spa)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAssign(spa)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(spa)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDelete(spa)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {spas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No spas or activities found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Spa/Activity</DialogTitle>
          </DialogHeader>
          {/* Reusing fields for brevity in this block */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Item Code</Label>
                <Input value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Service Time (mins)</Label>
                <Input type="number" value={formData.serviceTime} onChange={(e) => setFormData({...formData, serviceTime: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              {!formData.isInclusive && (
                <>
                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <Input type="number" value={formData.discountValue || ''} onChange={(e) => setFormData({...formData, discountValue: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Code</Label>
                    <select className="w-full border rounded-md p-2" value={formData.currencyCode || ''} onChange={(e) => setFormData({...formData, currencyCode: e.target.value as CurrencyCode || null})}>
                      <option value="">Select Currency</option>
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="col-span-2 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.isInclusive} onCheckedChange={(checked) => setFormData({...formData, isInclusive: checked})} />
                  <Label>Is Inclusive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <Label>Is Active</Label>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Images</Label>
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
                  Upload Images
                </Button>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-red-600 font-semibold">
            Are you sure you want to delete this Spa/Activity?
            Warning: Clicking delete will remove all associated slots and dates!
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
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
    </div>
  );
}
