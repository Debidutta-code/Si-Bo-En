import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/redux/hooks';

interface HeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ setMobileMenuOpen }: HeaderProps) {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hidden sm:inline">Partner ID:</span>
        <span className="font-medium text-foreground">{user?.partnerId || 'N/A'}</span>
      </div>
    </header>
  );
}
