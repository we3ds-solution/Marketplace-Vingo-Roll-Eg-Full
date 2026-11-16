import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "Vingo Roll Studio's commitment to WCAG 2.1 Level AA — what we do, what we know is imperfect, and how to report a barrier.",
  alternates: { canonical: "/legal/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Accessibility" }]} />
      <PageHeader
        eyebrow="Legal"
        title="Accessibility statement"
        description="Everyone deserves to dress their windows — including visitors using keyboards, screen readers or reduced motion."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Last updated: 16 November 2026. Vingo Roll Studio is committed to making this website
            usable by as many people as possible, following the principles of the Web Content
            Accessibility Guidelines (WCAG) 2.1 at Level AA.
          </p>

          <div>
            <h2 className="text-2xl">1. What we do</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li>Semantic landmarks and headings throughout — skip link to main content, logical heading order, labelled regions (banner, main, contentinfo).</li>
              <li>Skip to main content for keyboard visitors and visible focus rings on every interactive control.</li>
              <li>Full keyboard operability: mega menu opens on focus, closes on Escape, dialogs trap and return focus, drawers do the same.</li>
              <li>Contrast that meets AA for body text and controls; colour is never the only signal (prices carry text, sale badges carry words).</li>
              <li>Decorative images marked aria-hidden; meaningful product and lifestyle photography carries descriptive alt text.</li>
              <li>prefers-reduced-motion respected site-wide — animations collapse to near-instant for users who ask for less motion.</li>
              <li>RTL-ready components: logical properties throughout, mirroring for Arabic interfaces when we ship localization.</li>
              <li>Forms with programmatic labels, inline validation and error messages tied to inputs.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">2. Known limitations</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              This is an actively evolving storefront. Current gaps we are working through:
            </p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li>Some product photography alt text is generated from catalogue data and is briefer than ideal; a rewrite pass is scheduled.</li>
              <li>The style finder is usable by screen readers but the question flow could be calmer — we are piloting a simplified mode.</li>
              <li>Admin-only pages are not all audited to AA; they are internal tools and are gated, but we are closing the gaps.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">3. Feedback & enforcement</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              If something on this site blocks you, tell us and we will fix it or give you an
              equivalent route (for example placing the order by phone with a measurer). Email{" "}
              <Link href="mailto:accessibility@vingoroll.com" className="text-accent underline underline-offset-2">
                accessibility@vingoroll.com
              </Link>{" "}
              with the page address and the barrier you hit — we acknowledge within 2 working days
              and aim to resolve within 30 days. If you are unsatisfied with our response you may
              escalate under Egyptian consumer-protection law.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
