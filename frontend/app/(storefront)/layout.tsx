"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The homepage hero is immersive: it starts at y = 0 and the announcement
  // bar + header overlay it (solid again once scrolled).
  const overlay = usePathname() === "/";

  if (overlay) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <div className="relative">
          <SiteHeader overlay />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
        <SiteFooter />
        <CookieConsent />
        <ScrollToTop />
      </>
    );
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <CookieConsent />
      <ScrollToTop />
    </>
  );
}
