// page.tsx
'use client'

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import { BookingConfigForm } from './components';
import {
  fetchBookingEngineConfigService,
  createBookingEngineConfigService,
  updateBookingEngineConfigService,
} from './service';
import type { BookingEngineConfig, BookingEngineData } from './interface';
import Loader from '@/components/Loader/Loader';
import { useParams } from 'react-router-dom';

export default function BookingEngineConfigPage() {
  const params = useParams();
  const propertyId = params?.propertyId as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [existingConfig, setExistingConfig] = React.useState<BookingEngineData | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (propertyId) {
      fetchConfig();
    }
  }, [propertyId]);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchBookingEngineConfigService(propertyId);
      if (result.success && result.data) {
        setExistingConfig(result.data);
        setShowForm(true); // Auto-show form if config exists
      } else {
        setExistingConfig(null);
        setShowForm(false);
      }
    } catch (err) {
      setError('Failed to fetch configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: BookingEngineConfig) => {
    try {
      let result;
      if (existingConfig) {
        result = await updateBookingEngineConfigService(propertyId, config);
      } else {
        result = await createBookingEngineConfigService(propertyId, config);
      }

      if (result.success) {
        toast.success(
          existingConfig
            ? 'Configuration updated successfully!'
            : 'Configuration created successfully!'
        );
        await fetchConfig(); // Refresh to get latest data
      } else {
        toast.error(result.message || 'Failed to save configuration');
      }
    } catch (err) {
      toast.error('An error occurred while saving');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading configuration..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Engine Configuration
          </h1>
          <p className="text-gray-600">
            Customize the appearance of your booking engine
          </p>
        </div>

        {/* No Config State */}
        {!existingConfig && !showForm && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Configuration Found
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't configured your booking engine yet. Create a configuration to customize your booking experience.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-black text-white hover:bg-gray-800"
              >
                Create Configuration
              </Button>
            </div>
          </Card>
        )}

        {/* Existing Config State */}
        {existingConfig && !showForm && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configuration Active
              </h2>
              <p className="text-gray-600 mb-6">
                You already have a booking engine configuration. You can update it anytime to match your brand.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-black text-white hover:bg-gray-800"
              >
                Update Configuration
              </Button>
            </div>
          </Card>
        )}

        {/* Form */}
        {showForm && (
          <BookingConfigForm
            initialConfig={existingConfig || undefined}
            onSave={handleSave}
            isUpdate={!!existingConfig}
          />
        )}
      </div>
    </div>
  );
}