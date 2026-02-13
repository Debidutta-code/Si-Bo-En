import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AxiosInstance from "@/components/axiosInstance";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser, clearUser } from '@/redux/userSlice';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RotateCcwKey, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function Navbar({ isOpen }: { isOpen: boolean }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const axiosInstance = AxiosInstance();
  const navigate = useNavigate();
useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/user/me');
        if (response.data.success) {
          const userData = response.data.data;
          dispatch(setUser(userData));
        
        } else {
          
          toast.error(response.data?.message || "Failed to fetch user data.");
        }
      } catch (error: any) {
        if(error.response?.data?.message === "Login again to continue"){
          navigate('/login');
          return;
        }
        if(error.response?.data?.message === "Access token Not found, Login again"){
          navigate('/login');
          return;
        }
        if(error.response?.data.message==="Token Expired ,Login again to continue"){
navigate('/login');
          return;
        }
        // toast.error(error.response?.data?.message || "Error fetching user data.");
        dispatch(clearUser());
      }
    };

    fetchUser();
  }, []);

  // Get display name and initials for avatar
  const avatarFallback = user
    ? `${user.firstName?.[0] || ''}`.toUpperCase()
    : 'U';

  const displayName = user?.firstName || 'User';

  return (
    <header className="sticky top-0 z-40 w-full bg-white  shadow-sm border-b">
      <div className="container h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          {!isOpen && (
            <Link to="/app" className="font-bold text-xl text-gray-900">
              <img src='/revchill.png' alt="Revchill" className='h-14 w-auto' />
            </Link>
          )}
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto rounded-full px-3 py-1.5 hover:bg-gray-100" >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border cursor-pointer">
                    <AvatarFallback className='text-black bg-gray-100'>{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">{displayName}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="font-normal flex ">
                <div>
                  <Avatar className="h-8 w-8 border cursor-pointer">
                    <AvatarFallback className='text-black bg-gray-100'>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col space-y-1 ml-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {user?.role && (
                <DropdownMenuItem className="cursor-default focus:bg-transparent">
                  <Shield className="mr-2 h-4 w-4" />
                  <span className="text-sm capitalize">{user.role.replace('_', ' ')}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <RotateCcwKey className="mr-2 h-4 w-4" />
                <span className="text-sm capitalize" >Change Password</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}