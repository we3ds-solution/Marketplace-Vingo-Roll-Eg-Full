import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Care guide",
  description: "How to keep curtains, shades and blinds looking their best for years.",
};

export default function CareGuidePage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: "Care" }
      ]} />
      <PageHeader
        eyebrow="Guides"
        title="Care & maintenance"
        description="Well-hung treatments, gently maintained, last for a decade or more."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl">Curtains</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Dust fortnightly with a soft brush attachment on low suction. Linen and cotton take a
              <strong> cool gentle wash</strong> every 12–18 months — or dry clean to be safe.
              Velvet and interlined drapes are <strong>dry clean only</strong>.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Blackout & thermal linings</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Wipe the lining face with a barely damp cloth — never saturate it. Avoid bleach and
              harsh solvents, which degrade the triple-weave over time.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Shades & blinds</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Vacuum cassette tops and slats with a soft brush. Fabric shades spot-clean with mild
              detergent and lukewarm water; let them dry fully lowered before raising again.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Sunlight</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Direct UV fades any fibre eventually. Rotate panels and swap sides when you clean, and
              consider solar screens for west-facing glass — they absorb the UV before your fabric ever
              sees it.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/contact">Ask about a specific fabric</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
