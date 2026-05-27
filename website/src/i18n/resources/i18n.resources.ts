import enTranslation from '../translations/en/translation.json';
import arTranslation from '../translations/ar/translation.json';
import hiTranslation from '../translations/hi/translation.json';
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
  hi: {
    translation: hiTranslation,
  },
} as const;

/**
 * Type for supported languages
 */
export type SupportedLanguage = 'en' | 'ar' | 'hi';

/**
 * Get language display name
 */
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  hi: 'हिन्दी',
};

/**
 * Check if language is RTL
 */
export const isRTL = (lang: string): boolean => {
  return lang === 'ar' || lang === 'hi';
};

/**
 * Get document direction based on language
 */
export const getDirection = (lang: string): 'ltr' | 'rtl' => {
  return isRTL(lang) ? 'rtl' : 'ltr';
};