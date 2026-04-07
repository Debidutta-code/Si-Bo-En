import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonLoader } from '@/components/Loader';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { getMeService, loginService } from './services';
import type { IAgentLogin, ILoading } from './interface';
import { setUser } from '@/redux/slices/authSlice';
import { useAppDispatch } from '@/redux/hooks';
export default function LoginPage() {
  const [loginCred, setLoginCred] = useState<IAgentLogin>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<ILoading>({
    isLoading: false,
    message: ''
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginCred.email || !loginCred.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading({ isLoading: true, message: 'Logging in...' });

    const result = await loginService(loginCred);

    if (result.success) {
      const meResult = await getMeService();
      if (meResult.success && meResult.data?.agent) {
        dispatch(setUser(meResult.data.agent));
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed. Please try again.');
    }

    setIsLoading({ isLoading: false, message: '' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Manage Your Properties<br />With Confidence
            </h1>
            <p className="text-lg opacity-80 max-w-md">
              Access your dashboard, manage reservations, and grow your business with our comprehensive partner management platform.
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >

          <div
            className='w-full flex flex-row justify-center '
          >

            <img src="/revchill.png" alt="Revchill Logo" className='w-3/4  ' />
          </div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your partner dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="partner@example.com"
                      value={loginCred.email}
                      onChange={(e) => setLoginCred({ ...loginCred, email: e.target.value })}
                      className="pl-10"
                      disabled={isLoading.isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginCred.password}
                      onChange={(e) => setLoginCred({ ...loginCred, password: e.target.value })}
                      className="pl-10 pr-10"
                      disabled={isLoading.isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading.isLoading}>
                  {isLoading.isLoading ? (
                    <>
                      <ButtonLoader />
                      <span className="ml-2">{isLoading.message}</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
