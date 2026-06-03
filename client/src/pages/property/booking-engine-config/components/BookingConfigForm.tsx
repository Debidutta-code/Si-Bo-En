// components/BookingConfigForm.tsx
'use client'

import * as React from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ColorPicker from './ColorPicker';
import LivePreview from './LivePreview';
import type { BookingEngineConfig } from '../interface';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import { useTranslation } from 'react-i18next';

interface BookingConfigFormProps {
  initialConfig?: BookingEngineConfig;
  onSave: (config: BookingEngineConfig) => Promise<void>;
  isUpdate: boolean;
}

export default function BookingConfigForm({ 
  initialConfig, 
  onSave, 
  isUpdate 
}: BookingConfigFormProps) {
  const { t } = useTranslation();

  const [primaryColor, setPrimaryColor] = React.useState(initialConfig?.primaryColor || '#02438D');
  const [secondaryColor, setSecondaryColor] = React.useState(initialConfig?.secondaryColor || '#10B981');
  const [tertiaryColor, setTertiaryColor] = React.useState(initialConfig?.tertiaryColor || '#F59E0B');
  const [buttonTextColor, setButtonTextColor] = React.useState(initialConfig?.buttonTextColor || '#FFFFFF');
  const [url, setUrl] = React.useState(initialConfig?.url || '');
  const [logo, setLogo] = React.useState(initialConfig?.logo || '');
  
  const [uploadType, setUploadType] = React.useState<'logo' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const config: BookingEngineConfig = {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    buttonTextColor,
    url,
    logo,
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  };

const handleUploadSuccess = (urls: string[]) => {
  if (urls.length > 0 && uploadType === 'logo') {
    setLogo(urls[0]);
  }
  setUploadType(null); // Close modal after upload
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Form */}
      <div className="space-y-6">
        <Card className="p-6">
          <div>
            <h2 className="text-xl font-bold ">{t('BookingEngine.hotelWebsiteUrl')}</h2>
            <input
              type="text"
              placeholder={t('BookingEngine.pasteUrlHere')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <h2 className="text-xl font-bold my-4">{t('BookingEngine.colorConfiguration')}</h2>
          <div className="space-y-4">
            <ColorPicker
              label={t('BookingEngine.primaryColor')}
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorPicker
              label={t('BookingEngine.secondaryColor')}
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
            <ColorPicker
              label={t('BookingEngine.tertiaryColor')}
              value={tertiaryColor}
              onChange={setTertiaryColor}
            />
            <ColorPicker
              label={t('BookingEngine.buttonTextColor')}
              value={buttonTextColor}
              onChange={setButtonTextColor}
            />
          </div>
          
        </Card>

        <Card className="p-6">
          
          <h2 className="text-xl font-bold my-4">{t('BookingEngine.images')}</h2>
          <div className="space-y-4">
            {/* Banner Image */}
          
            <div>
              <label className="text-sm font-medium mb-2 block">{t('BookingEngine.logo')}</label>
              {logo ? (
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden group mx-auto">
                  <img src={logo} alt={t('BookingEngine.logo')} className="w-full h-full object-contain p-2" />
                  <button
                    onClick={() => setLogo('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-sm">{t('BookingEngine.noLogo')}</span>
                </div>
              )}
              <Button
                onClick={() => setUploadType('logo')}
                variant="outline"
                className="w-full mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('BookingEngine.uploadLogo')}
              </Button>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={isSaving || !logo}
          className="w-full bg-primary text-white hover:bg-gray-800"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('BookingEngine.saving')}
            </>
          ) : (
            isUpdate ? t('BookingEngine.updateConfiguration') : t('BookingEngine.createConfiguration')
          )}
        </Button>
      </div>

      {/* Right Side - Live Preview */}
      <div className="lg:sticky lg:top-6 h-fit">
        <LivePreview config={config} />
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={uploadType !== null}
        onClose={() => setUploadType(null)}
        // uploadImages={uploadImages}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}