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
  // HeadsetIcon,
  // BrushCleaning,
  DollarSign,
  ChevronDown,
  Ban,
  Wrench,
  Tag,
  Globe,
  ListEndIcon,
  Smartphone,
  MoonIcon,
  Pen,
  Sun,
  Award,
  Briefcase,
  ClipboardCheck
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useRef, useState, memo } from 'react';
import createAxiosInstance from '@/components/axiosInstance';
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  userLevels: number[];
  isPropertySpecific?: boolean;
}

// Navigation links configuration
const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Properties', href: '/app/property', icon: Building, userLevels: [2, 3, 4] },
  { name: "My Property", href: `/app/property`, icon: Building, userLevels: [1, 0] },
  { name: "Reservations", href: "/app/bookings", icon: CalendarClock, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Logs', href: '/app/logs', icon: FileText, userLevels: [4] },
  { name: 'Manage Members', href: '/app/members', icon: Users, userLevels: [4, 3, 2, 1] },
  { name: 'Access Control', href: '/app/access-control', icon: Shield, userLevels: [4] },
  { name: 'Utils Management', href: '/app/utils-management', icon: Wrench, userLevels: [4, 3] },

];

// Property-specific navigation items
const propertyNavigation: NavItem[] = [
  { name: "C Panel", href: `/property/booking-engine-config/`, icon: FileText, userLevels: [0, 1, 2, 3, 4], isPropertySpecific: true },
];

// Define the component's props interface
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function UnifiedSidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const { propertyId } = useParams();
  const { creationId } = useParams();
  const { user } = useAppSelector((state) => state.user);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement | null>(null);
  const scrollPosition = useRef(0);

  const navigate = useNavigate();
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isRestrictionsOpen, setIsRestrictionsOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(false);
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);

  // Save scroll position before state changes
  const saveScrollPosition = () => {
    if (navRef.current) {
      scrollPosition.current = navRef.current.scrollTop;
    }
  };

  // Restore scroll position after render
  const restoreScrollPosition = () => {
    if (navRef.current) {
      navRef.current.scrollTop = scrollPosition.current;
    }
  };

  // Restore scroll position after state changes
  useEffect(() => {
    restoreScrollPosition();
  }, [isManagementOpen, isRatesOpen, isRestrictionsOpen, isLoyaltyOpen, isPromotionsOpen, isAgencyOpen]);

  const handleLogout = async () => {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.post('/auth/logout');
      if (response.data.success) {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    }
  };

  const ratesItems = [
    { name: 'Rate Plan', href: `/property/rate-plan/${propertyId}` },
    { name: 'Rate Allotment', href: `/property/rate-plan/map/${propertyId}` },
    { name: 'Calender-View', href: `/property/calender-view/${propertyId}` },
    { name: 'Inventory', href: `/property/inventory/${propertyId}`, icon: Building, userLevels: [1, 0, 2, 3, 4] },

  ];

  const managementItems = [
    { name: 'Policy', href: `/property/policy/${propertyId}`, icon: CalendarClock, userLevels: [0, 1, 2, 3, 4] },
    { name: 'Promo Code', href: `/property/promo-code/${propertyId}`, icon: FileText, userLevels: [0, 1, 2, 3, 4] },
    { name: 'Add On', href: `/property/add-on/${propertyId}`, icon: Users, userLevels: [4, 3, 2, 1] },
    { name: 'Tax System', href: `/property/tax-system/${propertyId}`, icon: Shield, userLevels: [4] },
    { name: 'Spa & Activities', href: `/property/spa/${propertyId}`, icon: Sun, userLevels: [0, 1, 2, 3, 4] },
  ];
  const promotionsItems = [
    { name: 'GEO', href: `/property/promotion/geo/${propertyId}`, icon: Globe, userLevels: [4, 3, 2, 1, 0] },
    { name: 'MLOS', href: `/property/promotion/mlos/${propertyId}`, icon: ListEndIcon, userLevels: [4, 3, 2, 1, 0] },
    { name: 'Device Specific', href: `/property/promotion/device-specific/${propertyId}`, icon: Smartphone, userLevels: [4, 3, 2, 1, 0] },
    { name: 'Early Bird', href: `/property/promotion/early-bird/${propertyId}`, icon: Sun, userLevels: [4, 3, 2, 1, 0] },
    { name: 'Offer For Tonight', href: `/property/promotion/offer-for-tonight/${propertyId}`, icon: MoonIcon, userLevels: [4, 3, 2, 1, 0] },
    { name: 'Customizable Deal', href: `/property/promotion/customizable-deal/${propertyId}`, icon: Pen, userLevels: [4, 3, 2, 1, 0] },

  ];

  const isPropertyContext =
    (!!propertyId && location.pathname.startsWith('/property/')) ||
    user?.userLevel === 0 ||
    user?.userLevel === 1;

  const finalCreationId = creationId || propertyId || user?.creation;

  const getLoyaltyItems = () => {
    if (isPropertyContext && propertyId) {
      return [
        {
          name: 'Property Loyalty',
          href: `/property/loyalty/${propertyId}`,
          icon: Award,
          userLevels: [0, 1, 2, 3, 4],
        },
      ];
    }

    return [
      { name: 'Configuration', href: `/app/loyalty/${finalCreationId}`, icon: CalendarClock, userLevels: [1, 2, 3, 4] },
      { name: 'Register Form', href: `/app/loyalty/register-form/${finalCreationId}`, icon: FileText, userLevels: [1, 2, 3, 4] },
      { name: 'Content Configuration', href: `/app/loyalty/content-config/${finalCreationId}`, icon: Users, userLevels: [4, 3, 2, 1] },
      { name: 'Loyalty Guests', href: `/app/loyalty/loyalty-guests/${finalCreationId}`, icon: Shield, userLevels: [4] },
      { name: 'Loyalty Levels', href: `/app/loyalty/levels/${finalCreationId}`, icon: Award, userLevels: [4, 3, 2, 1] },
    ];
  };

  const filteredLoyaltyItems = getLoyaltyItems().filter(item =>
    user && item.userLevels.includes(user.userLevel)
  );

  const getAgencyItems = () => {
    const baseItems = [
      { name: 'Agencies', href: `/app/agency`, icon: Briefcase, userLevels: [4] },
      { name: 'Agency Applications', href: `/app/agency/applications`, icon: ClipboardCheck, userLevels: [4] },
    ];

    if (isPropertyContext && propertyId) {
      baseItems.push({ name: 'Property Agencies', href: `/property/${propertyId}/agencies`, icon: Briefcase, userLevels: [0, 1, 2, 3, 4] });
    }

    return baseItems;
  };

  const filteredAgencyItems = getAgencyItems().filter(item =>
    user && item.userLevels.includes(user.userLevel)
  );

  const filteredNavigation = navigation.filter(item => user && item.userLevels.includes(user.userLevel));

  const filteredPropertyNavigation = propertyNavigation.filter(item =>
    user && item.userLevels.includes(user.userLevel)
  );

  const filteredManagementItems = managementItems.filter(item =>
    user && item.userLevels.includes(user.userLevel)
  ); const restrictionsItems = [
    { name: 'Start/Stop Sell', href: `/property/start-stop-sell/${propertyId}` },
    { name: 'CTA-CTD', href: `/property/cta-ctd/${propertyId}` },
    { name: 'Booking Offset', href: `/property/booking-offset/${propertyId}` },

  ];
  // const isLoyaltyContext = location.pathname.includes('/app/property');

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
            <SidebarContent
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              navRef={navRef}
              filteredNavigation={filteredNavigation}
              filteredLoyaltyItems={filteredLoyaltyItems}
              filteredAgencyItems={filteredAgencyItems}
              filteredPropertyNavigation={filteredPropertyNavigation}
              filteredManagementItems={filteredManagementItems}
              ratesItems={ratesItems}
              promotionsItems={promotionsItems}
              restrictionsItems={restrictionsItems}
              isPropertyContext={isPropertyContext}
              user={user}
              location={location}
              propertyId={propertyId}
              isManagementOpen={isManagementOpen}
              setIsManagementOpen={setIsManagementOpen}
              isRatesOpen={isRatesOpen}
              setIsRatesOpen={setIsRatesOpen}
              isRestrictionsOpen={isRestrictionsOpen}
              setIsRestrictionsOpen={setIsRestrictionsOpen}
              isLoyaltyOpen={isLoyaltyOpen}
              setIsLoyaltyOpen={setIsLoyaltyOpen}
              isPromotionsOpen={isPromotionsOpen}
              setIsPromotionsOpen={setIsPromotionsOpen}
              isAgencyOpen={isAgencyOpen}
              setIsAgencyOpen={setIsAgencyOpen}
              saveScrollPosition={saveScrollPosition}
              handleLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Permanent Flex Item) */}
      <aside className={cn(
        'hidden md:flex flex-col border-gray-200 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-56' : 'w-20'
      )}>
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          navRef={navRef}
          filteredNavigation={filteredNavigation}
          filteredLoyaltyItems={filteredLoyaltyItems}
          filteredAgencyItems={filteredAgencyItems}
          filteredPropertyNavigation={filteredPropertyNavigation}
          filteredManagementItems={filteredManagementItems}
          ratesItems={ratesItems}
          promotionsItems={promotionsItems}
          restrictionsItems={restrictionsItems}
          isPropertyContext={isPropertyContext}
          user={user}
          location={location}
          propertyId={propertyId}
          isManagementOpen={isManagementOpen}
          setIsManagementOpen={setIsManagementOpen}
          isRatesOpen={isRatesOpen}
          setIsRatesOpen={setIsRatesOpen}
          isRestrictionsOpen={isRestrictionsOpen}
          setIsRestrictionsOpen={setIsRestrictionsOpen}
          isLoyaltyOpen={isLoyaltyOpen}
          setIsLoyaltyOpen={setIsLoyaltyOpen}
          isPromotionsOpen={isPromotionsOpen}
          setIsPromotionsOpen={setIsPromotionsOpen}
          isAgencyOpen={isAgencyOpen}
          setIsAgencyOpen={setIsAgencyOpen}
          saveScrollPosition={saveScrollPosition}
          handleLogout={handleLogout}
        />
      </aside>
    </>
  );
}

// SidebarContent component moved outside to prevent re-creation on every render
interface SidebarContentProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  navRef: React.RefObject<HTMLDivElement | null>;
  filteredNavigation: NavItem[];
  filteredLoyaltyItems: any[];
  filteredAgencyItems: any[];
  filteredPropertyNavigation: NavItem[];
  filteredManagementItems: any[];
  ratesItems: any[];
  promotionsItems: any[];
  restrictionsItems: any[];
  isPropertyContext: boolean;
  user: any;
  location: any;
  propertyId: string | undefined;
  isManagementOpen: boolean;
  setIsManagementOpen: (value: boolean) => void;
  isRatesOpen: boolean;
  setIsRatesOpen: (value: boolean) => void;
  isRestrictionsOpen: boolean;
  setIsRestrictionsOpen: (value: boolean) => void;
  isLoyaltyOpen: boolean;
  setIsLoyaltyOpen: (value: boolean) => void;
  isPromotionsOpen: boolean;
  setIsPromotionsOpen: (value: boolean) => void;
  isAgencyOpen: boolean;
  setIsAgencyOpen: (value: boolean) => void;
  saveScrollPosition: () => void;
  handleLogout: () => void;
}

const SidebarContent = memo<SidebarContentProps>(({
  isSidebarOpen,
  toggleSidebar,
  navRef,
  filteredNavigation,
  filteredLoyaltyItems,
  filteredAgencyItems,
  filteredPropertyNavigation,
  filteredManagementItems,
  ratesItems,
  promotionsItems,
  restrictionsItems,
  isPropertyContext,
  user,
  location,
  propertyId,
  isManagementOpen,
  setIsManagementOpen,
  isRatesOpen,
  setIsRatesOpen,
  isRestrictionsOpen,
  setIsRestrictionsOpen,
  isLoyaltyOpen,
  setIsLoyaltyOpen,
  isPromotionsOpen,
  setIsPromotionsOpen,
  isAgencyOpen,
  setIsAgencyOpen,
  saveScrollPosition,
  handleLogout,
}) => {
  return (
    <div className='flex flex-col h-full bg-white border-r w-full '>
      <div className="flex justify-around items-center h-16 px-2 border-b border-gray-200">
        <h1 className={cn(
          'font-bold text-xl ml-2 whitespace-nowrap transition-opacity duration-300',
          isSidebarOpen ? 'block' : 'hidden'
        )}>
        </h1>
        {isSidebarOpen && (
          <img src='/revchill.png' alt="Revchill" className='w-1/2' />
        )}
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className={`hidden sm:flex justify-center items-center`}>
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" ref={navRef}>
        {filteredNavigation.map((item) => {
          const targetHref = item.href === `/app/property` ? (
            user?.userLevel === 4 ? `/app/property/super/${user.creation}` :
              user?.userLevel === 3 ? user.role === "group_manager" ? `/app/property/group/${user.creation}` : `/app/property/regional/${user.creation}` :
                user?.userLevel === 2 ? `/app/property/brand/${user.creation}` :
                  user?.userLevel === 1 ? `/property/${user.propertyId}` :
                    user?.userLevel === 0 ? `/property/${user.propertyId}` :
                      item.href
          ) : item.href === `/app/loyalty` ? `/app/property/loyalty/${user?.creation}` : item.href;

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

        {/* Loyalty Dropdown (only show when in loyalty context) */}
        {user?.creation && filteredLoyaltyItems.length > 0 && (
          <div>
            <button
              onClick={() => {
                saveScrollPosition();
                setIsLoyaltyOpen(!isLoyaltyOpen);
              }}
              title="Loyalty"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(`/app/property/loyalty`) || (isPropertyContext && location.pathname.startsWith(`/property/loyalty/${propertyId}`))
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <Award className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                Loyalty
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isLoyaltyOpen && 'rotate-180',
                !isSidebarOpen && 'hidden'
              )} />
            </button>

            {/* Loyalty Dropdown Items */}
            {isLoyaltyOpen && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {filteredLoyaltyItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                      location.pathname === item.href || location.pathname.startsWith(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agency Dropdown */}
        {filteredAgencyItems.length > 0 && (
          <div>
            <button
              onClick={() => {
                saveScrollPosition();
                setIsAgencyOpen(!isAgencyOpen);
              }}
              title="Agency"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(`/app/agency`) || (isPropertyContext && location.pathname.startsWith(`/property/${propertyId}/agencies`))
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <Briefcase className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                Agency
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isAgencyOpen && 'rotate-180',
                !isSidebarOpen && 'hidden'
              )} />
            </button>

            {/* Agency Dropdown Items */}
            {isAgencyOpen && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {filteredAgencyItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                      location.pathname === item.href || location.pathname.startsWith(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property-specific navigation (only show when in property context) */}
        {isPropertyContext && filteredPropertyNavigation.map((item) => {
          return (
            <Link
              key={item.name}
              to={`${item.href}${propertyId}`}
              title={item.name}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(`${item.href}${propertyId}`)
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

        {/* Rates Dropdown (only show when in property context) */}
        {isPropertyContext && (
          <div>
            <button
              onClick={() => {
                saveScrollPosition();
                setIsRatesOpen(!isRatesOpen);
              }}
              title="Rates"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <DollarSign className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                Rates
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isRatesOpen && 'rotate-180',
                !isSidebarOpen && 'hidden'
              )} />
            </button>

            {/* Rates Dropdown Items */}
            {isRatesOpen && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {ratesItems.map((subItem) => (
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
        )}

        {/* Management Dropdown (only show when in property context) */}
        {isPropertyContext && (
          <div>
            <button
              onClick={() => {
                saveScrollPosition();
                setIsManagementOpen(!isManagementOpen);
              }}
              title="Management"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <Building className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                Management
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isManagementOpen && 'rotate-180',
                !isSidebarOpen && 'hidden'
              )} />
            </button>

            {/* Management Dropdown Items */}
            {isManagementOpen && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <Link
                  to={`/property/${propertyId}?tab=property`}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    location.search === '?tab=property'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Property Details
                </Link>
                <Link
                  to={`/property/${propertyId}?tab=address`}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    location.search === '?tab=address'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Address
                </Link>
                <Link
                  to={`/property/${propertyId}?tab=amenities`}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    location.search === '?tab=amenities'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Amenities
                </Link>
                <Link
                  to={`/property/${propertyId}?tab=rooms`}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    location.search === '?tab=rooms'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Rooms
                </Link>
                <Link
                  to={`/property/${propertyId}?tab=bank-details`}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    location.search === '?tab=bank-details'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Payment Setup
                </Link>

                {/* New Management Items */}
                {filteredManagementItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                      location.pathname.startsWith(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {
          isPropertyContext && (
            <div>
              <button
                onClick={() => {
                  saveScrollPosition();
                  setIsPromotionsOpen(!isPromotionsOpen);
                }}
                title="Promotions"
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50',
                  !isSidebarOpen && 'justify-center'
                )}
              >
                <Tag className='h-5 w-5 flex-shrink-0' />
                <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>Promotions</span>
                <ChevronDown className={cn(
                  'h-4 w-4 transition-transform',
                  isPromotionsOpen && 'rotate-180',
                  !isSidebarOpen && 'hidden'
                )} />
              </button>

              {/* Promotions Dropdown Items */}
              {isPromotionsOpen && isSidebarOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {promotionsItems.map((subItem) => (
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
          )
        }

        {/* {isPropertyContext && (
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
        )} */}

        {/* Restrictions Dropdown (only show when in property context) */}
        {isPropertyContext && (
          <div>
            <button
              onClick={() => {
                saveScrollPosition();
                setIsRestrictionsOpen(!isRestrictionsOpen);
              }}
              title="Restrictions"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <Ban className='h-5 w-5 flex-shrink-0' />
              <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                Restrictions
              </span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isRestrictionsOpen && 'rotate-180',
                !isSidebarOpen && 'hidden'
              )} />
            </button>

            {/* Restrictions Dropdown Items */}
            {isRestrictionsOpen && isSidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {restrictionsItems.map((subItem) => (
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
        )}
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
});

// Add display name for better debugging
SidebarContent.displayName = 'SidebarContent';