import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Story — From a 1998 Workshop to Cairo's Made-to-Measure Studio",
  description:
    "Twenty-five years of made-to-measure curtains, shades and blinds in Egypt: from a single sewing machine in 1998 to a full New Cairo workshop with in-house measurers and installers.",
  alternates: { canonical: "/about/our-story" },
};

const MILESTONES: Array<{ year: string; title: string; body: string }> = [
  {
    year: "1998",
    title: "One machine, one room",
    body: "The studio opens in a single room in Heliopolis with one industrial sewing machine. Orders are few; word of mouth does the rest — sheers for neighbours, blackout for doctors and engineers who travel too much to sleep past dawn.",
  },
  {
    year: "2004",
    title: "The measuring problem",
    body: "We stop selling fabric and start selling fit. Our first certified measurers hit the road with steel tapes and carbon ledger sheets. Returns from bad measurements fall to nearly zero — and neighbours start calling us instead of a shop.",
  },
  {
    year: "2011",
    title: "Roller shades join the workshop",
    body: "Imported roller mechanisms arrive and we build our first blackout cassette shades. Orders from new compounds in New Cairo and 6th of October grow with every tower handover — balconies, west-facing bedrooms, home offices.",
  },
  {
    year: "2016",
    title: "Blackout, properly",
    body: "We move from standard lining to triple-weave blackout and thermal-coated backings — essential for Egyptian summers, where bedroom light starts before dawn in summer and afternoons hit 40 °C behind glass.",
  },
  {
    year: "2019",
    title: "Motorization & smart tracks",
    body: "First motorised track installations — sunrise schedules for nursery curtains become a standard request. App, wall switch and voice control arrive, and the workshop gains its hardware bench.",
  },
  {
    year: "2023",
    title: "New Cairo workshop",
    body: "The studio consolidates into 27 Road 90, 5th Settlement — cutting room, sewing floor, hardware bench and a customer showroom with live shade and blind samples you can operate.",
  },
  {
    year: "2026",
    title: "12,000 windows and counting",
    body: "Today we measure, make and fit across Cairo and Giza — and ship made-to-measure orders nationwide. Same promise as 1998: the fabric is cut once, for one window, and it fits.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Our Story" },
        ]}
      />
      <PageHeader
        eyebrow="Our story"
        title="From one sewing machine to 12,000 fitted windows"
        description="How a single-room Heliopolis workshop became the made-to-measure window treatment studio trusted across Cairo and Giza."
      />
      <Section>
        <div className="max-w-3xl">
          <p className="text-muted-foreground text-lg leading-relaxed">
            This is not a story about furniture. It is about the five centimetres where a
            curtain meets a wall — the detail every off-the-shelf seller ignores and the one
            everyone remembers when it is wrong. Vingo Roll has been getting that detail right
            since 1998, one measured window at a time.
          </p>

          <ol className="mt-12 space-y-0">
            {MILESTONES.map((m, i) => (
              <li key={m.year} className="border-border relative flex gap-6 border-s pb-10 ps-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="bg-accent absolute top-1.5 -start-[7px] h-3.5 w-3.5 rounded-full"
                />
                <div>
                  <p className="text-accent font-display text-xs tracking-[0.2em] uppercase">
                    {m.year}
                  </p>
                  <h2 className="mt-1 text-xl">{m.title}</h2>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="bg-card border-border mt-12 rounded-sm border p-6">
            <h2 className="text-xl">What hasn&apos;t changed</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              We still measure every window ourselves. We still cut and sew in our own workshop.
              We still stand behind five years of hardware. And we still believe a window is
              dressed for the person who lives behind it — not for a showroom catalogue.
            </p>
            <Button asChild className="mt-5">
              <Link href="/about">About the studio today</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
