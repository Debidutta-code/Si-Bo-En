// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Revchill - Find Your Next Adventure',
  description: 'Discover amazing places at exclusive deals. Book hotels, tours, activities and more.',
  icons: {
    icon: "/revchilliicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>
          {/* <Navbar /> */}
          <main className="min-h-screen">{children}</main>
          {/* <Footer/> */}
        </ClientProviders>
      </body>
    </html>
  );
}
