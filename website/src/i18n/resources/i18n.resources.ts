import enTranslation from '../translations/en/translation.json';
import arTranslation from '../translations/ar/translation.json';

/**
 * i18n Resources
 * 
 * Loads translation files for supported languages
 */
export const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
} as const;

/**
 * Type for supported languages
 */
export type SupportedLanguage = 'en' | 'ar';

/**
 * Get language display name
 */
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
};

/**
 * Check if language is RTL
 */
export const isRTL = (lang: string): boolean => {
  return lang === 'ar';
};

/**
 * Get document direction based on language
 */
export const getDirection = (lang: string): 'ltr' | 'rtl' => {
  return isRTL(lang) ? 'rtl' : 'ltr';
};