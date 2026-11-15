"use client";

import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { LeadForm } from "@/components/leads/lead-form";

export default function ContactPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <PageHeader
        eyebrow="Contact"
        title="Talk to a specialist"
        description="Measuring questions, fabric advice or an existing order — we answer within one business day."
      />
      <Section>
        <LeadForm
          leadType="contact"
          source="contact-page"
          messagePlaceholder="e.g. I'm looking at blackout options for a street-facing bedroom…"
        />
      </Section>
    </>
  );
}
