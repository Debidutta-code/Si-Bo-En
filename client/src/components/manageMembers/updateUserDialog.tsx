'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import type { IUser, ICreateUser, IRoleAccess } from '../../pages/members/types/types';

interface EditMemberDialogProps {
  user: IUser | null;
  roles: IRoleAccess[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: ICreateUser) => Promise<void>;
  errors: z.ZodIssue[];
  loading: boolean;
}

export default function EditMemberDialog({
  user,
  // roles,
  isOpen,
  onOpenChange,
  onSubmit,
  errors,
  loading
}: EditMemberDialogProps) {
  const [formData, setFormData] = useState<ICreateUser>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    level: 0
  });
  const [see, setSee] = useState({
    password: true,
    confirmPassword: false
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        level: user.level || 0
      });
    }
  }, [user]);

  const getErrorMessage = (fieldPath: string) => {
    const error = errors.find(err => err.path.join('.') === fieldPath);
    return error ? error.message : null;
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update member account details for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                aria-invalid={!!getErrorMessage('firstName')}
                aria-describedby={getErrorMessage('firstName') ? "firstName-error" : undefined}
              />
              {getErrorMessage('firstName') && (
                <p id="firstName-error" className="text-sm text-red-500 mt-1">
                  {getErrorMessage('firstName')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                aria-invalid={!!getErrorMessage('lastName')}
                aria-describedby={getErrorMessage('lastName') ? "lastName-error" : undefined}
              />
              {getErrorMessage('lastName') && (
                <p id="lastName-error" className="text-sm text-red-500 mt-1">
                  {getErrorMessage('lastName')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-invalid={!!getErrorMessage('email')}
              aria-describedby={getErrorMessage('email') ? "email-error" : undefined}
            />
            {getErrorMessage('email') && (
              <p id="email-error" className="text-sm text-red-500 mt-1">
                {getErrorMessage('email')}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password (Optional)</Label>
            <div className="relative">
              <Input
                id="password"
                type={see.password ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-invalid={!!getErrorMessage('password')}
                aria-describedby={getErrorMessage('password') ? "password-error" : undefined}
                className="pr-10"
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                onClick={() => setSee((prev) => ({ ...prev, password: !prev.password }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={see.password ? "Hide password" : "Show password"}
              >
                {see.password ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            {getErrorMessage('password') && (
              <p id="password-error" className="text-sm text-red-500 mt-1">
                {getErrorMessage('password')}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={see.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                aria-invalid={!!getErrorMessage('confirmPassword')}
                aria-describedby={getErrorMessage('confirmPassword') ? "confirmPassword-error" : undefined}
                className="pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setSee((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={see.confirmPassword ? "Hide password" : "Show password"}
              >
                {!see.confirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {getErrorMessage('confirmPassword') && (
              <p id="confirmPassword-error" className="text-sm text-red-500 mt-1">
                {getErrorMessage('confirmPassword')}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}