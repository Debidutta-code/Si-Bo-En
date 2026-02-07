import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Building2, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { getMeService } from '@/pages/login/services';
import toast from 'react-hot-toast';

interface HeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ setMobileMenuOpen }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      const result = await getMeService();
      
      if (result.success && result.data && result.data.agent) {
        dispatch(setUser(result.data.agent));
      } else {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    };

    if (!user) {
      fetchAgentDetails();
    }
  }, [user, dispatch, navigate]);

  const avatarFallback = user
    ? `${user.agentName?.[0] || user.agentEmail?.[0] || 'A'}`.toUpperCase()
    : 'A';

  const displayName = user?.agentName || user?.agentEmail || 'Agent';

  return (
    <header className="z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto rounded-full px-3 py-1.5 hover:bg-muted">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border cursor-pointer">
                  <AvatarFallback className="text-foreground bg-muted">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {displayName}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal flex">
              <div>
                <Avatar className="h-10 w-10 border cursor-pointer">
                  <AvatarFallback className="text-foreground bg-muted">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col space-y-1 ml-3">
                <p className="text-sm font-medium leading-none">
                  {user?.agentName || 'Agent'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.agentEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Agent Details */}
            <div className="px-2 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Agent Details
              </p>
              {user?.agentPhone && (
                <DropdownMenuItem className="cursor-default focus:bg-transparent">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.agentPhone}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.agentEmail}</span>
              </DropdownMenuItem>
            </div>

            {/* Agency Details */}
            {user?.agency && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Agency Details
                  </p>
                  <DropdownMenuItem className="cursor-default focus:bg-transparent">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.agency.agencyName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-default focus:bg-transparent">
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{user.agency.agencyType.replace('_', ' ')}</span>
                  </DropdownMenuItem>
                  {user.agency.agencyEmail && (
                    <DropdownMenuItem className="cursor-default focus:bg-transparent">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.agency.agencyEmail}</span>
                    </DropdownMenuItem>
                  )}
                  {user.agency.contactNo && (
                    <DropdownMenuItem className="cursor-default focus:bg-transparent">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.agency.contactNo}</span>
                    </DropdownMenuItem>
                  )}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
