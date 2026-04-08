'use client';

import type { ReactNode } from 'react';

// Initialize i18next on the client so `useTranslation()` resolves keys.
import '@/src/i18n';

import ReduxProviderWrapper from '@/src/hooks/ReduxProviderWrapper';
import { Toaster } from 'react-hot-toast';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProviderWrapper>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ReduxProviderWrapper>
  );
}
