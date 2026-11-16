import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { services } from "@/lib/data/services";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = {
  title: "Services — Design Consultation, Measuring & Installation in Cairo",
  description:
    "Design consultations, certified measuring and professional installation across Cairo & Giza — plus free fabric swatches before you commit.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      <PageHeader
        eyebrow="Services"
        title="Professional support"
        description="From design consultation to installation, we handle the difficult parts — so the result fits the first time."
      />
      <Section>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 70}>
              <Link
                href={service.href ?? `/services/${service.slug}`}
                className="group border-border bg-card/60 block h-full rounded-sm border p-6 transition-colors hover:border-accent"
              >
                <p className="eyebrow">{service.price}</p>
                <h2 className="font-display mt-3 text-2xl">{service.name}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {service.summary}
                </p>
                <ul className="text-muted-foreground mt-4 space-y-1.5 text-sm">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span className="text-accent" aria-hidden="true">
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
                <span className="text-accent mt-5 inline-flex items-center gap-2 text-sm">
                  Learn more
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 max-w-3xl">
          <h2 className="font-display text-2xl">How a Vingo Roll order flows</h2>
          <ol className="text-muted-foreground mt-4 list-decimal space-y-2 ps-6 leading-relaxed">
            <li><strong>Free swatches</strong> — try the fabric in your light, against your walls.</li>
            <li><strong>Design consultation</strong> — treatment type, fabric, lining and hardware per room, in writing.</li>
            <li><strong>Certified measuring</strong> — a technician measures every window and confirms mount type before production.</li>
            <li><strong>Production</strong> — cut, sewn and hardware-fitted in our New Cairo workshop, typically 3–4 weeks.</li>
            <li><strong>Installation</strong> — tracks, brackets and motors fitted, levelled, tested and cleaned up.</li>
            <li><strong>Aftercare</strong> — 5-year hardware warranty, one phone call away.</li>
          </ol>

          <Faq
            title="Services FAQ"
            items={[
              {
                question: "Is the design consultation really free?",
                answer:
                  "Yes — in-home, video or showroom. You get a written recommendation and indicative pricing regardless of whether you order; no obligation, no follow-up calls.",
              },
              {
                question: "Can I skip measuring and give you my own dimensions?",
                answer:
                  "Yes. Most remakes come from tape-stretch or wrong-recess measurements, which is why certified measuring is credited back into your order. Either route is fine — the quote tells you which costs less.",
              },
              {
                question: "Who installs my treatments?",
                answer:
                  "Our own installation team — never subcontractors. The same standard you see in the showroom happens at your wall: level tracks, plumb brackets, paired motors and no packaging left behind.",
              },
              {
                question: "Do you work in New Cairo and 6th of October?",
                answer:
                  "Yes — the core service area covers New Cairo, 5th Settlement, Heliopolis, Maadi, Zamalek, Sheikh Zayed and 6th of October. Beyond that, nationwide shipping with installation templates.",
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
