import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Measuring & installation",
  description: "Professional measuring and installation services for perfect results.",
};

export default function MeasuringInstallationPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Measuring & Installation" }
      ]} />
      <PageHeader
        eyebrow="Service"
        title="Measuring & installation"
        description="Professional measuring and installation services for perfect results."
      />
      <Section>
        <div className="max-w-3xl space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our team provides accurate measuring and expert installation to ensure your window treatments fit perfectly and function flawlessly.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Book a certified measurer directly — visits are scheduled within 3–5 business days and installation happens once your treatments are ready.
          </p>
          <LeadForm
            leadType="consultation"
            source="measuring-installation-page"
            submitLabel="Book a visit"
            messageLabel="Your windows"
            messagePlaceholder="e.g. 4 windows in the primary bedroom, one tricky bay — approx 2.4m wide…"
          />
        </div>
      </Section>
    </>
  );
}
