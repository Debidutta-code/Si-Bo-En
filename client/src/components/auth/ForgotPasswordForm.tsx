import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '../api/forgetEmail.api';
import { z } from 'zod';
import toast from 'react-hot-toast';

const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long." })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
  .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
  .regex(/[0-9]/, { message: "Password must contain at least one number." });

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordForm() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  // Check if user came from email link
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    const verifiedParam = searchParams.get('verified');

    if (emailParam && otpParam && verifiedParam === 'true') {
      setEmail(decodeURIComponent(emailParam));
      setOtp(otpParam);
      setStep('password');
      toast.success('Email verified! Please set your new password.');
    }
  }, [searchParams]);

  const handleSendOTP = async () => {
    // Validate email
    const emailSchema = z.string().email({ message: "Invalid email address" });
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
      setErrors({ ...errors, email: validation.error.issues[0].message });
      return;
    }

    setErrors({ ...errors, email: '' });
    setIsLoading(true);

    try {
      const response = await sendPasswordResetOTP(email);

      if (response?.success) {
        toast.success("OTP sent to your email");
        setStep('otp');
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ ...errors, otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setErrors({ ...errors, otp: '' });
    setIsLoading(true);

    try {
      const response = await verifyPasswordResetOTP(email, otp);

      if (response?.success) {
        toast.success("OTP verified successfully");
        setStep('password');
      } else {
        toast.error(response?.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        ...errors,
        password: fieldErrors.password ? fieldErrors.password[0] : '',
        confirmPassword: fieldErrors.confirmPassword ? fieldErrors.confirmPassword[0] : '',
      });
      return;
    }

    setErrors({ ...errors, password: '', confirmPassword: '' });
    setIsLoading(true);

    try {
      const response = await resetPassword(email, otp, password);

      if (response?.success) {
        toast.success("Password updated successfully");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(response?.message || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Section */}
      <div className="lg:flex hidden lg:w-1/2 relative bg-primary h-screen">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground w-full">
          <div className="space-y-8">
            <div>
              <Shield className="h-16 w-16 mb-4" />
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Reset Your Password
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                We'll send you a verification code to reset your password securely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/swiftrooms.jpeg" 
              alt="SwiftRooms Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <Card className="border shadow-xl">
            <CardHeader className="space-y-2 text-center pb-2">
              <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
              <CardDescription className="text-base">
                {step === 'email' && "Enter your email to receive a verification code"}
                {step === 'otp' && "Enter the 6-digit code sent to your email"}
                {step === 'password' && "Create a new password for your account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Email */}
              {step === 'email' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendOTP()}
                        className="pl-11 h-12"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleVerifyOTP()}
                      className="h-12 text-center text-2xl tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                      autoFocus
                    />
                    {errors.otp && (
                      <p className="text-destructive text-sm mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <div className="text-sm text-center">
                    <span className="text-muted-foreground">Didn't receive the code? </span>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 'password' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12"
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleResetPassword()}
                        className="pl-11 pr-11 h-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>


                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </>
              )}

              {/* Back to Login */}
              <button
                onClick={() => navigate('/login')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
