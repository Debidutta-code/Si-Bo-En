import { Suspense } from "react";
import Navbar from "@/src/components/Home/Navbar";
import Footer from "@/src/components/Home/RoiBackFooter";
import { PropertyProvider } from "@/src/components/context/property-context";

export default function UnAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Suspense is required because PropertyProvider calls useSearchParams()
    <Suspense>
      <PropertyProvider>
        <Navbar />
        <main className="min-h-screen space-y-6 pt-[calc(5rem)] lg:pt-[calc(6rem)]">
          {children}
        </main>
        <Footer />
      </PropertyProvider>
    </Suspense>
  );
}