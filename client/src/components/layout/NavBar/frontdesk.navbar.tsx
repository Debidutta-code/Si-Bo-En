import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AxiosInstance from "@/components/axiosInstance";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser, clearUser } from '@/redux/userSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, ChartNoAxesCombined, Home, Shield, RotateCcwKey, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useParams } from 'react-router-dom';
import BackButton from '@/components/shared/BackButton';


export default function Navbar({ isOpen }: { isOpen: boolean }) {
  const { propertyId } = useParams();
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
        toast.error(error.response?.data?.message || "Error fetching user data.");
        dispatch(clearUser());
      }
    };
    if(!user){
      fetchUser();
    }

  }, []);

  // Get display name and initials for avatar
  const avatarFallback = user
    ? `${user.firstName?.[0] || ''}`.toUpperCase()
    : 'U';
    
  return (

    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b">
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center w-1/3 px-3">
          {!isOpen && (
            <Link to={`/property/${propertyId}/frontdesk`} className="text-gray-900 flex items-center">
              <img src="/swiftrooms.jpeg" alt="Swiftrooms" className="h-10 w-auto mr-3" />
            </Link>
          )}
          {(user&&(user.role==="super_admin"||user.role==="group_manager"||user.role==="brand_manager"||user.role==="hotel_manager"))&& (
              <BackButton />
        )} 
        </div>
        <div className="flex flex-row w-1/2 justify-around">
          <div className='flex   '>
            <Button variant="ghost" onClick={() => { navigate(`/property/${propertyId}/frontdesk/reservation/by-calendar`) }}>
              <Calendar className="h-5 w-5 text-gray-600" />
            </Button>
            {
              user?.role !== "front_desk" && user?.role !== "housekeeping" && (
                <Button variant="ghost" onClick={() => { navigate("/app") }}>
                  <Home className="h-5 w-5 text-gray-600" />
                </Button>
              )
            }

            <Button variant="ghost">
              <ChartNoAxesCombined className="h-5 w-5 text-gray-600" onClick={() => { navigate(`/property/${propertyId}/frontdesk`) }} />
            </Button>
            <Button variant="ghost">
              <Zap className="h-5 w-5 text-gray-600" onClick={() => { navigate(`/property/${propertyId}/frontdesk/flash`) }} />
            </Button>
          </div>
          <div className="flex items-center  space-x-4">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0" >
                    <Avatar className="h-8 w-8 border cursor-pointer">
                      <AvatarFallback className='text-black bg-gray-100'>{avatarFallback}</AvatarFallback>
                    </Avatar>
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
        </div>


      </div>
    </header>
  );
}