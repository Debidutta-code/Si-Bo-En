
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

// --- CHANGE 1: Update the interface ---
interface IPropertyFormContext {
  currentStep: number;
  steps: string[];
  propertyId: string | null;
  roomId: string | null; // ADDED: To store the current room ID
  isSubmitting: boolean;
  completedSteps: number;
  next: () => void;
  previous: () => void;
  goToStep: (step: number) => void;
  setPropertyIdAndUrl: (id: string) => void;
  setRoomIdAndUrl: (id: string) => void; // ADDED: Setter for the room ID
  markStepAsCompleted: () => void;
  handleSubmit: () => Promise<void>;
}

const PropertyFormContext = createContext<IPropertyFormContext | undefined>(
  undefined
);

export const PropertyFormProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const steps = [
    "Property Information",
    "Property Address",
    "Property Amenities",
    "Room",
    "Room Amenities",
    "Bank Details",
  ];

  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(() => {
    const stepFromUrl = searchParams.get("step");
    if (stepFromUrl && !isNaN(parseInt(stepFromUrl))) {
      return Math.max(0, Math.min(parseInt(stepFromUrl), steps.length - 1));
    }
    return 0;
  });

  const [propertyId, setPropertyId] = useState<string | null>(null);
  // --- CHANGE 2: Add roomId state ---
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isSubmitting, _setIsSubmitting] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number>(-1);
  useEffect(() => {
    const idFromUrl = searchParams.get("propertyId");
    const roomIdFromUrl = searchParams.get("roomId"); 
    if (idFromUrl) {
      setPropertyId(idFromUrl);
    }
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, [searchParams]);

  const navigateToStep = (step: number) => {
    setCurrentStep(step);
    setSearchParams(
      (prev) => {
        prev.set("step", String(step));
        return prev;
      },
      { replace: true }
    );
  };

  const setPropertyIdAndUrl = (id: string) => {
    if(!id)return
    setPropertyId(id);
    setSearchParams(
      (prev) => {
        prev.set("propertyId", id);
        return prev;
      },
      { replace: true }
    );
  };

  // --- CHANGE 3: Add setter function for roomId ---
  // Called by the Room component (Step 3) after creating a room
  const setRoomIdAndUrl = (id: string) => {
    if(!id)return
    setRoomId(id);
    setSearchParams(
      (prev) => {
        prev.set("roomId", id); // Add roomId to the URL search params
        return prev;
      },
      { replace: true }
    );
  };

  const markStepAsCompleted = () => {
    setCompletedSteps((prev) => Math.max(prev, currentStep));
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      navigateToStep(currentStep + 1);
    }
  };

  const previous = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= completedSteps + 1) {
      navigateToStep(step);
    }
  };

  const handleSubmit = async () => {
    // ... (no changes to this function)
  };

  // --- CHANGE 4: Add new values to the context provider ---
  const value = {
    currentStep,
    steps,
    propertyId,
    roomId, // EXPORTED
    isSubmitting,
    completedSteps,
    next,
    previous,
    goToStep,
    setPropertyIdAndUrl,
    setRoomIdAndUrl, // EXPORTED
    markStepAsCompleted,
    handleSubmit,
  };

  return (
    <PropertyFormContext.Provider value={value}>
      {children}
    </PropertyFormContext.Provider>
  );
};

export const usePropertyForm = () => {
  const context = useContext(PropertyFormContext);
  if (context === undefined) {
    throw new Error("usePropertyForm must be used within a PropertyFormProvider");
  }
  return context;
};
