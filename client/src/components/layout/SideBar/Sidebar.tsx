import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  FileText,
  Building,
  Users,
  Shield,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  HeadsetIcon,
  BrushCleaning
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  userLevels: number[];
}

// Navigation links configuration
const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Properties', href: '/app/property', icon: Building, userLevels: [2, 3, 4] },
  { name: "My Property", href: `/app/property`, icon: Building, userLevels: [1, 0] },
  { name: "Reservations", href: "/app/bookings", icon: CalendarClock, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Logs', href: '/app/logs', icon: FileText, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Manage Members', href: '/app/members', icon: Users, userLevels: [4, 3, 2, 1] },
  { name: 'Access Control', href: '/app/access-control', icon: Shield, userLevels: [4] },
];

// Define the component's props interface
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const { user } = useAppSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };
  useEffect(() => {

    if (user?.role === "hotel_manager" && user?.propertyId) {
      if (!navigation.find(item => item.name === 'Front Desk')) {
        navigation.push({ name: 'Front Desk', href: `/property/${user.propertyId}/frontdesk`, icon: HeadsetIcon, userLevels: [0, 1, 2, 3, 4] })
      }
      if (!navigation.find(item => item.name === 'House Keeping')) {
        navigation.push({ name: 'House Keeping', href: `/property/${user.propertyId}/housekeeping`, icon: BrushCleaning, userLevels: [0, 1, 2, 3, 4] })
      }
    }



    if (user?.role === "front_desk" && user?.propertyId) {
      navigate(`/property/${user.propertyId}/frontdesk`);
    }
    if (user?.role === "housekeeping" && user?.propertyId) {
      navigate(`/property/${user.propertyId}/housekeeping`);
    }
  }, [user])
  const filteredNavigation = navigation.filter(item => user && item.userLevels.includes(user.userLevel));

  // Reusable component for the sidebar's content
  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-white border-r w-full'>
      <div className="flex justify-around items-center h-16 px-2 border-b border-gray-200" >
        <h1 className={cn(
          'font-bold text-xl ml-2 whitespace-nowrap transition-opacity duration-300',
          isSidebarOpen ? 'block' : 'hidden'
        )}>
        </h1>
        {isSidebarOpen && (
          <img src='/swiftrooms.jpeg' alt="Swiftrooms" className='w-1/2' />
        )}
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className={`hidden sm:flex justify-center items-center`}>
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const targetHref = item.href === `/app/property` ? (
            user?.userLevel === 4 ? `/app/property/super/${user.creation}` :
              user?.userLevel === 3 ? `/app/property/group/${user.creation}` :
                user?.userLevel === 2 ? `/app/property/brand/${user.creation}` :
                  user?.userLevel === 1 ? `/app/property/property/${user.creation}` :
                    user?.userLevel === 0 ? `/app/property/property/${user.creation}` :
                      item.href
          ) : item.href;
          return (
            <Link
              key={item.name}
              to={targetHref}
              title={item.name}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === targetHref
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <item.icon className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50',
            !isSidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Slide-out Sheet) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white/50 backdrop-blur-sm">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-56">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Permanent Flex Item) */}
      <aside className={cn(
        'hidden md:flex flex-col   border-gray-200 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}