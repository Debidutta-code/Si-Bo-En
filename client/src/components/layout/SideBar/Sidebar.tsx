import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  DollarSign,
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
  ClipboardCheck,
  // HelpCircle,
  LayoutDashboard,
  ScrollText,
  Activity,
  Network,
  ServerCog,
  Flower2,
  Settings2,
  Smile,
  Logs,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import createAxiosInstance from '@/components/axiosInstance';

import { useTranslation } from 'react-i18next';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  userLevels: number[];
  children?: NavItem[];
  priority: number;
  roles: Role[];
}
export type Role = 'super_admin' | 'regional_admin' | 'group_manager' | 'brand_manager' | 'hotel_manager' | 'staff' | 'revenue_manager' | 'spa_manager'


// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const { t } = useTranslation();
  const baseMainNav = (): NavItem[] => [
    { name: t('Sidebar.dashboard'), href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager'] },
    { name: t('Sidebar.properties') , href: '/app/property', icon: Building, userLevels: [2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager'] },
    { name: t('Sidebar.myProperty'), href: '/app/property', icon: Building, userLevels: [0, 1], priority: 0, roles: ['hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
    { name: t('Sidebar.reservations'), href: '/app/bookings', icon: CalendarClock, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
    { name: t('Sidebar.manageMembers'), href: '/app/members', icon: Users, userLevels: [1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager'] },
    { name: t('Sidebar.accessControl'), href: '/app/access-control', icon: Shield, userLevels: [4], priority: 3, roles: ['super_admin'] },
    { name: t('Sidebar.utilsManagement'), href: '/app/utils-management', icon: Wrench, userLevels: [3, 4], priority: 3, roles: ['super_admin', 'regional_admin'] },
    { name: t('Sidebar.reports'), href: '/app/reports', icon: Logs, userLevels: [0, 1, 2, 3, 4], priority: 3, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
    {
      name: t('Sidebar.logs'), icon: Activity, userLevels: [4], priority: 3, children: [
        { name: 'Api Logs', href: '/app/logs', icon: Network, userLevels: [4], priority: 3, roles: ['super_admin',] },
        { name: 'Service Logs', href: '/app/service-logs', icon: ServerCog, userLevels: [4], priority: 3, roles: ['super_admin'] },
      ], roles: ['super_admin']
    }
  ];

  const { propertyId } = useParams<{ propertyId: string }>();
  const { creationId } = useParams<{ creationId: string }>();
  const { user } = useAppSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [navigation, setNavigation] = useState<NavItem[]>(baseMainNav());
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // ── Context detection ──────────────────────────────────────────────────────
  const isPropertyRoute = !!propertyId && location.pathname.startsWith('/property/');
  const isLevel01 = user?.userLevel === 0 || user?.userLevel === 1;
  const isPropertyContext = isPropertyRoute || isLevel01;
  const [searchParams] = useSearchParams();
  const queryCreationId = searchParams.get('creationId');
  const finalCreationId = creationId || queryCreationId || user?.creation;
  const resolvedPropId = propertyId ?? user?.propertyId;

  const handleLogout = async () => {
    try {
      const ax = createAxiosInstance();
      await ax.post('/auth/logout');
    } catch { /* swallow */ }
    navigate('/');
  };

  // ── Build Loyalty children ─────────────────────────────────────────────────
  const loyaltyChildren = (): NavItem[] => {
    const items: NavItem[] = [
      { name: t('Sidebar.loyaltyConfiguration'), href: `/app/loyalty/${finalCreationId}`, icon: Settings2, userLevels: [1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
      { name:t('Sidebar.registerForm'), href: `/app/loyalty/register-form/${finalCreationId}`, icon: FileText, userLevels: [1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
      { name:  t('Sidebar.contentConfiguration'), href: `/app/loyalty/content-config/${finalCreationId}`, icon: Pen, userLevels: [1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
      { name: t('Sidebar.loyaltyGuests'), href: `/app/loyalty/loyalty-guests/${finalCreationId}`, icon: Users, userLevels: [1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
      { name: t('Sidebar.loyaltyLevels'), href: `/app/loyalty/levels/${finalCreationId}`, icon: ListEndIcon, userLevels: [1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
    ];
    if (isPropertyContext && resolvedPropId) {
      items.push({ name:  t('Sidebar.propertyLoyalty'), href: `/property/loyalty/${resolvedPropId}`, icon: Award, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] });
    }
    return items;
  };

  const agencyChildren = (): NavItem[] => {
    const items: NavItem[] = [
      { name: t('Sidebar.agencies'), href: `/app/agency`, icon: Briefcase, userLevels: [4], priority: 2, roles: ['super_admin',] },
      { name: t('Sidebar.agencyApplications'), href: `/app/agency/applications`, icon: ClipboardCheck, userLevels: [4], priority: 2, roles: ['super_admin'] },
    ];
    if (isPropertyContext && resolvedPropId) {
      items.push({ name: t('Sidebar.propertyAgencies'), href: `/property/${resolvedPropId}/agencies`, icon: Briefcase, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin'] });
    }
    return items;
  };

  // ── Build full navigation tree ─────────────────────────────────────────────
  const buildNavigation = (): NavItem[] => {
    const pid = resolvedPropId;
    const main = baseMainNav();

    // Loyalty group
    const loyaltyKids = loyaltyChildren();
    if (loyaltyKids.length > 0 && user?.creation) {
      main.push({ name: t('Sidebar.loyalty'), icon: Award, userLevels: [1, 2, 3, 4], priority: 2, children: loyaltyKids, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] });
    }

    // Agency group
    const agencyKids = agencyChildren().filter(i => user && i.userLevels.includes(user.userLevel));
    if (agencyKids.length > 0) {
      main.push({ name: t('Sidebar.agency'), icon: Briefcase, userLevels: [0, 1, 2, 3, 4], priority: 3, children: agencyKids, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] });
    }

    if (isPropertyContext && pid) {
      // C Panel (direct link)
      main.push({ name:t('Sidebar.cPanel'), href: `/property/booking-engine-config/${pid}`, icon: FileText, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] });

      // Rates


      // Management
      main.push({
        name: t('Sidebar.management'), icon: Building, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'],
        children: [
          { name: t('Sidebar.propertyDetails'), href: `/property/${pid}?tab=property`, icon: Building, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
          { name: t('Sidebar.address'), href: `/property/${pid}?tab=address`, icon: Globe, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
          { name: t('Sidebar.amenities'), href: `/property/${pid}?tab=amenities`, icon: Sun, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
          { name: t('Sidebar.rooms'), href: `/property/${pid}?tab=rooms`, icon: Building, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'spa_manager'] },
          { name:t('Sidebar.paymentSetup'), href: `/property/${pid}?tab=bank-details`, icon: DollarSign, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name: t('Sidebar.policy'), href: `/property/policy/${pid}`, icon: FileText, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',] },
          { name: t('Sidebar.promoCode'), href: `/property/promo-code/${pid}`, icon: Tag, userLevels: [0, 1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name: t('Sidebar.addOn'), href: `/property/add-on/${pid}`, icon: Users, userLevels: [1, 2, 3, 4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name: t('Sidebar.taxSystem'), href: `/property/tax-system/${pid}`, icon: ScrollText, userLevels: [4], priority: 0, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
        ],
      });
      main.push({
        name: t('Sidebar.rates'), icon: DollarSign, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',],
        children: [
          { name: t('Sidebar.ratePlan'), href: `/property/rate-plan/${pid}`, icon: DollarSign, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',] },
          { name: t('Sidebar.rateAllotment'), href: `/property/rate-plan/map/${pid}`, icon: CalendarClock, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',] },
          { name:t('Sidebar.calenderView'), href: `/property/calender-view/${pid}`, icon: LayoutDashboard, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',] },
          { name: t('Sidebar.inventory'), href: `/property/inventory/${pid}`, icon: Building, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff',] },
        ],
      });
      main.push({
        name: t('Sidebar.spa'), icon: Flower2, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'spa_manager'],
        children: [
          { name: t('Sidebar.spaConfiguration'), href: `/property/spa/${pid}`, icon: Settings2, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'spa_manager'] },
          { name: t('Sidebar.mySpa'), href: `/property/spa/me/${pid}`, icon: Smile, userLevels: [0], priority: 1, roles: ['spa_manager'] },
        ]
      })
      // Promotions
      main.push({
        name: t('Sidebar.promotions'), icon: Tag, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'],
        children: [
          { name: t('Sidebar.geo'), href: `/property/promotion/geo/${pid}`, icon: Globe, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name: t('Sidebar.mlos'), href: `/property/promotion/mlos/${pid}`, icon: ListEndIcon, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name:  t('Sidebar.deviceSpecific'), href: `/property/promotion/device-specific/${pid}`, icon: Smartphone, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name:  t('Sidebar.earlyBird'), href: `/property/promotion/early-bird/${pid}`, icon: Sun, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name:  t('Sidebar.offerForTonight'), href: `/property/promotion/offer-for-tonight/${pid}`, icon: MoonIcon, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name:t('Sidebar.customizableDeal'), href: `/property/promotion/customizable-deal/${pid}`, icon: Pen, userLevels: [0, 1, 2, 3, 4], priority: 1, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
        ],
      });

      // Restrictions
      main.push({
        name: t('Sidebar.restrictions'), icon: Ban, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'],
        children: [
          { name: t('Sidebar.startStopSell'), href: `/property/start-stop-sell/${pid}`, icon: Ban, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name:  t('Sidebar.ctaCtd'), href: `/property/cta-ctd/${pid}`, icon: CalendarClock, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
          { name: t('Sidebar.bookingOffset'), href: `/property/booking-offset/${pid}`, icon: ScrollText, userLevels: [0, 1, 2, 3, 4], priority: 2, roles: ['super_admin', 'regional_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff'] },
        ],
      });

    }

    return main.sort((a, b) => a.priority - b.priority);
  };

  useEffect(() => {
    setNavigation(buildNavigation());
  }, [propertyId, isPropertyContext, user, location.pathname, finalCreationId]);

  useEffect(() => {
    let activeParent: string | null = null;
    navigation.forEach(item => {
      if (item.children) {
        const childActive = item.children.some(child =>
          child.href && (
            location.pathname === child.href ||
            location.pathname.startsWith(child.href.split('?')[0] + '/') ||
            // handle ?tab= links
            (location.pathname + location.search) === child.href
          )
        );
        if (childActive) activeParent = item.name;
      }
    });

    setExpandedItems(prev => {
      if (activeParent && prev[0] !== activeParent) {
        return [activeParent];
      }
      return prev;
    });
  }, [location.pathname, location.search, navigation]);


  const filteredNav = navigation
    .filter(item => user && item.userLevels.includes(user.userLevel))
    .filter(item => user && item.roles.includes(user.role))
    .map(item => item.children
      ? { ...item, children: item.children.filter(c => user && c.userLevels.includes(user.userLevel) && c.roles.includes(user.role)) }
      : item
    )
    .filter(item => !item.children || item.children.length > 0);

  const resolvePath = (href: string | undefined): string => {
    if (!href) return '#';
    if (href === '/app/property') {
      const u = user;
      if (!u) return href;
      if (u.userLevel === 4) return `/app/property/super/${u.creation}`;
      if (u.userLevel === 3) return u.role === 'group_manager' ? `/app/property/group/${u.creation}` : `/app/property/regional/${u.creation}`;
      if (u.userLevel === 2) return `/app/property/brand/${u.creation}`;
      return `/property/${u.propertyId}`;
    }
    return href;
  };

  const isActive = (item: NavItem): boolean => {
    if (item.children) {
      return item.children.some(c => c.href && isChildActive(c.href));
    }
    if (!item.href) return false;
    const resolved = resolvePath(item.href);
    if (resolved.includes('?')) {
      return (location.pathname + location.search) === resolved;
    }
    return location.pathname === resolved;
  };

  const isChildActive = (href: string | undefined): boolean => {
    if (!href) return false;
    if (href.includes('?')) {
      return (location.pathname + location.search) === href;
    }
    return location.pathname === href;
  };

  const toggleExpand = (name: string) =>
    setExpandedItems(prev => (prev[0] === name ? [] : [name]));

  // ── Sidebar inner content ──────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r w-full">
      {/* Header */}
      <div className="flex justify-around items-center h-16 px-2 border-b border-gray-200">
        {isSidebarOpen && (
          <img src="/revchill.png" alt="RevChill" className="w-1/2" />
        )}
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className="hidden sm:flex">
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {filteredNav.map(item => (
          <div key={item.name}>
            {item.children ? (
              /* ── Group header (expandable) ── */
              <>
                <button
                  onClick={() => toggleExpand(item.name)}
                  title={item.name}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50',
                    !isSidebarOpen && 'justify-center'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                    {item.name}
                  </span>
                  {isSidebarOpen && (
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform flex-shrink-0',
                        expandedItems.includes(item.name) && 'rotate-90'
                      )}
                    />
                  )}
                </button>

                {/* Children */}
                {expandedItems.includes(item.name) && isSidebarOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.name}
                        to={resolvePath(child.href)}
                        title={child.name}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          isChildActive(child.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ── Leaf link ── */
              <Link
                to={resolvePath(item.href)}
                title={item.name}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50',
                  !isSidebarOpen && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50',
            !isSidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>{t('Auth.logout')}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile */}
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

      {/* Desktop */}
      <aside className={cn(
        'hidden md:flex flex-col border-gray-200 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-56' : 'w-20'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}