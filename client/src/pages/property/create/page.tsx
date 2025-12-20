
import { Check } from "lucide-react";
import { PropertyFormProvider, usePropertyForm } from "@/contexts/PropertyFormContext";
import PropertyInfo from "@/components/property/create/PropertyInfo";
import PropertyAddress from "@/components/property/create/PropertyAddress";
import PropertyAmenities from "@/components/property/create/PropertyAmenities";
import Rooms from "@/components/property/create/Rooms";
import RoomAmenity from "@/components/property/create/RoomAmenity";
import BankDetails from "@/components/property/create/BankDetails";
// This is the actual view component. It assumes it's inside the provider.
function PropertyCreateView() {
  // Get everything needed for the view from our custom hook
  const { currentStep, steps, goToStep } = usePropertyForm();

  // Your getStepDescription and StepSidebar can live here or be moved to the context
  const getStepDescription = (index: number): string => {
    switch (index) {
      case 0:
        return "General property information";
      case 1:
        return "Location of property";
      case 2:
        return "Features and services offered by the property";
      case 3:
        return "Room Details";
      case 4:
        return "In-room features and available facilities";
      case 5:
        return "Bank details to receive payments";
      default:
        return "";
    }
  };

  const StepSidebar = () => (
    <div className="flex flex-col gap-6">
      {steps.map((step, index) => (
        <div key={index} className="relative">
          {index < steps.length - 1 && (
            <div
              className={`absolute h-full left-3.5 top-7 w-0.5  transition-all ${
                index < currentStep ? "bg-primary" : "bg-gray-300"
              }`}
            />
          )}

          {/* Step content */}
          <div
            onClick={() => goToStep(index)}
            className={`flex gap-3 items-start cursor-pointer group relative z-10`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all bg-white ${
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "border-primary text-primary"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <div>
              <div
                className={`text-sm font-semibold ${
                  index === currentStep
                    ? "text-black"
                    : "text-gray-600 group-hover:text-black"
                }`}
              >
                {step}
              </div>
              <div className="text-xs text-gray-400">
                {getStepDescription(index)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PropertyInfo />;
      case 1: return <PropertyAddress />;
      case 2: return <PropertyAmenities />;
      case 3: return <Rooms />;
      case 4: return <RoomAmenity />;
      case 5: return <BankDetails />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-4 h-fit gap-8">
        <div className="col-span-1 hidden md:block">
          <StepSidebar />
        </div>
        <div className="col-span-1 md:col-span-3">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

// The final exported component just wraps the view with the provider.
export default function PropertyCreatePage() {
  return (
    <PropertyFormProvider>
      <PropertyCreateView />
    </PropertyFormProvider>
  );
}