import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Every cookie and browser-storage item used on the Vingo Roll site — what it stores, how long it lives, and how to change your consent at any time.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]} />
      <PageHeader
        eyebrow="Legal"
        title="Cookie policy"
        description="The exact list of cookies and browser storage this site sets — and how to change your mind."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Last updated: 16 November 2026. This policy describes the small number of cookies and
            browser-storage entries used on this site. We do not use advertising or remarketing
            pixels today; if that changes, this page and the consent banner will be updated
            before the pixels go live.
          </p>

          <div>
            <h2 className="text-2xl">1. Essential — always on</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Required for sign-in to work and for your cart and wishlist to survive a page
              refresh. Set only when you log in or add items to your bag; you cannot opt out of
              these and still use the basket.
            </p>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li><strong>vingo_refresh</strong> — HttpOnly, SameSite=Lax, path-scoped to the auth endpoints. Holds the rotating refresh token; rotated on every refresh, deleted on logout.</li>
              <li><strong>vingo_session</strong> — HttpOnly, SameSite=Lax, 90 days. An anonymous session identifier that keys your guest cart and wishlist; replaced by account ownership on sign-in.</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Access tokens are held in memory only and disappear on logout — they are never
              written to cookies or localStorage by this site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">2. Preferences — with your consent</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Remember how you like the site to behave. You can disable these from the banner
              below or from the footer&apos;s "Cookie preferences" link at any time.
            </p>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li><strong>vingo_consent</strong> — your cookie decision (choice, categories, timestamp). 12 months.</li>
              <li><strong>Theme</strong> — light/dark/system preference, stored in localStorage by the theme provider. Persists until you clear it.</li>
              <li><strong>Recent searches & admin sidebar state</strong> — localStorage on this device only; never transmitted.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">3. Marketing — optional, none set yet</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              We do not currently set marketing, attribution or social-media pixels. If we add
              them later (for example to measure a campaign), they will load only after you press
              "Accept all", and this page will list each provider and its retention period.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">4. Managing your consent</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              The consent banner appears 5 seconds after your first visit. To change your choice
              afterwards, press <strong>Cookie preferences</strong> at the very bottom of any page
              (in the footer) — the banner re-opens and you can switch between Accept all,
              Essential only, and Customize.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              You can also clear cookies for this site in your browser at any time. Blocking
              essential cookies will break sign-in, cart and wishlist.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">5. Changes to this policy</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              We revise this page whenever the storage we set changes for a real reason — a new
              feature or a new processor — and update the date at the top. Material changes are
              announced in the newsletter and on the site before they take effect.
            </p>
          </div>

          <p className="border-border text-muted-foreground border-t pt-6 text-xs leading-relaxed">
            Written for the demonstration storefront — see the{" "}
            <Link href="/legal/privacy" className="text-accent underline underline-offset-2">
              Privacy policy
            </Link>{" "}
            for how cookies feed into your overall data rights under the Egyptian PDPL.
          </p>
        </div>
      </Section>
    </>
  );
}
