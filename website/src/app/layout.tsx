// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import ClientProviders from './ClientProviders';


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
      <body className={` antialiased`}>
        <ClientProviders>
          <main className="min-h-screen">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
