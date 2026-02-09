import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { path: '/rooms', label: 'Select Room', step: 1 },
  { path: '/add-ons', label: 'Add-Ons', step: 2 },
  { path: '/guest-details', label: 'Guest Details', step: 3 },
  { path: '/payment', label: 'Payment', step: 4 },
  { path: '/confirmation', label: 'Confirmation', step: 5 },
];

export function BookingProgress() {
  const location = useLocation();
  
  const currentStepIndex = steps.findIndex(s => s.path === location.pathname);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;

  return (
    <nav className="bg-card border-b" aria-label="Booking progress">
      <div className="container py-4">
        <ol className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.step;
            const isCurrent = currentStep === step.step;
            const isClickable = isCompleted || isCurrent;

            return (
              <li key={step.path} className="flex items-center">
                {isClickable ? (
                  <Link
                    to={step.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors',
                      isCurrent && 'bg-primary text-primary-foreground',
                      isCompleted && 'text-primary hover:bg-primary/10'
                    )}
                  >
                    <span className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                      isCurrent && 'bg-primary-foreground text-primary',
                      isCompleted && 'bg-primary text-primary-foreground'
                    )}>
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.step}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">
                      {step.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold border border-muted-foreground/30">
                      {step.step}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                )}
                
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground flex-shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
