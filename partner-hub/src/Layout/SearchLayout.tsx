import { Outlet, useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import SearchWidget from "@/components/search/SearchWidget";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";

/**
 * Inner component so we can access the SearchContext that wraps it.
 * The actual fetch logic lives in PropertyRoomsPage — we trigger it by
 * bumping a `searchKey` counter that the page watches via useEffect.
 */
function LayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * `searchKey` is passed down via context or as a route state so that
   * PropertyRoomsPage can watch it and re-fetch when it increments.
   *
   * Simpler alternative: expose a ref / callback from the page itself
   * and call it directly — but the key-bump pattern is cleaner because
   * it also works when the page re-mounts.
   */
  const [searchKey, setSearchKey] = useState(0);

  const triggerSearch = useCallback(() => {
    setSearchKey((k) => k + 1);
  }, []);

  return (
    <div className="flex min-h-screen max-h-screen w-full bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1 flex-col min-h-screen max-h-screen overflow-hidden">
        <div className="sticky top-0 z-30">
          <Header setMobileMenuOpen={setMobileMenuOpen} />
        </div>

        <main className="flex-1 overflow-auto p-4 lg:p-6 space-y-4">
   
          <SearchWidget
            onSearch={triggerSearch}
            onGuestsDone={triggerSearch}
          />

          <Outlet key={searchKey} />
        </main>
      </div>
    </div>
  );
}

export default function SearchLayout() {
  return (
    <SearchProvider>
      <LayoutInner />
    </SearchProvider>
  );
}