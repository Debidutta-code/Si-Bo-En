'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

// Initialize i18next on the client so `useTranslation()` resolves keys.
import i18next from 'i18next';
import { initI18n } from '@/src/i18n/config/i18n.config';

import ReduxProviderWrapper from '@/src/hooks/ReduxProviderWrapper';
import { Toaster } from 'react-hot-toast';

// Initialize i18n immediately
if (typeof window !== 'undefined' && !i18next.isInitialized) {
  initI18n();
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!i18next.isInitialized) {
      initI18n();
    }
  }, []);

  return (
    <ReduxProviderWrapper>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ReduxProviderWrapper>
  );
}
