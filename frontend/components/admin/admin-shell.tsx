"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  DoorOpen,
  Target,
  Ruler,
  SwatchBook,
  Palette,
  Newspaper,
  Star,
  Inbox,
  ShoppingBag,
  Mail,
  Home,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  Store,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
      { href: "/admin/needs", label: "Needs", icon: Target },
      { href: "/admin/sizes", label: "Sizes", icon: Ruler },
      { href: "/admin/materials", label: "Materials", icon: SwatchBook },
      { href: "/admin/colors", label: "Colors", icon: Palette },
    ],
  },
  {
    title: "Content",
    items: [{ href: "/admin/inspiration", label: "Inspiration", icon: Newspaper }],
  },
  {
    title: "Commerce & marketing",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/vendors", label: "Vendors", icon: Store },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Shared navigation — rendered as the desktop sidebar and inside the mobile drawer.
 * `collapsed` renders an icon-only rail (desktop only).
 */
function AdminNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const isActive = useIsActive();

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Admin sections" className="flex-1 space-y-5 overflow-y-auto p-3">
        {NAV.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-muted-foreground mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {!collapsed && item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {collapsed && <div className="border-border mx-2 mt-4 border-t" aria-hidden="true" />}
          </div>
        ))}
      </nav>

      <div className="border-border border-t p-3">
        <Link
          href="/"
          title={collapsed ? "Back to storefront" : undefined}
          aria-label={collapsed ? "Back to storefront" : undefined}
          className={cn(
            "text-muted-foreground hover:text-foreground flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && "Back to storefront"}
        </Link>
      </div>
    </div>
  );
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-baseline gap-1.5">
      <span className="font-display truncate text-lg font-semibold tracking-tight">
        {collapsed ? "V." : "Vingo Roll"}
      </span>
      {!collapsed && <span className="text-muted-foreground text-xs font-normal">/ admin</span>}
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore the desktop rail preference once on mount (never during SSR).
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("vingo-admin-sidebar") === "collapsed");
    } catch {
      // storage unavailable — keep the default expanded rail
    }
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem("vingo-admin-sidebar", next ? "collapsed" : "expanded");
      } catch {
        // storage unavailable — the toggle still works for this session
      }
      return next;
    });

  // Close the mobile drawer whenever the route changes.
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      useUIStore.getState().openAuthModal("login", "/admin");
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      toast.error("You don't have studio admin access");
      router.replace("/account");
    }
  }, [status, isAdmin, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen">
        <div className="bg-muted hidden h-screen w-60 animate-pulse md:block" aria-hidden="true" />
        <div className="flex-1 p-6 sm:p-8">
          <div className="bg-muted mb-6 h-14 animate-pulse rounded md:hidden" aria-hidden="true" />
          <div className="bg-muted h-8 w-64 max-w-full animate-pulse rounded" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) {
    return null; // redirecting
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — full width or icon-only rail */}
      <aside
        aria-label="Admin navigation"
        className={cn(
          "border-border bg-card sticky top-0 hidden h-screen shrink-0 flex-col border-e transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="border-border flex h-14 items-center justify-between gap-2 border-b px-3">
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-muted-foreground hover:text-foreground hover:bg-muted grid h-8 w-8 shrink-0 place-items-center rounded-sm transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <AdminNav collapsed={collapsed} />
      </aside>

      {/* Content column */}
      <div className="min-w-0 flex-1">
        {/* Mobile top bar with drawer trigger */}
        <header className="border-border bg-background/90 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open admin menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
              <SheetHeader className="border-border h-14 flex-row items-center justify-between gap-2 border-b px-4 py-0 text-start">
                <SheetTitle className="font-display text-base">
                  Vingo Roll <span className="text-muted-foreground text-xs font-normal">/ admin</span>
                </SheetTitle>
                <SheetDescription className="sr-only">Admin navigation</SheetDescription>
              </SheetHeader>
              <div className="h-[calc(100%-3.5rem)]">
                <AdminNav onNavigate={closeMobile} />
              </div>
            </SheetContent>
          </Sheet>
          <Brand />
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
