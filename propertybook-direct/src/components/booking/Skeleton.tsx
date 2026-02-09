import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('shimmer rounded-md bg-muted', className)} />
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-card animate-pulse">
      <div className="flex flex-col lg:flex-row">
        {/* Image skeleton */}
        <div className="lg:w-2/5 h-64 lg:h-auto">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="lg:w-3/5 p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <Skeleton className="h-16 w-full" />
          
          {/* Amenities skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
          
          {/* Rate plans skeleton */}
          <div className="space-y-3 pt-4 border-t">
            <Skeleton className="h-5 w-24" />
            <div className="grid gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingWidgetSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-lg animate-pulse space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function PriceSummarySkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-lg animate-pulse space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between pt-2 border-t">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}
