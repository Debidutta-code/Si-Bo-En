import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Cable, AlertCircle } from 'lucide-react';
import type { IMasterPartnersWProperty } from '../types';
import toast from 'react-hot-toast';

interface IntegrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IMasterPartnersWProperty | null;
    propertyId: string;
    onIntegrationSuccess: () => void;
    onSubmit: (data: {
        propertyId: string;
        masterIntegrationId: string;
        fields: Array<{ requiredFieldId: string; value: string }>;
    }) => Promise<void>;
}

export default function IntegrationDialog({
    isOpen,
    onClose,
    partner,
    propertyId,
    onIntegrationSuccess,
    onSubmit
}: IntegrationDialogProps) {
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset state when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setFieldValues({});
            setErrors({});
            setIsSubmitting(false);
            onClose();
        }
    };

    const validateField = (value: string, fieldName: string): string | null => {
        if (!value || value.trim() === '') {
            return `${fieldName} is required`;
        }
        
        // Additional validation based on field name
        if (fieldName.toLowerCase().includes('email')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Invalid email format';
            }
        }
        
        if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('endpoint')) {
            try {
                new URL(value);
            } catch {
                return 'Invalid URL format';
            }
        }
        
        if (fieldName.toLowerCase().includes('api') && fieldName.toLowerCase().includes('key')) {
            if (value.length < 10) {
                return 'API key seems too short';
            }
        }
        
        return null;
    };

    const handleFieldChange = (fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!partner || !propertyId) return;

        // Validate all fields
        const newErrors: Record<string, string> = {};
        let hasErrors = false;

        partner.requiredFieldsForMasterIntegration.forEach(field => {
            const value = fieldValues[field.id];
            const error = validateField(value, field.name);
            if (error) {
                newErrors[field.id] = error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(newErrors);
            toast.error('Please fix all validation errors');
            return;
        }

        setIsSubmitting(true);

        try {
            const integrationData = {
                propertyId,
                masterIntegrationId: partner.id,
                fields: partner.requiredFieldsForMasterIntegration.map(field => ({
                    requiredFieldId: field.id,
                    value: fieldValues[field.id]
                }))
            };

            await onSubmit(integrationData);
            
            // Success - reset and close
            setFieldValues({});
            setErrors({});
            onIntegrationSuccess();
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Cable className='h-5 w-5 text-blue-600' />
                        Integrate with {partner.name}
                    </DialogTitle>
                    <DialogDescription>
                        Configure the integration by providing the required credentials and settings.
                        All fields marked with <span className='text-red-500'>*</span> are required.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Partner Information */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <div className='flex items-start gap-2'>
                            <AlertCircle className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                            <div className='flex-1'>
                                <h4 className='font-medium text-blue-900 mb-1'>Partner Type</h4>
                                <Badge variant='secondary' className='mb-2'>
                                    {partner.type === 'channel_manager' ? 'Channel Manager' : 'PMS'}
                                </Badge>
                                <p className='text-sm text-blue-700'>
                                    You are setting up integration with <strong>{partner.name}</strong>.
                                    Make sure you have the correct credentials from {partner.name}'s admin panel.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Endpoints (Read-only information) */}
                    {partner.masterIntegrationURLFields.length > 0 && (
                        <div className='space-y-2'>
                            <Label className='text-base font-semibold'>API Endpoints</Label>
                            <p className='text-xs text-muted-foreground mb-2'>
                                These are the endpoints our system will use to communicate with {partner.name}
                            </p>
                            <div className='space-y-2 bg-gray-50 p-3 rounded-lg border'>
                                {partner.masterIntegrationURLFields.map((urlField) => (
                                    <div key={urlField.id} className='flex items-center justify-between text-sm'>
                                        <span className='font-medium text-gray-700'>{urlField.name}:</span>
                                        <a
                                            href={urlField.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-600 hover:underline flex items-center gap-1'
                                        >
                                            {urlField.url}
                                            <ExternalLink className='h-3 w-3' />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Required Fields Form */}
                    <div className='space-y-4'>
                        <div>
                            <Label className='text-base font-semibold'>Required Configuration Fields</Label>
                            <p className='text-xs text-muted-foreground mt-1'>
                                Enter the credentials and configuration values for your property
                            </p>
                        </div>

                        {partner.requiredFieldsForMasterIntegration.map((field, index) => (
                            <div key={field.id} className='space-y-2'>
                                <Label htmlFor={field.id} className='flex items-center gap-1'>
                                    {field.name}
                                    <span className='text-red-500'>*</span>
                                    <span className='text-xs text-gray-500 font-normal ml-1'>
                                        (Field {index + 1} of {partner.requiredFieldsForMasterIntegration.length})
                                    </span>
                                </Label>
                                <Input
                                    id={field.id}
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={fieldValues[field.id] || ''}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                    className={errors[field.id] ? 'border-red-500' : ''}
                                    disabled={isSubmitting}
                                    type={field.name.toLowerCase().includes('password') || 
                                          field.name.toLowerCase().includes('secret') || 
                                          field.name.toLowerCase().includes('key') ? 'password' : 'text'}
                                />
                                {errors[field.id] && (
                                    <p className='text-xs text-red-500 flex items-center gap-1'>
                                        <AlertCircle className='h-3 w-3' />
                                        {errors[field.id]}
                                    </p>
                                )}
                                {!errors[field.id] && field.name.toLowerCase().includes('code') && (
                                    <p className='text-xs text-gray-500'>
                                        This is your property identifier in {partner.name}'s system
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Security Notice */}
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                        <div className='flex items-start gap-2'>
                            <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                            <p className='text-xs text-yellow-800'>
                                <strong>Security Notice:</strong> Your credentials are encrypted and stored securely.
                                They will only be used for API communication with {partner.name}.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || partner.requiredFieldsForMasterIntegration.length === 0}
                    >
                        {isSubmitting ? 'Integrating...' : 'Integrate Now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
