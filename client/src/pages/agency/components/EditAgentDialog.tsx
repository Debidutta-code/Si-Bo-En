import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAgent } from '../api/agent.api';
import type { IAgents } from '../interfaces';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: IAgents;
  onSuccess: () => void;
}

const EditAgentDialog: React.FC<EditAgentDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    agencyId: agent.agencyId,
    agentName: agent.agentName,
    agentEmail: agent.agentEmail,
    agentPhone: agent.agentPhone,
    agentPassword: '', // Leave empty by default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateAgent(agent.id, formData);
      if (response.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('EditAgentDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('EditAgentDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Agent Name */}
            <div className="grid gap-2">
              <Label htmlFor="agentName">{t('EditAgentDialog.form.agentName')} *</Label>
              <Input
                id="agentName"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="agentEmail">{t('EditAgentDialog.form.email')} *</Label>
              <Input
                id="agentEmail"
                type="email"
                value={formData.agentEmail}
                onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })}
                required
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="agentPhone">{t('EditAgentDialog.form.phoneNumber')} *</Label>
              <Input
                id="agentPhone"
                value={formData.agentPhone}
                onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="agentPassword">{t('EditAgentDialog.form.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="agentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.agentPassword}
                  onChange={(e) => setFormData({ ...formData, agentPassword: e.target.value })}
                  placeholder={t('EditAgentDialog.form.passwordPlaceholder')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('EditAgentDialog.footer.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('EditAgentDialog.footer.updating') : t('EditAgentDialog.footer.updateAgent')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentDialog;
