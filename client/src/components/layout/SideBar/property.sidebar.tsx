import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
    ChevronDown,
    DollarSign
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    userLevels: number[];
}

// Navigation links configuration
const navigation: NavItem[] = [];

// Define the component's props interface
interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
    const { propertyId } = useParams();
    const { user } = useAppSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const [isPriceManagementOpen, setIsPriceManagementOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    useEffect(() => {
        const items = [
            { name: 'RatePlan', href: `/property/rate-plan/${propertyId}`, icon: Home, userLevels: [0, 1, 2, 3, 4] },
            { name: 'Rate Plan Allortment', href: `/property/rate-plan/map/${propertyId}`, icon: Building, userLevels: [2, 3, 4] },
            { name: "Inventory", href: `/property/inventory/${propertyId}`, icon: Building, userLevels: [1, 0, 2, 3, 4] },
            { name: "Policy", href: `/property/policy/${propertyId}`, icon: CalendarClock, userLevels: [0, 1, 2, 3, 4] },
            { name: 'Promo Code', href: `/property/promo-code/${propertyId}`, icon: FileText, userLevels: [0, 1, 2, 3, 4] },
            { name: 'Add On', href: `/property/add-on/${propertyId}`, icon: Users, userLevels: [4, 3, 2, 1] },
            { name: 'Tax System', href: `/property/tax-system/${propertyId}`, icon: Shield, userLevels: [4] },
            { name: "C Panel", href: `/property/booking-engine-config/${propertyId}`, icon: FileText, userLevels: [0, 1, 2, 3, 4] },
        ];

        items.forEach(item => {
            const exists = navigation.some(
                nav => nav.name === item.name && nav.href === item.href
            );

            if (!exists) {
                navigation.push(item);
            }
        });
    }, [propertyId]);

    // Price Management sub-items
    const priceManagementItems = [
        { name: 'Seasons', href: `/property/price-management/seasons/${propertyId}` },
        { name: 'Calendar', href: `/property/price-management/calendar/${propertyId}` },
        { name: 'Periods', href: `/property/price-management/periods/${propertyId}` },
        { name: 'Table', href: `/property/price-management/table/${propertyId}` },
    ];

    const filteredNavigation = navigation.filter(item => user && item.userLevels.includes(user.userLevel));

    // Reusable component for the sidebar's content
    const SidebarContent = () => (
        <div className='flex flex-col h-full bg-white border-r w-full'>
            <div className="flex justify-around items-center h-16 px-2 border-b border-gray-200">
                <Button onClick={toggleSidebar} variant="ghost" size="icon" className={`hidden sm:flex justify-center items-center`}>
                    {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
                <h1 className={cn(
                    'font-bold text-xl ml-2 whitespace-nowrap transition-opacity duration-300',
                    isSidebarOpen ? 'block' : 'hidden'
                )}>
                </h1>
                {isSidebarOpen && (
                    <img src='/swiftrooms.jpeg' alt="Swiftrooms" className='w-2/3' />
                )}
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

                {/* Price Management Dropdown */}
                <div>
                    <button
                        onClick={() => setIsPriceManagementOpen(!isPriceManagementOpen)}
                        title="Price Management"
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50',
                            !isSidebarOpen && 'justify-center'
                        )}
                    >
                        <DollarSign className='h-5 w-5 flex-shrink-0' />
                        <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                            Price Management
                        </span>
                        <ChevronDown className={cn(
                            'h-4 w-4 transition-transform',
                            isPriceManagementOpen && 'rotate-180',
                            !isSidebarOpen && 'hidden'
                        )} />
                    </button>

                    {/* Dropdown Items */}
                    {isPriceManagementOpen && isSidebarOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            {priceManagementItems.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    className={cn(
                                        'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                                        location.pathname === subItem.href
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    {subItem.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
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
                'hidden md:flex flex-col border-gray-200 transition-all duration-300 ease-in-out',
                isSidebarOpen ? 'w-52' : 'w-20'
            )}>
                <SidebarContent />
            </aside>
        </>
    );
}