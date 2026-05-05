import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loader({ size = "md", className, text, fullScreen = false }: LoaderProps) {
  const loader = (
    <>
      <style>{`
        .loader {
          width: 50px;
          aspect-ratio: 1;
          display: grid;
          border: 4px solid #0000;
          border-radius: 50%;
          border-right-color: #25b09b;
          animation: l15 1s infinite linear;
        }
        .loader::before,
        .loader::after {
          content: "";
          grid-area: 1/1;
          margin: 2px;
          border: inherit;
          border-radius: 50%;
          animation: l15 2s infinite;
        }
        .loader::after {
          margin: 8px;
          animation-duration: 3s;
        }
        @keyframes l15 {
          100% { transform: rotate(1turn); }
        }
      `}</style>
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className="loader" />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  );
}

export function ButtonLoader() {
  return <Loader2 className="h-4 w-4 loader-spin" />;
}
