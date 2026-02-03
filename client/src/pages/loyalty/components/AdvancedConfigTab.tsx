import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";

interface AdvanceConfig {
  activeInCorporateWeb: boolean;
  defaultLoginMode: boolean;
  allowEmailRecovery: boolean;
  allowNewRequest: boolean;
  allowNewRequestInCorporate: boolean;
  roomLimitByBooking: number;
  externalRegistrationUrl: string;
  blockUserFieldFromForm: boolean;
}

interface AdvancedConfigTabProps {
  advanceProgram: any;
  advanceConfig: AdvanceConfig;
  setAdvanceConfig: (config: AdvanceConfig) => void;
  onSave: () => void;
}

export default function AdvancedConfigTab({
  advanceProgram,
  advanceConfig,
  setAdvanceConfig,
  onSave
}: AdvancedConfigTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Configuration</CardTitle>
        <CardDescription>
          {!advanceProgram 
            ? "Configure advanced settings to enable corporate web features, booking limits, and registration settings"
            : "Manage your advanced loyalty program settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!advanceProgram && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Advanced configuration is optional. Fill in the settings below and click create.
            </AlertDescription>
          </Alert>
        )}

        {/* Service Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Service Settings</h3>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="activeInCorporateWeb">Active in Corporate Web</Label>
              <p className="text-sm text-muted-foreground">
                Enable loyalty program on corporate website
              </p>
            </div>
            <Switch
              id="activeInCorporateWeb"
              checked={advanceConfig.activeInCorporateWeb}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, activeInCorporateWeb: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="defaultLoginMode">Default Login Mode</Label>
              <p className="text-sm text-muted-foreground">
                Set loyalty login as default authentication method
              </p>
            </div>
            <Switch
              id="defaultLoginMode"
              checked={advanceConfig.defaultLoginMode}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, defaultLoginMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="allowEmailRecovery">Allow Email Recovery</Label>
              <p className="text-sm text-muted-foreground">
                Allow password recovery via email
              </p>
            </div>
            <Switch
              id="allowEmailRecovery"
              checked={advanceConfig.allowEmailRecovery}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, allowEmailRecovery: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="allowNewRequest">Allow New Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register for loyalty program
              </p>
            </div>
            <Switch
              id="allowNewRequest"
              checked={advanceConfig.allowNewRequest}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, allowNewRequest: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="allowNewRequestInCorporate">Allow Corporate Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new registrations on corporate website
              </p>
            </div>
            <Switch
              id="allowNewRequestInCorporate"
              checked={advanceConfig.allowNewRequestInCorporate}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, allowNewRequestInCorporate: checked })
              }
            />
          </div>
        </div>

        {/* Booking Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Booking Limits</h3>

          <div className="space-y-2">
            <Label htmlFor="roomLimit">Room Limit per Booking</Label>
            <Input
              id="roomLimit"
              type="number"
              min="1"
              value={advanceConfig.roomLimitByBooking}
              onChange={(e) =>
                setAdvanceConfig({
                  ...advanceConfig,
                  roomLimitByBooking: parseInt(e.target.value) || 1
                })
              }
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of rooms per booking for loyalty members
            </p>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Registration Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="externalRegistrationUrl">External Registration URL</Label>
            <Input
              id="externalRegistrationUrl"
              type="url"
              value={advanceConfig.externalRegistrationUrl}
              onChange={(e) =>
                setAdvanceConfig({
                  ...advanceConfig,
                  externalRegistrationUrl: e.target.value
                })
              }
              placeholder="https://example.com/register"
            />
            <p className="text-sm text-muted-foreground">
              Optional external URL for loyalty program registration
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="blockUserFieldFromForm">Block User Field From Form</Label>
              <p className="text-sm text-muted-foreground">
                Prevent users from editing certain fields in registration form
              </p>
            </div>
            <Switch
              id="blockUserFieldFromForm"
              checked={advanceConfig.blockUserFieldFromForm}
              onCheckedChange={(checked) =>
                setAdvanceConfig({ ...advanceConfig, blockUserFieldFromForm: checked })
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            {advanceProgram ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Advanced Configuration
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Advanced Configuration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
