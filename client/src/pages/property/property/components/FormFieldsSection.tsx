import type { FormFieldsSectionProps } from "../types/property-config.type";
import { FormField } from "./FormField";

// Takes an array of fields and maps them
export const FormFieldsSection = ({
    fields,              // ✅ Array of all fields
    fieldValues,         // ✅ Object with all values
    errors,              // ✅ Object with all errors
    partnerName,
    onFieldChange,
    disabled = false
}: FormFieldsSectionProps) => {
    return (
        <div className='space-y-4'>
            {/* ... header ... */}
            
            <div className='space-y-3'>
                {fields.map((field, index) => (
                    <FormField              // ✅ Individual field component
                        key={field.id}
                        id={field.id}       // ✅ Single field id
                        name={field.name}   // ✅ Single field name
                        value={fieldValues[field.id] || ''}  // ✅ Single value
                        error={errors[field.id]}             // ✅ Single error
                        index={index}
                        total={fields.length}
                        partnerName={partnerName}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};