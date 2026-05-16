import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/SideBar/Sidebar';
import Navbar from '@/components/layout/NavBar/Navbar';
import { PropertyProvider } from '@/contexts/PropertyContext';

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <PropertyProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="sticky top-0 z-20 flex-shrink-0">
            <Navbar isOpen={isSidebarOpen} />
          </div>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </PropertyProvider>
  );
}