import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

export const metadata: Metadata = {
  title: "Guides — Measuring, Care, Shipping & Returns for Window Treatments",
  description:
    "Practical guides written by the workshop floor: measure correctly the first time, keep fabric looking new, understand made-to-order delivery, and know your return rights.",
  alternates: { canonical: "/guides" },
};

const GUIDE_LIST = [
  {
    title: "Measuring guide",
    description:
      "The five-minute read that prevents a cancelled order — inside vs outside mount, the narrowest-width rule, drop math and which tape to never use.",
    href: "/guides/measuring",
  },
  {
    title: "Care & maintenance",
    description:
      "Fortnightly dusting, annual cool-gentle washes for sheers, dry-clean-only velvets — and how UV quietly fades everything without a solar screen.",
    href: "/guides/care",
  },
  {
    title: "Shipping & lead times",
    description:
      "What a 3–4 week made-to-order timeline actually looks like, why we measure before we cut, and how delivery works across Cairo and Giza.",
    href: "/guides/shipping",
  },
  {
    title: "Returns & exchanges",
    description:
      "Made-to-order is final sale once cut — here is how the 48-hour change window works, and when ready-stock items come back within 14 days.",
    href: "/guides/returns",
  },
];

export default function GuidesPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <PageHeader
        eyebrow="Guides"
        title="Measure once, hang right, live better"
        description="Written from the workshop floor — the same advice our measurers give at your window, only longer."
      />
      <Section>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {GUIDE_LIST.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="border-border hover:border-accent group flex h-full flex-col rounded-sm border p-6 transition-colors"
            >
              <h2 className="text-xl">{guide.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {guide.description}
              </p>
              <span className="text-accent mt-4 inline-flex items-center gap-1.5 text-xs">
                Read the guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="bg-card border-border mt-12 max-w-3xl rounded-sm border p-6">
          <h2 className="text-xl">Prefer to talk to a human?</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            A two-minute call with our workshop beats forty minutes of guessing — especially for
            a first order. We answer Saturday to Thursday, 9:00–18:00, and happy to advise before
            you measure anything.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/contact" className="text-accent underline underline-offset-4">
              Contact the workshop →
            </Link>
            <Link href="/services/measuring-installation" className="text-accent underline underline-offset-4">
              Book a certified measurer →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
