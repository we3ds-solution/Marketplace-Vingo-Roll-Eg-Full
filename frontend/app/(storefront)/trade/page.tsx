import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Trade program — For architects, interior designers & developers",
  description:
    "Trade pricing, reserved measuring slots, studio-grade swatch library and white-label installation for design professionals in Cairo & Giza — on your terms, your invoice.",
  alternates: { canonical: "/trade" },
};

export default function TradePage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Trade Program" }]} />
      <PageHeader
        eyebrow="For professionals"
        title="Trade program"
        description="For architects, interior designers and developers — factory-direct treatments with studio-grade service, on your timeline."
      />
      <Section>
        <div className="max-w-4xl space-y-12">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
            {[
              {
                title: "Trade pricing",
                body: "Up to 25% off retail on qualifying made-to-order treatments, tiered by annual volume. Unlisted on invoices — your client sees one studio price.",
              },
              {
                title: "Reserved slots",
                body: "Measuring and installation capacity held for partner studios, including after-hours and Friday slots when the site is otherwise quiet.",
              },
              {
                title: "Studio swatch library",
                body: "Checkout-ready swatch cases dispatched to your studio in 2–3 days, replaceable at no cost as your library wears.",
              },
              {
                title: "Dedicated measurer",
                body: "One name, one number — the same senior measurer for all your projects, fluent in handing you marked-up dimension sheets.",
              },
              {
                title: "White-label installation",
                body: "Our fitters, your branding on site paperwork. Clients never deal with anyone but you.",
              },
              {
                title: "Flexible billing",
                body: "Deposit on order, balance on installation, or 30-day terms for established studios with a purchase history.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border-border rounded-sm border p-5">
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl">Who it's for</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Interior design studios, architecture practices, property developers doing staged
              handovers, and hospitality projects. Two or more windows per project on a recurring
              basis — we onboard studios one project at a time so the relationship is proven
              before terms widen.
            </p>
          </div>

          <Faq
            title="Trade FAQ"
            items={[
              {
                question: "How do I apply?",
                answer:
                  "Send the form below with your studio name and a recent project. We confirm within one business day; first orders usually ship on trade terms after a reference check on your first project.",
              },
              {
                question: "Can my client see trade pricing?",
                answer:
                  "No. Trade pricing never appears on client-facing documents. The quote we supply you is ready to attach to your own fee proposal.",
              },
              {
                question: "Do you sign NDAs and developer procurement sheets?",
                answer:
                  "Yes — we sign standard NDAs, and we fill procurement-ready datasheets (fire ratings, fabric specs, maintenance) for developer submissions.",
              },
              {
                question: "What if a client wants to add windows mid-project?",
                answer:
                  "Scope adds are priced the same as the original order, with the same 3–4 week timeline unless the fabric is in stock — then often faster.",
              },
            ]}
          />

          <div>
            <h2 className="text-2xl">Apply for trade</h2>
            <div className="mt-4">
              <LeadForm
                leadType="consultation"
                source="trade-page"
                submitLabel="Apply for trade"
                messageLabel="About your studio"
                messagePlaceholder="e.g. Interior design studio in New Cairo, 6–10 projects a year, mostly full-home renovations…"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
