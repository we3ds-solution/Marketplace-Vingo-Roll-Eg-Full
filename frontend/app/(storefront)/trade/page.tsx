import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Trade program",
  description: "Special pricing and support for designers, architects, and contractors.",
};

export default function TradePage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Trade Program" }]} />
      <PageHeader
        eyebrow="For professionals"
        title="Trade program"
        description="Special pricing and support for designers, architects, and contractors."
      />
      <Section>
        <div className="max-w-3xl space-y-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Trade pricing",
                body: "Up to 25% off retail on qualifying made-to-order treatments.",
              },
              {
                title: "Priority scheduling",
                body: "Measurers and installers reserved for studio partners.",
              },
              {
                title: "Sample library",
                body: "Checkout-ready swatch kits shipped to your studio in 2–3 days.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border-border rounded-sm border p-5">
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <LeadForm
            leadType="consultation"
            source="trade-page"
            submitLabel="Apply for trade"
            messageLabel="About your studio"
            messagePlaceholder="e.g. Interior design studio in Los Angeles, 6–10 projects a year, mostly full-home…"
          />
        </div>
      </Section>
    </>
  );
}
