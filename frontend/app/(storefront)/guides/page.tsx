import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

const guides = [
  {
    title: "Measuring Guide",
    description: "How to measure your windows accurately for made-to-measure treatments",
    href: "/guides/measuring",
  },
  {
    title: "Care & Maintenance",
    description: "Keep your window treatments looking their best",
    href: "/guides/care",
  },
  {
    title: "Shipping Information",
    description: "Delivery times, tracking, and shipping costs",
    href: "/guides/shipping",
  },
  {
    title: "Returns & Exchanges",
    description: "Our return policy and how to request an exchange",
    href: "/guides/returns",
  },
];

export default function GuidesPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <PageHeader
        eyebrow="Help"
        title="Guides & resources"
        description="Everything you need to know about ordering, measuring, and caring for your window treatments."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="border-border hover:border-accent group block rounded-sm border p-6 transition-colors"
            >
              <h2 className="text-xl">{guide.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
