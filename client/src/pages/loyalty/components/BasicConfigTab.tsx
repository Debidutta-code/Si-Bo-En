import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BasicConfigTabProps {
  basicProgram: any;
  creationId?: string;
  logos: string[];
  isBasicActive: boolean;
  setIsBasicActive: (value: boolean) => void;
  onUploadClick: () => void;
  onRemoveLogo: (index: number) => void;
  onCreate: () => void;
  onUpdate: () => void;
}

export default function BasicConfigTab({
  basicProgram,
  // creationId,
  logos,
  isBasicActive,
  setIsBasicActive,
  onUploadClick,
  onRemoveLogo,
  onCreate,
  onUpdate
}: BasicConfigTabProps) {
  const { t } = useTranslation();

  if (!basicProgram) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("LoyaltyBasicConfig.title")}</CardTitle>
          <CardDescription>
            {t("LoyaltyBasicConfig.noConfig")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("LoyaltyBasicConfig.optional")}
            </AlertDescription>
          </Alert>

          {/* Upload logos before creating */}
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label>{t("LoyaltyBasicConfig.programLogos")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("LoyaltyBasicConfig.uploadBeforeCreate")}
              </p>
              
              {logos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {logos.map((logo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square border-2 border-dashed rounded-lg overflow-hidden">
                        <img
                          src={logo}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveLogo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={onUploadClick}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t("LoyaltyBasicConfig.uploadLogos")}
              </Button>
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="basicActive">{t("LoyaltyBasicConfig.activeStatus")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("LoyaltyBasicConfig.activeStatusDesc")}
                </p>
              </div>
              <Switch
                id="basicActive"
                checked={isBasicActive}
                onCheckedChange={setIsBasicActive}
              />
            </div>
          </div>

          <Button 
            onClick={onCreate} 
            size="lg" 
            className="w-full md:w-auto"
            disabled={logos.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("LoyaltyBasicConfig.createConfig")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("LoyaltyBasicConfig.title")}</CardTitle>
        <CardDescription>
          {t("LoyaltyBasicConfig.configSettings")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">


        {/* Program Logo */}
        <div className="space-y-2">
          <Label>{t("LoyaltyBasicConfig.programLogos")}</Label>
          <p className="text-sm text-muted-foreground mb-4">
            {t("LoyaltyBasicConfig.manageLogos")}
          </p>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {logos.map((logo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square border-2 border-dashed rounded-lg overflow-hidden">
                  <img
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveLogo(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={onUploadClick}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t("LoyaltyBasicConfig.uploadMore")}
          </Button>

          <p className="text-xs text-muted-foreground">
            {t("LoyaltyBasicConfig.recommendedSize")} {" "}
            <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {t("LoyaltyBasicConfig.tinyPng")}
            </a>
          </p>
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="basicActiveEdit">{t("LoyaltyBasicConfig.activeStatus")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("LoyaltyBasicConfig.activeStatusDesc")}
            </p>
          </div>
          <Switch
            id="basicActiveEdit"
            checked={isBasicActive}
            onCheckedChange={setIsBasicActive}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onUpdate}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("LoyaltyBasicConfig.saveConfig")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
