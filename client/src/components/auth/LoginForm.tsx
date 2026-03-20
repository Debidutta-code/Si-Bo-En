import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, Building2, Shield, Zap } from 'lucide-react';
import AxiosInstance from "@/components/axiosInstance";
import { z } from 'zod';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

export default function LoginForm() {
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
        fetchUser();

    const savedCredentials = localStorage.getItem("swiftRoomsLogCred");
    if (savedCredentials) {
      try {
        const cred = JSON.parse(savedCredentials);
        setLoginDetails({ email: cred.email, password: cred.password });
        setRememberMe(true);
      } catch (e) {
        console.error("Failed to parse saved credentials from localStorage", e);
      }
    }
  }, []);
  const fetchUser = async () => {
      try {
        const axiosInstance = AxiosInstance();
        const response = await axiosInstance.get('/user/me');
        if (response.data.success) {
          navigate('/app');
        } else {
          
        }
      } catch (error: any) {
        
      }
    };
  const handleLogin = async () => {
    const validation = loginSchema.safeParse(loginDetails);

    if (!validation.success) {
      const { fieldErrors } = validation.error.flatten();
      setErrors({
        email: fieldErrors.email ? fieldErrors.email[0] : '',
        password: fieldErrors.password ? fieldErrors.password[0] : '',
      });
      return;
    }

    setErrors({ email: '', password: '' });
    setIsLoading(true);

    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.post("/auth/login", loginDetails);

      if (response?.data?.success) {
        if (rememberMe) {
          localStorage.setItem("swiftRoomsLogCred", JSON.stringify(loginDetails));
        } else {
          localStorage.removeItem("swiftRoomsLogCred");
        }
        toast.success("Login Successfull")
        // console.log(response?.data?.data)
        
        navigate('/app');
      } else {
        toast.error(response?.data?.message)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden" style={{ backgroundImage: "url('/swiftrooms-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'hsl(var(--primary))' }}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaDJ2MmgtMnYtMnptMC0xMGgxdjFoLTF2LTF6bS0xMCAxMGgydjJoLTJ2LTJ6bTAtMTBoMXYxaC0xdi0xem0xMCAwdjJoNHYyaC02di00aDJ6bS0xMCAwdjJoNHYyaC02di00aDJ6bS0xMCAxMGgydjJoLTJ2LTJ6bTAtMTBoMXYxaC0xdi0xeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        {/* Diagonal Line Accent */}
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

        {/* Grayish Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 z-5"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          {/* Logo & Brand */}
         

          {/* Main Content */}
          <div className="space-y-8 animate-fade-in-delay">
            <div>
              <h2 className="text-4xl mt-10 font-bold mb-4 leading-tight">
                Manage your properties
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">with confidence</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-white/20"></span>
                </span>
              </h2>
              <p className="text-lg leading-relaxed max-w-md">
                Streamline operations, maximize revenue, and deliver exceptional guest experiences all in one place.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Enterprise-grade security" },
                { icon: Zap, text: "Real-time analytics & insights" },
                { icon: Building2, text: "Multi-property management" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 animate-slide-in-left"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-background/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm animate-fade-in">
            © {new Date().getFullYear()} Revchill. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img 
              src="/revchill.png" 
              alt="Revchill Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <Card className="border shadow-xl">
            <CardHeader className="space-y-2 text-center pb-8">
               <img 
                src="/revchill.png" 
                alt="Revchill Logo" 
                className="h-12 w-auto hidden lg:block object-contain"
              />
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    disabled={isLoading}
                    value={loginDetails.email}
                    onChange={(e) => setLoginDetails({ ...loginDetails, email: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="pl-11 h-12 transition-all"
                    required
                    autoComplete="r"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1 animate-shake">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginDetails.password}
                    disabled={isLoading}
                    onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="pl-11 pr-11 h-12 transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1 animate-shake">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(newChecked) => setRememberMe(newChecked === true)}
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm hover:underline font-medium transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out both;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}