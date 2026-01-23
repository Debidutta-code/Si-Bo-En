// components/BookingConfigForm.tsx
'use client'

import * as React from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ColorPicker from './ColorPicker';
import LivePreview from './LivePreview';
import type { BookingEngineConfig } from '../interface';
import { uploadImages } from '../api';
import ImageUploadModal from '@/components/property/ImageUploadModal';

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
  const [primaryColor, setPrimaryColor] = React.useState(initialConfig?.primaryColor || '#02438D');
  const [secondaryColor, setSecondaryColor] = React.useState(initialConfig?.secondaryColor || '#10B981');
  const [tertiaryColor, setTertiaryColor] = React.useState(initialConfig?.tertiaryColor || '#F59E0B');
  const [buttonTextColor, setButtonTextColor] = React.useState(initialConfig?.buttonTextColor || '#FFFFFF');
  // const [bannerImage, setBannerImage] = React.useState(initialConfig?.bannerImage || '');
  const [logo, setLogo] = React.useState(initialConfig?.logo || '');
  
  const [uploadType, setUploadType] = React.useState<'logo' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const config: BookingEngineConfig = {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    buttonTextColor,
    // bannerImage,
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

  // const handleUploadSuccess = (urls: string[]) => {
  //   if (urls.length > 0) {
  //     if (uploadType === 'banner') {
  //       setBannerImage(urls[0]);
  //     } else if (uploadType === 'logo') {
  //       setLogo(urls[0]);
  //     }
  //   }
  // };
  // Update the handleUploadSuccess function:
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
          <h2 className="text-xl font-bold mb-6">Color Configuration</h2>
          <div className="space-y-4">
            <ColorPicker
              label="Primary Color"
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorPicker
              label="Secondary Color"
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
            <ColorPicker
              label="Tertiary Color"
              value={tertiaryColor}
              onChange={setTertiaryColor}
            />
            <ColorPicker
              label="Button Text Color"
              value={buttonTextColor}
              onChange={setButtonTextColor}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Images</h2>
          <div className="space-y-4">
            {/* Banner Image */}
            {/* <div>
              <label className="text-sm font-medium mb-2 block">Banner Image</label>
              {bannerImage ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                  <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setBannerImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No banner uploaded</span>
                </div>
              )}
              <Button
                onClick={() => setUploadType('banner')}
                variant="outline"
                className="w-full mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Banner
              </Button>
            </div> */}

            {/* Logo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Logo</label>
              {logo ? (
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden group mx-auto">
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  <button
                    onClick={() => setLogo('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-sm">No logo</span>
                </div>
              )}
              <Button
                onClick={() => setUploadType('logo')}
                variant="outline"
                className="w-full mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
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
              Saving...
            </>
          ) : (
            isUpdate ? 'Update Configuration' : 'Create Configuration'
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
        uploadImages={uploadImages}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}