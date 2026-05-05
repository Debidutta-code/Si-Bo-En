import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { verifyResetToken, resetPasswordWithToken } from '../api/forgetEmail.api';
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

type VerificationState = 'verifying' | 'valid' | 'invalid' | 'expired';

export default function LinkVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verificationState, setVerificationState] = useState<VerificationState>('verifying');
  const [_email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ password: string; confirmPassword: string }>({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) {
      setVerificationState('invalid');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await verifyResetToken(token);
        setEmail(response.email);
        setVerificationState('valid');
      } catch (error: any) {
        if (error.response?.data?.message?.includes('expired')) {
          setVerificationState('expired');
        } else {
          setVerificationState('invalid');
        }
      }
    };

    verifyToken();
  }, [token]);

  const handleResetPassword = async () => {
    // Validate passwords
    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!validation.success) {
      const fieldErrors = { password: '', confirmPassword: '' };
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'password') {
          fieldErrors.password = issue.message;
        } else if (issue.path[0] === 'confirmPassword') {
          fieldErrors.confirmPassword = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setErrors({ password: '', confirmPassword: '' });

    try {
      await resetPasswordWithToken(token!, password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 text-primary-foreground items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        <div className="relative z-10 max-w-lg">
          <div className="flex flex-col items-center text-center">
            <Shield className="h-16 w-16 mb-4" />
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Reset Your Password
            </h2>
            <p className="text-primary-foreground/90 text-lg leading-relaxed max-w-md">
              {verificationState === 'verifying' && "We're verifying your reset link..."}
              {verificationState === 'valid' && "Create a new secure password for your account."}
              {verificationState === 'invalid' && "This link appears to be invalid."}
              {verificationState === 'expired' && "This link has expired."}
            </p>
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
              <CardTitle className="text-3xl font-bold">Password Reset</CardTitle>
              <CardDescription className="text-base">
                {verificationState === 'verifying' && "Please wait while we verify your link..."}
                {verificationState === 'valid' && "Enter your new password below"}
                {verificationState === 'invalid' && "The reset link is invalid"}
                {verificationState === 'expired' && "The reset link has expired"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verifying State */}
              {verificationState === 'verifying' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Verifying your reset link...</p>
                </div>
              )}

              {/* Valid State - Password Form */}
              {verificationState === 'valid' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 h-12"
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleResetPassword()}
                        className="pr-10 h-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">Password Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>At least 6 characters long</li>
                      <li>One uppercase letter</li>
                      <li>One number</li>
                      <li>One special character (@, $, &)</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </>
              )}

              {/* Invalid State */}
              {verificationState === 'invalid' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <p className="text-center text-muted-foreground">
                    This reset link is invalid. Please request a new password reset.
                  </p>
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Request New Link
                  </Button>
                </div>
              )}

              {/* Expired State */}
              {verificationState === 'expired' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <p className="text-center text-muted-foreground">
                    This reset link has expired. Please request a new one.
                  </p>
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Request New Link
                  </Button>
                </div>
              )}

              {/* Back to Login */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-sm"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}