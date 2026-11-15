import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Measuring guide",
  description: "How to measure for curtains, shades and blinds — width, drop and mount explained.",
};

export default function MeasuringGuidePage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: "Measuring" }
      ]} />
      <PageHeader
        eyebrow="Guides"
        title="Measuring guide"
        description="Measure once, order once — a five-minute read that saves a cancelled order."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl">1. Choose your mount</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              <strong>Inside mount</strong> sits within the window recess — a cleaner look for
              venetians, rollers and romans with tight reveals. <strong>Outside mount</strong>
              overlaps the wall — better for blackout, for shallow recesses, and for making windows
              look wider and taller.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">2. Width</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Measure the recess at three points — top, middle, bottom — and use the
              <em> narrowest</em> measurement. For outside mounts, add 10–15&nbsp;cm overlap on each
              side. For curtains, order about twice the track width for a proper ripple.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">3. Drop</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Floor length: measure from the top of the track to the floor, minus 1&nbsp;cm if you
              want a hover hem. Sill length: to just below the sill. For blackout drapes, outside
              mounts with full side overlap give the darkest result.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">4. Tools</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              A steel tape, a pencil and a level. Never a cloth tape — they stretch. Photograph the
              window with measurements written on paper and attach them to your order if anything is
              unusual.
            </p>
          </div>
          <div className="bg-card border-border rounded-sm border p-6">
            <h2 className="text-xl">Not confident?</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Our certified measurers do this every day. Book a measuring visit and we&apos;ll confirm
              every millimetre before the fabric is cut.
            </p>
            <Button asChild className="mt-4">
              <Link href="/services/measuring-installation">Book a measuring visit</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
