import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';
import SearchWidget from '@/components/search/SearchWidget';
import { SearchProvider } from '@/contexts/SearchContext';

export default function SearchLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="flex min-h-screen max-h-screen w-full bg-background overflow-hidden">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Component */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-h-screen max-h-screen overflow-hidden">
          {/* Header Component */}
          <div className="sticky top-0 z-30">
            <Header setMobileMenuOpen={setMobileMenuOpen} />
          </div>

          {/* Search Widget */}
          <div className="px-4 lg:px-6 pt-4">
            <SearchWidget />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
