import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Design consultation",
  description: "Work with our specialists to find the perfect window treatment for your space.",
};

export default function DesignConsultationPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Design Consultation" }
      ]} />
      <PageHeader
        eyebrow="Service"
        title="Design consultation"
        description="Work with our specialists to find the perfect window treatment for your space."
      />
      <Section>
        <div className="max-w-3xl space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our design consultants help you navigate fabric choices, style options, and functional requirements to create the perfect window treatment.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Consultations are 45 minutes in our workroom studio or at your home (within Greater Los Angeles). We confirm every booking by phone within one business day.
          </p>
          <LeadForm
            leadType="consultation"
            source="design-consultation-page"
            submitLabel="Request consultation"
            messageLabel="Your project"
            messagePlaceholder="e.g. Two living-room windows, want floor-to-ceiling drapery, flexible on fabric…"
          />
        </div>
      </Section>
    </>
  );
}
