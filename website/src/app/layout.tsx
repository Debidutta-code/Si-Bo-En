// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Revchill - Find Your Next Adventure',
  description: 'Discover amazing places at exclusive deals. Book hotels, tours, activities and more.',
  icons: {
    icon: "/revchilliicon.svg",
  },
};

import ReduxProviderWrapper from '@/src/hooks/ReduxProviderWrapper';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Home/RoiBackFooter';
import Navbar from '../components/Home/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReduxProviderWrapper>
          <Navbar />
          <main className="min-h-screen space-y-6 pt-[calc(5rem)] lg:pt-[calc(6rem)]">
            {children}
            <Toaster position="top-right" reverseOrder={false} />

          </main>
          <Footer/>
        </ReduxProviderWrapper>
      </body>
    </html>
  );
}
