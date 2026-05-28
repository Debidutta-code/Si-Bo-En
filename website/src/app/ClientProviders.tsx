'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import i18next from 'i18next';
import { initI18n } from '@/src/i18n/config/i18n.config';

import ReduxProviderWrapper from '@/src/hooks/ReduxProviderWrapper';
import { Toaster } from 'react-hot-toast';
import CustomerProvider from '../components/providers/CustomerProvider';

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
      <CustomerProvider>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </CustomerProvider>
    </ReduxProviderWrapper>
  );
}