import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { services } from "@/lib/data/services";
import { Reveal } from "@/components/common/reveal";

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
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 70}>
              <Link
                href={`/services/${service.slug}`}
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
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
