import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/SideBar/UnifiedSidebar';
import Navbar from '@/components/layout/NavBar/Navbar';

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen max-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-h-screen max-h-screen space-x-4 space-y-4 overflow-hidden">
        <div className="sticky top-0 z-20">
          <Navbar isOpen={isSidebarOpen} />
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}