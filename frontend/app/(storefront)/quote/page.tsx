import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Get a tailored quote for your window treatment project.",
};

export default function QuotePage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Quote Request" }]} />
      <PageHeader
        eyebrow="Quote"
        title="Request a custom quote"
        description="Tell us about your windows — we'll come back with measurements, options and a fixed price."
      />
      <Section>
        <LeadForm
          leadType="quote"
          source="quote-page"
          submitLabel="Request quote"
          messageLabel="About your project"
          messagePlaceholder="e.g. Three windows in a west-facing living room, want full-height linen with blackout lining, ceiling is 2.7m…"
        />
      </Section>
    </>
  );
}
