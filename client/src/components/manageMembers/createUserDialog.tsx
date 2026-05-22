'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import type { ICreateUser, IRoleAccess } from '../../pages/members/types/types';
import { useAppSelector } from '@/redux/hooks';
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface CreateMemberDialogProps {
  roles: IRoleAccess[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: ICreateUser) => Promise<void>;
  errors: z.ZodIssue[];
  loading: boolean;
}

export default function CreateMemberDialog({
  roles,
  isOpen,
  onOpenChange,
  onSubmit,
  errors,
  loading
}: CreateMemberDialogProps) {
    const { t } = useTranslation();

  const { user } = useAppSelector((state) => state.user);
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

  // Debug: log errors when they arrive to help trace validation flow
  useEffect(() => {
    if (errors && errors.length > 0) {
      console.debug('CreateMemberDialog: received validation errors', errors);
    }
  }, [errors]);

  const getErrorMessage = (fieldPath: string) => {
    const error = errors.find(err => err.path.join('.') === fieldPath);
    return error ? error.message : null;
  };

  const handleSubmit = async () => {
    // eslint-disable-next-line no-console
    console.debug('CreateMemberDialog: submitting formData', formData);
    await onSubmit(formData);
    // eslint-disable-next-line no-console
    console.debug('CreateMemberDialog: onSubmit returned');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      level: 0
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("ManageMembers.addNewMember")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ManageMembers.addNewMember")}</DialogTitle>
          <DialogDescription>
            {t("ManageMembers.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("ManageMembers.firstName")}</Label>
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
              <Label htmlFor="lastName">{t("ManageMembers.lastName")}</Label>
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
            <Label htmlFor="email">{t("ManageMembers.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
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
            <Label htmlFor="password">{t("ManageMembers.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={see.password ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-invalid={!!getErrorMessage('password')}
                aria-describedby={getErrorMessage('password') ? "password-error" : undefined}
                className="pr-10"
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
            <Label htmlFor="confirmPassword">{t("ManageMembers.confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={see.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                aria-invalid={!!getErrorMessage('confirmPassword')}
                aria-describedby={getErrorMessage('confirmPassword') ? "confirmPassword-error" : undefined}
                className="pr-10"
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

          <div className="space-y-2">
            <Label htmlFor="role">{t("ManageMembers.role")}</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => {
                const selectedRole = roles.find((role) => role.role === value);
                if (selectedRole) {
                  setFormData({ 
                    ...formData, 
                    role: selectedRole.role, 
                    level: selectedRole.level 
                  });
                }
              }}
            >
              <SelectTrigger 
                className={getErrorMessage('role') ? 'border-red-500' : ''}
                aria-invalid={!!getErrorMessage('role')} 
                aria-describedby={getErrorMessage('role') ? "role-error" : undefined}
              >
                <SelectValue placeholder={t("ManageMembers.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {roles && roles.length > 0 ? (
                  roles.map((item, index) => (
                    item.level <= (user?.userLevel ?? 0) && (
                      <SelectItem key={index} value={item.role}>
                        {capitalizeFirstLetter(item.role).replace(/_/g, ' ')}
                      </SelectItem>
                    )
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">{t("ManageMembers.noRolesAvailable")}</div>
                )}
              </SelectContent>
            </Select>
            {getErrorMessage('role') && (
              <p id="role-error" className="text-sm text-red-500 mt-1">
                {getErrorMessage('role')}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              {t("ManageMembers.cancel")}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t("ManageMembers.creating") : t("ManageMembers.createMemberBtn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}