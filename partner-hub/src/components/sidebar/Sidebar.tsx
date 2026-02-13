import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  LogOut,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutService } from '@/pages/login/services/agent-auth.services';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/property', icon: Building2, label: 'Properties' },
  { to: '/reservations', icon: CalendarCheck, label: 'Reservations' },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}


export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await logoutService();
      
      if (response.success) {
        toast.success('Logged out successfully');
        navigate('/login');
      } else {
        toast.error(response.message || 'Failed to logout');
      }
    } catch (error) {
      toast.error('An error occurred during logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar transition-all duration-300 lg:relative",
        sidebarOpen ? "w-64" : "w-20",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 flex-shrink-0">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <img src="/revchillicon.svg" alt="Revchill Logo" />
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">Revchill Partner Portal</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-sidebar-muted hover:text-sidebar-foreground"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              )
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-sidebar-border p-3 flex-shrink-0">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-muted hover:bg-destructive/10 hover:text-destructive",
            !sidebarOpen && "justify-center px-0"
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
        </Button>
      </div>
    </aside>
  );
}
