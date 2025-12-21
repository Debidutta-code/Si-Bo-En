// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/src/components/Home/Navbar';
// import Footer from '@/src/components/Home/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'swiftrooms - Find Your Next Adventure',
  description: 'Discover amazing places at exclusive deals. Book hotels, tours, activities and more.',
};

import ReduxProviderWrapper from '@/src/hooks/ReduxProviderWrapper';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Home/RoiBackFooter';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReduxProviderWrapper>
          {/* <Navbar /> */}
          <main className="min-h-screen space-y-6">{children}
           <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Mount globally */}

          </main>
          <Footer />
        </ReduxProviderWrapper>
      </body>
    </html>
  );
}
