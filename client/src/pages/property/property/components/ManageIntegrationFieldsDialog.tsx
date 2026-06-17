import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import type { IMasterPartnersWProperty } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ManageIntegrationFieldsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IMasterPartnersWProperty | null;
    onAddField: (integrationId: string, data: { requiredFieldId: string; value: string }) => Promise<void>;
    onUpdateField: (fieldId: string, value: string) => Promise<void>;
    onDeleteField: (fieldId: string) => Promise<void>;
}

export default function ManageIntegrationFieldsDialog({
    isOpen,
    onClose,
    partner,
    onAddField,
    onUpdateField,
    onDeleteField
}: ManageIntegrationFieldsDialogProps) {
    const { t } = useTranslation();
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addingNewField, setAddingNewField] = useState(false);
    const [newFieldData, setNewFieldData] = useState({ requiredFieldId: '', value: '' });

    if (!partner) return null;

    const integration = partner.propertyIntegrations?.[0];
    const hasIntegration = !!integration;

    if (!hasIntegration) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('PartnerIntegration.manageDialog.titleNotIntegrated')}</DialogTitle>
                        <DialogDescription>
                            {t('PartnerIntegration.manageDialog.descNotIntegrated')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4 text-center'>
                        <p className='text-gray-600'>{t('PartnerIntegration.manageDialog.pleaseIntegrateFirst')}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={onClose}>{t('PartnerIntegration.manageDialog.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const handleEditField = (fieldId: string, currentValue: string) => {
        setEditingFieldId(fieldId);
        setFieldValues({ ...fieldValues, [fieldId]: currentValue });
    };

    const handleUpdateField = async (fieldId: string) => {
        const newValue = fieldValues[fieldId];
        if (!newValue || newValue.trim() === '') {
            toast.error(t('PartnerIntegration.manageDialog.toastEmptyField'));
            return;
        }

        setIsSubmitting(true);
        try {
            await onUpdateField(fieldId, newValue);
            setEditingFieldId(null);
            setFieldValues({});
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm(t('PartnerIntegration.manageDialog.confirmDelete'))) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onDeleteField(fieldId);
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNewField = async () => {
        if (!newFieldData.requiredFieldId || !newFieldData.value.trim()) {
            toast.error(t('PartnerIntegration.manageDialog.toastSelectField'));
            return;
        }

        setIsSubmitting(true);
        try {
            await onAddField(integration.id, newFieldData);
            setAddingNewField(false);
            setNewFieldData({ requiredFieldId: '', value: '' });
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get fields that haven't been configured yet
    const unconfiguredFields = partner.requiredFieldsForMasterIntegration.filter(
        reqField => !integration.propertyIntegrationSecrets?.some(
            secret => secret.requiredFieldId === reqField.id
        )
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{t('PartnerIntegration.manageDialog.title', { name: partner.name })}</DialogTitle>
                    <DialogDescription>
                        {t('PartnerIntegration.manageDialog.desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Configured Fields */}
                    <div>
                        <div className='flex items-center justify-between mb-3'>
                            <Label className='text-base font-semibold'>
                                {t('PartnerIntegration.manageDialog.configuredFields', { count: integration.propertyIntegrationSecrets?.length || 0 })}
                            </Label>
                            {unconfiguredFields.length > 0 && !addingNewField && (
                                <Button
                                    size='sm'
                                    onClick={() => setAddingNewField(true)}
                                    disabled={isSubmitting}
                                >
                                    <Plus className='h-4 w-4 mr-1' />
                                    {t('PartnerIntegration.manageDialog.addField')}
                                </Button>
                            )}
                        </div>

                        {/* Add New Field Form */}
                        {addingNewField && (
                            <div className='mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50'>
                                <h4 className='font-medium mb-3'>{t('PartnerIntegration.manageDialog.addNewField')}</h4>
                                <div className='space-y-3'>
                                    <div>
                                        <Label>{t('PartnerIntegration.manageDialog.selectField')}</Label>
                                        <select
                                            className='w-full mt-1 p-2 border rounded'
                                            value={newFieldData.requiredFieldId}
                                            onChange={(e) => setNewFieldData({ ...newFieldData, requiredFieldId: e.target.value })}
                                            disabled={isSubmitting}
                                        >
                                            <option value=''>{t('PartnerIntegration.manageDialog.selectFieldPlaceholder')}</option>
                                            {unconfiguredFields.map(field => (
                                                <option key={field.id} value={field.id}>
                                                    {field.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>{t('PartnerIntegration.manageDialog.fieldValue')}</Label>
                                        <Input
                                            type='text'
                                            value={newFieldData.value}
                                            onChange={(e) => setNewFieldData({ ...newFieldData, value: e.target.value })}
                                            placeholder={t('PartnerIntegration.manageDialog.enterFieldValue')}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            size='sm'
                                            onClick={handleAddNewField}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? t('PartnerIntegration.manageDialog.adding') : t('PartnerIntegration.manageDialog.add')}
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() => {
                                                setAddingNewField(false);
                                                setNewFieldData({ requiredFieldId: '', value: '' });
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            {t('PartnerIntegration.manageDialog.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {integration.propertyIntegrationSecrets && integration.propertyIntegrationSecrets.length > 0 ? (
                            <div className='space-y-3'>
                                {integration.propertyIntegrationSecrets.map((secret) => {
                                    const isEditing = editingFieldId === secret.id;
                                    const fieldName = secret.RequiredField?.name || 
                                                     partner.requiredFieldsForMasterIntegration.find(
                                                         f => f.id === secret.requiredFieldId
                                                     )?.name || 
                                                     t('PartnerIntegration.viewDialog.unknownField');

                                    return (
                                        <div 
                                            key={secret.id} 
                                            className='p-4 bg-white border border-gray-200 rounded-lg'
                                        >
                                            <div className='flex items-start justify-between gap-4'>
                                                <div className='flex-1'>
                                                    <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                                                        {fieldName}
                                                    </Label>
                                                    
                                                    {isEditing ? (
                                                        <div className='space-y-2'>
                                                            <Input
                                                                type='text'
                                                                value={fieldValues[secret.id] || secret.value}
                                                                onChange={(e) => setFieldValues({
                                                                    ...fieldValues,
                                                                    [secret.id]: e.target.value
                                                                })}
                                                                placeholder={t('PartnerIntegration.manageDialog.enterNewValue')}
                                                                disabled={isSubmitting}
                                                            />
                                                            <div className='flex gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    onClick={() => handleUpdateField(secret.id)}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {isSubmitting ? t('PartnerIntegration.manageDialog.saving') : t('PartnerIntegration.manageDialog.save')}
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    onClick={() => {
                                                                        setEditingFieldId(null);
                                                                        setFieldValues({});
                                                                    }}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {t('PartnerIntegration.manageDialog.cancel')}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded'>
                                                                {'•'.repeat(Math.min(secret.value.length, 20))}
                                                            </span>
                                                            <Badge variant='secondary' className='text-xs'>
                                                                {t('PartnerIntegration.manageDialog.chars', { count: secret.value.length })}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isEditing && (
                                                    <div className='flex gap-2'>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() => handleEditField(secret.id, secret.value)}
                                                            disabled={isSubmitting}
                                                        >
                                                            <Pencil className='h-3 w-3' />
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='destructive'
                                                            onClick={() => handleDeleteField(secret.id)}
                                                            disabled={isSubmitting}
                                                        >
                                                            <Trash2 className='h-3 w-3' />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className='text-center py-6 bg-gray-50 rounded-lg border border-gray-200'>
                                <p className='text-gray-500'>{t('PartnerIntegration.manageDialog.noFieldsConfiguredYet')}</p>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                        <div className='flex items-start gap-2'>
                            <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                            <p className='text-xs text-yellow-800'>
                                <strong>{t('PartnerIntegration.manageDialog.warning')}</strong> {t('PartnerIntegration.manageDialog.warningDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
                        {t('PartnerIntegration.manageDialog.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
