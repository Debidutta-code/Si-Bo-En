import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Loader from '@/components/Loader/Loader';
import { EarlyBirdPromotionForm } from './components';
import {
    getEarlyBirdPromotionsByPropertyService,
    createEarlyBirdPromotionService,
    updateEarlyBirdPromotionService,
    deleteEarlyBirdPromotionService
} from './services';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import { fetchRoomTypesService } from '@/pages/inventory/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { RoomTypes } from '@/pages/inventory/types';
import {
    type CreateEarlyBirdPromotion,
    type EarlyBirdPromotionWithRatePlan,
} from './interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Check, Clock, Edit, MoreVertical, Trash2, X, Plus, Languages } from 'lucide-react';
import { convertBackendToApplicableDays } from '../device-specific/interfaces/mobilePromotion.type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { ILoader } from '@/pages/dashboard/interface';
import BackButton from '@/components/shared/BackButton';
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from '@/pages/management/components/multilang/ManagementTranslationDialogs';
import {
  upsertPromotionTranslationService,
  getAllPromotionTranslationsService,
  deletePromotionTranslationLocaleService,
} from '../multilanguage/service/promotion.service';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { languages } from '@/components/language/language';

export const EarlyBirdPromotionList: React.FC = () => {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [promotions, setPromotions] = useState<EarlyBirdPromotionWithRatePlan[]>([]);
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
    const [isLoading, setIsLoading] = useState<ILoader>({
        isLoading: false,
        message: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<EarlyBirdPromotionWithRatePlan | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

    const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
    const [addTranslationOpen, setAddTranslationOpen] = useState(false);
    const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
    const [editTranslationOpen, setEditTranslationOpen] = useState(false);
    const [editingLocale, setEditingLocale] = useState<string>("");
    const [editingData, setEditingData] = useState<Record<string, any>>({});
        const { languages: propertyLanguages } = usePropertyContext();
        const availableLanguages = propertyLanguages && propertyLanguages.length > 0
            ? languages.filter((l) => propertyLanguages.some((pl) => pl.language === l.code))
            : languages;

    useEffect(() => {
        loadData();
    }, [propertyId]);

    const loadData = async () => {
    setIsLoading({isLoading: true, message: t('EarlyBird.loadingPromotions')});
    try {
        if (!propertyId) {
            return;
        }

        const [promotionsResponse, plansResponse, roomsResponse] = await Promise.all([
            getEarlyBirdPromotionsByPropertyService(propertyId),
            fetchRatePlansService(propertyId),
            fetchRoomTypesService(propertyId)
        ]);

        if (promotionsResponse.success) {
            // Group promotions by id and construct roomRatePlans array
            const promotionsMap = new Map<string, EarlyBirdPromotionWithRatePlan>();
            
            (promotionsResponse.data || []).forEach((promo: any) => {
                if (!promotionsMap.has(promo.id)) {
                    // First occurrence of this promotion
                    promotionsMap.set(promo.id, {
                        ...promo,
                        applicableDays: convertBackendToApplicableDays(promo),
                        roomRatePlans: [],
                        
                    });
                }
                
                // Add room-rateplan pair to the array
                const promotion = promotionsMap.get(promo.id)!;
                if (promo.roomId && promo.ratePlanId) {
                    promotion.roomRatePlans!.push({
                        roomId: promo.roomId,
                        roomType: promo.roomType || undefined,
                        ratePlanId: promo.ratePlanId,
                        ratePlanCode: promo.ratePlanCode
                    });
                }
            });
            
            setPromotions(Array.from(promotionsMap.values()));
        }
        if (plansResponse.success) {
            setRatePlans(plansResponse.data || []);
        }
        if (roomsResponse.success) {
            setRoomTypes(roomsResponse.data || []);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t('EarlyBird.failedToLoadPromotions'));
    } finally {
        setIsLoading({
            isLoading:false,
            message:''
        });
    }
};

    const handleCreate = async (payload: CreateEarlyBirdPromotion) => {
        setIsLoading({
            isLoading:true,
            message: t('EarlyBird.creatingPromotion')
        });
        try {
            const result = await createEarlyBirdPromotionService(payload);
            if (result.success) {
                setShowForm(false);
                loadData();
                toast.success(t('EarlyBird.promotionCreatedSuccessfully'));
            } else {
                toast.error(result.message || t('EarlyBird.failedToCreatePromotion'));
            }
        } catch (error) {
            toast.error(t('EarlyBird.errorCreatingPromotion'));
        } finally {
            setIsLoading({
                isLoading:false,
                message:''
            });
        }
    };

    const handleUpdate = async (payload: CreateEarlyBirdPromotion) => {
        if (!editData) return;

        setIsLoading({
            isLoading:true,
            message: t('EarlyBird.updatingPromotion')
        });
        try {
            const updatePayload = {
                promotionName: payload.promotionName,
                discountType: payload.discountType,
                discountValue: payload.discountValue,
                currencyCode: payload.currencyCode,
                validFrom: payload.validFrom,
                validTo: payload.validTo,
                monApplicable: payload.monApplicable,
                tueApplicable: payload.tueApplicable,
                wedApplicable: payload.wedApplicable,
                thuApplicable: payload.thuApplicable,
                friApplicable: payload.friApplicable,
                satApplicable: payload.satApplicable,
                sunApplicable: payload.sunApplicable,
                isActive: payload.isActive,
                advanceBookingDays: payload.advanceBookingDays,
                isAutoApplied: payload.isAutoApplied
            };

            const result = await updateEarlyBirdPromotionService(editData.id, updatePayload);

            if (result.success) {
                setShowForm(false);
                setEditData(null);
                loadData();
                toast.success(t('EarlyBird.promotionUpdatedSuccessfully'));
            } else {
                toast.error(result.message || t('EarlyBird.failedToUpdatePromotion'));
            }
        } catch (error) {
            toast.error(t('EarlyBird.errorUpdatingPromotion'));
        } finally {
            setIsLoading({
                isLoading:false,
                message:''
            });
        }
    };

    const handleDeleteClick = (promotionId: string) => {
        setPromotionToDelete(promotionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!promotionToDelete) return;

        setIsLoading({
            isLoading:true,
            message: t('EarlyBird.deletingPromotion')
        });
        try {
            const result = await deleteEarlyBirdPromotionService(promotionToDelete);
            if (result.success) {
                loadData();
                toast.success(t('EarlyBird.promotionDeletedSuccessfully'));
            } else {
                toast.error(result.message || t('EarlyBird.failedToDeletePromotion'));
            }
        } catch (error) {
            toast.error(t('EarlyBird.errorDeletingPromotion'));
        } finally {
            setIsLoading({
                isLoading:false,
                message:''
            });
            setDeleteDialogOpen(false);
            setPromotionToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPromotionToDelete(null);
    };

    const handleEdit = (promotion: EarlyBirdPromotionWithRatePlan) => {
        setEditData(promotion);
        setShowForm(true);
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return t('EarlyBird.notAvailable');
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getActiveDays = (days: any) => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return Object.entries(days)
            .filter(([_, isActive]) => isActive)
            .map(([day]) => {
                const index = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.toLowerCase());
                return dayNames[index];
            })
            .join(', ');
    };

    const getDiscountDisplay = (promotion: EarlyBirdPromotionWithRatePlan) => {
        if (promotion.discountType === 'percentage') {
            return `${promotion.discountValue}% OFF`;
        } else {
            return `${promotion.currencyCode || 'USD'} ${promotion.discountValue} OFF`;
        }
    };

    if (showForm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                        {editData ? t('EarlyBird.form.editTitle') : t('EarlyBird.form.createTitle')}
                    </h2>
                </div>
                <EarlyBirdPromotionForm
                    ratePlans={ratePlans}
                    roomTypes={roomTypes}
                    propertyId={propertyId!}
                    onSubmit={editData ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setShowForm(false);
                        setEditData(null);
                    }}
                    editData={editData}
                    isLoading={isLoading}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <BackButton/>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{t('EarlyBird.earlyBirdPromotions')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('EarlyBird.targetDescription')}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    {t('EarlyBird.createButton')}
                </button>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
                {isLoading.isLoading ? (
                    <div className="py-12">
                        <Loader text={isLoading.message} />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('EarlyBird.ratePlans')}</TableHead>
                                <TableHead>{t('EarlyBird.promotionName')}</TableHead>
                                <TableHead>{t('EarlyBird.advanceDays')}</TableHead>
                                <TableHead>{t('EarlyBird.discount')}</TableHead>
                                <TableHead>{t('EarlyBird.startDate')}</TableHead>
                                <TableHead>{t('EarlyBird.endDate')}</TableHead>
                                <TableHead>{t('EarlyBird.activeDays')}</TableHead>
                                <TableHead>{t('EarlyBird.autoApplied')}</TableHead>
                                <TableHead>{t('EarlyBird.status')}</TableHead>
                                <TableHead>{t('EarlyBird.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                        {t('EarlyBird.noPromotionsFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promotion) => (
                                    <TableRow key={promotion.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {promotion.ratePlan?._translations?.ratePlanName || promotion.ratePlan?.ratePlanName || t('EarlyBird.multiplePlans')}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {promotion.ratePlan?.ratePlanCode || promotion.ratePlanCode}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{promotion._translations?.promotionName || promotion.promotionName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span>{promotion.advanceBookingDays} {t('EarlyBird.days')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                                                {getDiscountDisplay(promotion)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(promotion.validFrom)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(promotion.validTo)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-muted-foreground">
                                                {getActiveDays(promotion.applicableDays)}
                                            </span>
                                        </TableCell>
                                        <TableCell className='flex items-center justify-center'>
                                            <span className={`px-3 py-1  rounded text-xs ${promotion.isAutoApplied
                                                ? ' text-success '
                                                : ' text-destructive'
                                                }`}>
                                                {promotion.isAutoApplied ? <Check className='h-4 w-4'/> : <X className='h-4 w-4'/>}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-3 py-1 rounded text-xs font-medium ${promotion.isActive
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {promotion.isActive ? t('EarlyBird.active') : t('EarlyBird.inactive')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-accent rounded-md transition-colors">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(promotion)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-3" />
                                                        {t('EarlyBird.edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => { setTranslationEntityId(promotion.id); setAddTranslationOpen(true); }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Plus className="w-4 h-4 mr-3 text-blue-500" />
                                                        {t("Common.addTranslation")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => { setTranslationEntityId(promotion.id); setCheckTranslationsOpen(true); }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Languages className="w-4 h-4 mr-3 text-green-600" />
                                                        {t("Common.checkTranslation")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(promotion.id)}
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                        {t('EarlyBird.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">{t('EarlyBird.deletePromotion')}</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('EarlyBird.deleteConfirmation')}
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                    disabled={isLoading.isLoading}
                                >
                                    {t('EarlyBird.cancel')}
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                                    disabled={isLoading.isLoading}
                                >
                                    {isLoading.isLoading ? t('EarlyBird.deleting') : t('EarlyBird.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {translationEntityId && (
                <>
                    <AddTranslationDialog
                        open={addTranslationOpen}
                        onOpenChange={setAddTranslationOpen}
                        entityId={translationEntityId}
                        title="Add Promotion Translation"
                        fields={[{ key: "promotionName", label: "Promotion Name", placeholder: "e.g. Reserva Anticipada" }]}
                        onSave={async (id, locale, data) => {
                            return await upsertPromotionTranslationService(id, { [locale]: data });
                        }}
                        allowedLanguageCodes={availableLanguages.map((l) => l.code)}
                    />
                    <CheckTranslationsDialog
                        open={checkTranslationsOpen}
                        onOpenChange={setCheckTranslationsOpen}
                        entityId={translationEntityId}
                        title="Promotion Translations"
                        displayFields={[{ key: "promotionName", label: "Name" }]}
                        onFetch={getAllPromotionTranslationsService}
                        onDelete={deletePromotionTranslationLocaleService}
                        onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
                    />
                    <EditTranslationDialog
                        open={editTranslationOpen}
                        onOpenChange={setEditTranslationOpen}
                        entityId={translationEntityId!}
                        locale={editingLocale}
                        initialData={editingData}
                        title="Edit Promotion Translation"
                        fields={[{ key: "promotionName", label: "Promotion Name", placeholder: "e.g. Reserva Anticipada" }]}
                        onSave={async (id, locale, data) => upsertPromotionTranslationService(id, { [locale]: data })}
                    />
                </>
            )}
        </div>
    );
};

export default EarlyBirdPromotionList;