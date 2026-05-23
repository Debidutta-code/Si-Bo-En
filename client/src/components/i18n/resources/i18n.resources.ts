import enTranslation from '../translations/en/translation.json';
import arTranslation from '../translations/ar/translation.json';
import trTranslation from '../translations/tr/translation.json';
import ruTranslation from '../translations/ru/translation.json';
import hiTranslation from '../translations/hi/translation.json';
import zhTranslation from '../translations/zh/translation.json';
export const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
  tr: {
    translation: trTranslation,
  },
  ru: {
    translation: ruTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
} as const;

export type SupportedLanguage = 'en' | 'ar' | 'tr' | 'ru' | 'hi' | 'zh';

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  tr: 'Türkçe',
  ru: 'Русский',
  hi: 'हिन्दी',
  zh: '中文',
};

export const isRTL = (lang: string): boolean => {
  return lang === 'ar';
};

export const getDirection = (lang: string): 'ltr' | 'rtl' => {
  return isRTL(lang) ? 'rtl' : 'ltr';
};