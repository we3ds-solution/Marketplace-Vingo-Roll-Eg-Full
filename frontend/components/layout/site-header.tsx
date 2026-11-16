"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Heart, LayoutDashboard, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MegaMenu } from "@/components/layout/mega-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { nav } from "@/lib/data/navigation";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuth } from "@/lib/auth/auth-context";
import { useUIStore } from "@/stores/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const menus = [nav.shop, nav.inspiration, nav.services, nav.guides];

/** Consistent keyboard focus ring for bare icon controls in the header. */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

function linkHref(link: { to: string; slug?: string }) {
  return "slug" in link && link.slug ? `/shop/${link.slug}` : link.to;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = hydrated && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`${FOCUS_RING} text-muted-foreground hidden h-10 w-10 place-items-center transition-colors hover:text-accent sm:grid`}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}

function SheetThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = hydrated && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-accent text-accent-foreground absolute -top-0.5 -end-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none">
      {count}
    </span>
  );
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const wishlist = useWishlistStore((s) => s.slugs);
  const hydrated = useWishlistStore((s) => s.hydrated);
  const refreshWishlist = useWishlistStore((s) => s.refresh);
  const { isAdmin, status } = useAuth();
  const isAuthenticated = status === "authenticated";
  const openSearch = useUIStore((s) => s.openSearch);
  const openWishlist = useUIStore((s) => s.openWishlist);
  const openAuthModal = useUIStore((s) => s.openAuthModal);

  useEffect(() => {
    void refreshWishlist();
  }, [refreshWishlist]);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close any open navigation when the route changes
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Close the mega menu on Escape
  useEffect(() => {
    if (openMenu === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openMenu]);

  const onImage = overlay && !scrolled;

  const banner = bannerVisible ? (
    <div className="pointer-events-auto bg-primary/90 text-primary-foreground relative px-10 py-2 text-center text-[11px] tracking-[0.16em] uppercase">
      <span className="hidden min-[460px]:inline">Free swatches on every order · Complimentary design consultation</span>
      <span className="min-[460px]:hidden">Free swatches on every order</span>
      <button
        onClick={() => setBannerVisible(false)}
        className={`${FOCUS_RING} hover:opacity-70 absolute end-4 top-1/2 -translate-y-1/2 transition-opacity`}
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  ) : null;

  const header = (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors pointer-events-auto",
        onImage
          ? "border-transparent bg-transparent text-white"
          : "bg-background/90 backdrop-blur",
        !onImage && (scrolled ? "border-border" : "border-transparent"),
      )}
      onMouseLeave={() => setOpenMenu(null)}
      onBlurCapture={(event) => {
        // Focus moved outside the header entirely — close the mega menu for keyboard users
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpenMenu(null);
        }
      }}
    >
        <div className="container-page relative flex h-16 items-center justify-between gap-3 md:h-20">
          {/* Left group: hamburger on mobile + logo — brand stays flush-left at all widths */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-10">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                <SheetHeader className="border-b p-5">
                  <SheetTitle className="font-display text-xl">Vingo Roll</SheetTitle>
                  <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
                </SheetHeader>
                <div className="p-5">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); useUIStore.getState().openSearch(); }}
                    className="border-border text-muted-foreground mb-6 flex w-full items-center gap-2 rounded-sm border px-3 py-2.5 text-start text-sm transition-colors hover:text-foreground"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" /> Search curtains, shades, rooms
                  </button>
                  <Accordion type="single" collapsible className="w-full">
                    {menus.map((menu) => (
                      <AccordionItem key={menu.label} value={menu.label}>
                        <AccordionTrigger className="font-display text-lg">
                          {menu.label}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-5">
                            {menu.columns.map((col) => (
                              <div key={col.title}>
                                <p className="eyebrow mb-2">{col.title}</p>
                                <ul className="space-y-2">
                                  {col.links.map((link) => (
                                    <li key={link.label}>
                                      <Link
                                        href={linkHref(link)}
                                        className="text-muted-foreground hover:text-foreground text-sm"
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    <AccordionItem value="about">
                      <AccordionTrigger className="font-display text-lg">About</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          <li>
                            <Link href="/about" className="text-muted-foreground text-sm">
                              About Vingo Roll
                            </Link>
                          </li>
                          <li>
                            <Link href="/about/our-story" className="text-muted-foreground text-sm">
                              Our Story
                            </Link>
                          </li>
                          <li>
                            <Link href="/trade" className="text-muted-foreground text-sm">
                              Trade Program
                            </Link>
                          </li>
                          <li>
                            <Link href="/contact" className="text-muted-foreground text-sm">
                              Contact
                            </Link>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Button asChild className="mt-6 w-full">
                    <Link href="/quote">Get a quick quote</Link>
                  </Button>
                  <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-xs">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="text-accent">
                        Studio dashboard
                      </Link>
                    )}
                    <SheetThemeToggle />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {isAuthenticated ? (
                      <Link href="/account" onClick={() => setOpen(false)} className="border-border hover:border-accent inline-flex items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors">
                        <User className="h-4 w-4" aria-hidden="true" /> My account
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setOpen(false); useUIStore.getState().openAuthModal("login"); }}
                        className="border-border hover:border-accent inline-flex items-center gap-2 rounded-sm border px-3 py-2.5 text-start text-sm transition-colors"
                      >
                        <User className="h-4 w-4" aria-hidden="true" /> Sign in / Create account
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); useUIStore.getState().openWishlist(); }}
                      className="border-border hover:border-accent inline-flex items-center gap-2 rounded-sm border px-3 py-2.5 text-start transition-colors"
                    >
                      <Heart className="h-4 w-4" aria-hidden="true" /> Wishlist
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="font-display text-lg uppercase tracking-[0.18em] whitespace-nowrap sm:text-xl md:text-2xl">
            Vingo<span className="text-accent">.</span>Roll
          </Link>
          </div>

          <nav aria-label="Primary" className="hidden h-full items-center gap-0.5 lg:flex xl:gap-1">
            {menus.map((menu) => (
              <MegaMenu
                key={menu.label}
                label={menu.label}
                columns={menu.columns}
                image={menu.image}
                imageAlt={menu.imageAlt}
                isOpen={openMenu === menu.label}
                onMouseEnter={() => setOpenMenu(menu.label)}
                onMouseLeave={() => setOpenMenu(null)}
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              />
            ))}
            <Link
              href="/about"
              className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-2 py-2 text-[12px] uppercase tracking-[0.1em] transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.12em]"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search products"
              className={`${FOCUS_RING} hover:text-accent grid h-10 w-10 place-items-center transition-colors`}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={openWishlist}
              aria-label="Open wishlist"
              className={`${FOCUS_RING} hover:text-accent relative hidden h-10 w-10 place-items-center transition-colors md:grid`}
            >
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
              <CountBadge count={hydrated ? wishlist.length : 0} />
            </button>
            <NotificationsBell />
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Studio dashboard"
                title="Studio dashboard"
                className={`${FOCUS_RING} hover:text-accent hidden h-10 items-center justify-center transition-colors sm:flex sm:w-10 xl:w-auto xl:gap-1.5 xl:px-3`}
              >
                <LayoutDashboard className="h-[18px] w-[18px] xl:hidden" aria-hidden="true" />
                <span className="hidden text-[13px] uppercase tracking-[0.12em] xl:inline">Dashboard</span>
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                href="/account"
                aria-label="Account"
                className={`${FOCUS_RING} hover:text-accent hidden h-10 w-10 place-items-center transition-colors sm:grid`}
              >
                <User className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                aria-label="Sign in or create account"
                className={`${FOCUS_RING} hover:text-accent hidden h-10 w-10 place-items-center transition-colors sm:grid`}
              >
                <User className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            )}
            <CartDrawer />
          </div>
        </div>
    </header>
  );

  if (overlay) {
    // Immersive mode: the header overlays the hero from y = 0.
    // `absolute inset-0` spans the full page so the header can stick for the entire scroll;
    // `pointer-events-none` lets clicks pass through to the hero (children opt back in).
    return (
      <div className="pointer-events-none absolute inset-0 z-40">
        {banner}
        {header}
      </div>
    );
  }

  return (
    <>
      {banner}
      {header}
    </>
  );
}
