export const validateField = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
        return `${fieldName} is required`;
    }
    
    const lowerFieldName = fieldName.toLowerCase();
    
    // Email validation
    if (lowerFieldName.includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Invalid email format';
        }
    }
    
    // URL validation
    if (lowerFieldName.includes('url') || lowerFieldName.includes('endpoint')) {
        try {
            new URL(value);
        } catch {
            return 'Invalid URL format';
        }
    }
    
    // API Key validation
    if (lowerFieldName.includes('api') && lowerFieldName.includes('key')) {
        if (value.length < 10) {
            return 'API key seems too short (minimum 10 characters)';
        }
    }
    
    // Password/Secret validation
    if (lowerFieldName.includes('password') || lowerFieldName.includes('secret')) {
        if (value.length < 8) {
            return 'Must be at least 8 characters';
        }
    }
    
    return null;
};

export const getFieldType = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('password') || 
        lowerName.includes('secret') || 
        lowerName.includes('key')) {
        return 'password';
    }
    return 'text';
};

export const getFieldPlaceholder = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('email')) return 'example@domain.com';
    if (lowerName.includes('url') || lowerName.includes('endpoint')) return 'https://...';
    if (lowerName.includes('code') || lowerName.includes('id')) return 'Enter your property code';
    if (lowerName.includes('key')) return 'Enter API key';
    return `Enter ${fieldName.toLowerCase()}`;
};