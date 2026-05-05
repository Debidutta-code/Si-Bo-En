import Navbar from '@/src/components/Home/Navbar';
import Footer from '@/src/components/Home/RoiBackFooter';

export default function UnAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen space-y-6 pt-[calc(5rem)] lg:pt-[calc(6rem)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
