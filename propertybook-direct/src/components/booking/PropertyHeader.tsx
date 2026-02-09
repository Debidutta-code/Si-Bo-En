import { useBooking } from '@/contexts/BookingContext';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyHeaderProps {
  className?: string;
  showBanner?: boolean;
}

export function PropertyHeader({ className, showBanner = false }: PropertyHeaderProps) {
  const { state } = useBooking();
  const { config } = state;

  if (!config) return null;

  return (
    <header className={cn('relative', className)}>
      {showBanner && config.bannerImage && (
        <div className="absolute inset-0 -z-10">
          <img
            src={config.bannerImage}
            alt={config.propertyName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
      )}
      
      <div className="container py-6 flex items-center gap-4">
        {config.logo && (
          <img
            src={config.logo}
            alt={`${config.propertyName} logo`}
            className="h-12 w-auto object-contain rounded"
          />
        )}
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{config.propertyName}</h1>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{config.propertyAddress}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
