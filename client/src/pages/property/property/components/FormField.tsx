import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { getFieldType, getFieldPlaceholder } from '../utils/validation';

interface FormFieldProps {
    id: string;
    name: string;
    value: string;
    error?: string;
    index: number;
    total: number;
    partnerName: string;
    onChange: (id: string, value: string) => void;
    disabled?: boolean;
}

export const FormField = ({
    id,
    name,
    value,
    error,
    index,
    total,
    partnerName,
    onChange,
    disabled = false
}: FormFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const fieldType = getFieldType(name);
    const isPassword = fieldType === 'password';
    const isFilled = value && value.trim().length > 0;

    return (
        <div className='space-y-2 p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors'>
            <div className='flex items-start justify-between gap-2'>
                <Label htmlFor={id} className='flex items-center gap-2 text-sm font-medium'>
                    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600'>
                        {index + 1}
                    </span>
                    <span>{name}</span>
                    <span className='text-red-500'>*</span>
                </Label>
                
                {isFilled && !error && (
                    <CheckCircle2 className='h-4 w-4 text-green-600 flex-shrink-0' />
                )}
            </div>

            <div className='relative'>
                <Input
                    id={id}
                    placeholder={getFieldPlaceholder(name)}
                    value={value}
                    onChange={(e) => onChange(id, e.target.value)}
                    className={`pr-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : isFilled ? 'border-green-500' : ''}`}
                    disabled={disabled}
                    type={isPassword && !showPassword ? 'password' : 'text'}
                />
                
                {isPassword && (
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                        ) : (
                            <Eye className='h-4 w-4' />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className='text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded'>
                    <AlertCircle className='h-3 w-3 flex-shrink-0' />
                    {error}
                </p>
            )}

            {!error && name.toLowerCase().includes('code') && (
                <p className='text-xs text-gray-500'>
                    Your property identifier in {partnerName}'s system
                </p>
            )}
        </div>
    );
};