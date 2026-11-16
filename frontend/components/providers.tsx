"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { KeyboardNavigation } from "@/components/keyboard-nav";
import { AuthProvider } from "@/lib/auth/auth-context";
import { SearchModal } from "@/components/search/search-modal";
import { WishlistDrawer } from "@/components/layout/wishlist-drawer";
import { AuthModal } from "@/components/auth/auth-modal";
import { useUIStore } from "@/stores/ui-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  const toggleSearch = useUIStore((s) => s.toggleSearch);

  // Global shortcut: Ctrl/Cmd+K toggles the search palette from anywhere
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === "k" || event.key === "K")) {
        const target = event.target as HTMLElement | null;
        const inEditable =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;

        event.preventDefault();
        toggleSearch();
        if (!inEditable) {
          // Focus is captured by the modal's input on open
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSearch]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <KeyboardNavigation />
          {children}
          <SearchModal />
          <WishlistDrawer />
          <AuthModal />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
