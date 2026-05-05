import { useState, useCallback } from 'react';
import { validateField } from '../utils/validation';
import type { FieldValue, FieldError, IntegrationSubmitData } from '../../types/types';
import type { IMasterPartnersWProperty } from '../types';
import toast from 'react-hot-toast';

export const useIntegrationForm = (
    partner: IMasterPartnersWProperty | null,
    propertyId: string,
    onSubmit: (data: IntegrationSubmitData) => Promise<void>,
    onSuccess: () => void,
    onClose: () => void
) => {
    const [fieldValues, setFieldValues] = useState<FieldValue>({});
    const [errors, setErrors] = useState<FieldError>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = useCallback(() => {
        setFieldValues({});
        setErrors({});
        setIsSubmitting(false);
    }, []);

    const handleFieldChange = useCallback((fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    }, [errors]);

    const validateAllFields = useCallback((): boolean => {
        if (!partner) return false;

        const newErrors: FieldError = {};
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
        }

        return !hasErrors;
    }, [partner, fieldValues]);

    const handleSubmit = useCallback(async () => {
        if (!partner || !propertyId) return;

        if (!validateAllFields()) return;

        setIsSubmitting(true);

        try {
            const integrationData: IntegrationSubmitData = {
                propertyId,
                masterIntegrationId: partner.id,
                fields: partner.requiredFieldsForMasterIntegration.map(field => ({
                    requiredFieldId: field.id,
                    value: fieldValues[field.id]
                }))
            };

            await onSubmit(integrationData);
            
            resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    }, [partner, propertyId, fieldValues, validateAllFields, onSubmit, onSuccess, onClose, resetForm]);

    const getProgress = useCallback((): number => {
        if (!partner) return 0;
        const totalFields = partner.requiredFieldsForMasterIntegration.length;
        if (totalFields === 0) return 0;
        
        const filledFields = partner.requiredFieldsForMasterIntegration.filter(
            field => fieldValues[field.id]?.trim()
        ).length;
        
        return Math.round((filledFields / totalFields) * 100);
    }, [partner, fieldValues]);

    return {
        fieldValues,
        errors,
        isSubmitting,
        handleFieldChange,
        handleSubmit,
        resetForm,
        progress: getProgress()
    };
};