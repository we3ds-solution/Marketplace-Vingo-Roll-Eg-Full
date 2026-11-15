"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Heart, LayoutDashboard, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MegaMenu } from "@/components/layout/mega-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { nav } from "@/lib/data/navigation";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuth } from "@/lib/auth/auth-context";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const menus = [nav.shop, nav.inspiration, nav.services, nav.guides];

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
      className="hover:text-accent grid h-10 w-10 place-items-center transition-colors"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-accent text-accent-foreground absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none">
      {count}
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const wishlist = useWishlistStore((s) => s.slugs);
  const hydrated = useWishlistStore((s) => s.hydrated);
  const refreshWishlist = useWishlistStore((s) => s.refresh);
  const { isAdmin } = useAuth();

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

  return (
    <>
      {bannerVisible && (
        <div className="bg-primary text-primary-foreground relative px-4 py-2 text-center text-[11px] tracking-[0.16em] uppercase">
          <span>Free swatches on every order · Complimentary design consultation</span>
          <button
            onClick={() => setBannerVisible(false)}
            className="hover:opacity-70 absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <header
        className={cn(
          "bg-background/90 sticky top-0 z-50 border-b backdrop-blur transition-colors",
          scrolled ? "border-border" : "border-transparent",
        )}
        onMouseLeave={() => setOpenMenu(null)}
        onBlurCapture={(event) => {
          // Focus moved outside the header entirely — close the mega menu for keyboard users
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpenMenu(null);
          }
        }}
      >
        <div className="container-page relative flex h-16 items-center justify-between gap-4 md:h-20">
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
                </SheetHeader>
                <div className="p-5">
                  <Link
                    href="/search"
                    className="border-border text-muted-foreground mb-6 flex items-center gap-2 rounded-sm border px-3 py-2.5 text-sm"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" /> Search curtains, shades, rooms
                  </Link>
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
                  <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-xs">
                    <Link href="/account" onClick={() => setOpen(false)} className="hover:text-foreground">Account</Link>
                    <Link href="/wishlist" onClick={() => setOpen(false)} className="hover:text-foreground">Wishlist</Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="text-accent">
                        Studio dashboard
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase md:text-2xl">
            Vingo<span className="text-accent">.</span>Roll
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
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
              className="hover:text-accent px-2 py-2 text-[12px] uppercase tracking-[0.1em] transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.12em]"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-0.5">
            <Link
              href="/search"
              aria-label="Search"
              className="hover:text-accent grid h-10 w-10 place-items-center transition-colors"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <ThemeToggle />
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hover:text-accent relative hidden h-10 w-10 place-items-center transition-colors xl:grid"
            >
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
              <CountBadge count={hydrated ? wishlist.length : 0} />
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Studio dashboard"
                title="Studio dashboard"
                className="hover:text-accent hidden h-10 items-center justify-center transition-colors sm:flex sm:w-10 xl:w-auto xl:gap-1.5 xl:px-3"
              >
                <LayoutDashboard className="h-[18px] w-[18px] xl:hidden" aria-hidden="true" />
                <span className="hidden text-[13px] uppercase tracking-[0.12em] xl:inline">Dashboard</span>
              </Link>
            )}
            <Link
              href="/account"
              aria-label="Account"
              className="hover:text-accent hidden h-10 w-10 place-items-center transition-colors sm:grid"
            >
              <User className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <CartDrawer />
          </div>
        </div>
      </header>
    </>
  );
}
