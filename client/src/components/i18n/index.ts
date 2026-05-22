import i18next from 'i18next';
import { initI18n } from './config/i18n.config';

if (typeof window !== 'undefined') {
  initI18n();
}

export default i18next;