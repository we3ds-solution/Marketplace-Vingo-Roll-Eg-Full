import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Vingo Roll Studio — Made-to-Measure Window Treatment Workshop in Cairo",
  description:
    "Family-owned made-to-measure window treatment workshop in New Cairo since 1998. Curtains, shades and blinds cut for your windows — free swatches, certified measuring and in-house installation across Cairo & Giza.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <PageHeader
        eyebrow="About the studio"
        title="Made to measure, since 1998"
        description="A family workshop in New Cairo where every curtain, shade and blind is cut, sewn and fitted for exactly one window — yours."
      />

      <Section>
        <div className="max-w-3xl space-y-12">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Vingo Roll Studio is a family-owned workshop specialised in custom window
            treatments. For more than two decades we have made curtains, roller shades, roman
            blinds, venetian and vertical blinds, and motorized tracks — each one cut to the
            millimetre in our own workshop and installed by our own team, never a subcontractor.
          </p>

          <div>
            <h2 className="text-2xl">What we do, end to end</h2>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li><strong>Free fabric swatches</strong> — take home the actual fabric, not a photo of it. See it in your light, against your walls, before you commit.</li>
              <li><strong>Design consultation</strong> — we match treatment type, fabric, lining and hardware to the room: how the light falls through the day, the exposure, the view, the furniture.</li>
              <li><strong>Certified measuring</strong> — inside mount or outside mount, recess tolerance, track height, stacking space. We measure the window, not the estimate of it.</li>
              <li><strong>In-house production</strong> — cutting, sewing, hemming and hardware fitting all happen under one roof, which is how we keep a 3–4 week made-to-order timeline.</li>
              <li><strong>Installation & aftercare</strong> — track plumbing, shade levelling, child-safe cords where needed, and a 5-year hardware warranty.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">Why a workshop, not a catalogue</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Ready-made treatments assume every window is the same width and every wall is
              plumb. Cairo&apos;s apartments and villas are anything but — recesses drift, sills
              slant, and ceilings in older buildings often differ by centimeters from one wall to
              the next. Made-to-measure exists precisely for this: fabric gathered to your exact
              width, a drop that hovers 1 cm above your marble floor, blackout linings that
              actually seal against a west-facing bedroom glare.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              It also protects your budget. One measured order, cut once and hung right, is
              cheaper than two generic ones that never quite fit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">Materials we trust</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Imported woven blackout and dim-out linings, Egyptian cotton sheers, solution-dyed
              acrylics for sun-blasted west facades, wool-blend velvets for formal rooms, and
              technical sun-screen meshes rated for UV rejection. Hardware is aluminium and
              powder-coated steel — not plated plastic — which is what the 5-year warranty is
              actually worth.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">Where we work</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Measuring and installation across Cairo and Giza — New Cairo, 5th Settlement,
              Heliopolis, Maadi, Zamalek, Sheikh Zayed and 6th of October. Outside these areas we
              ship made-to-measure treatments nationwide with detailed installation templates, and
              our measurers can travel for whole-villa projects on request.
            </p>
          </div>

          <div className="bg-card border-border rounded-sm border p-6">
            <h2 className="text-xl">The workshop in numbers</h2>
            <dl className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["1998", "Founded"],
                ["12,000+", "Windows fitted"],
                ["5-yr", "Hardware warranty"],
                ["3–4 wks", "Made-to-order"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="font-display text-accent block text-2xl">{n}</span>
                    <span className="text-muted-foreground text-xs">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/about/our-story">Read our story</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/services/measuring-installation">Book a measuring visit</Link>
            </Button>
          </div>

          <Faq
            items={[
              {
                question: "How long does a made-to-measure order take?",
                answer:
                  "Most orders leave the workshop in 3–4 weeks from the moment measurements are confirmed and the deposit is in. Fitting appointments are scheduled within the same week as delivery in Cairo and Giza.",
              },
              {
                question: "Can I see the fabric before I order?",
                answer:
                  "Yes — free fabric swatches are sent for every order. Pick up to five swatches; they are yours to keep and compare at home, in daylight and under your own lighting.",
              },
              {
                question: "Do you install in Giza and New Cairo?",
                answer:
                  "Yes. Our own installation team covers Cairo and Giza — New Cairo, 5th Settlement, Heliopolis, Maadi, Zamalek, Sheikh Zayed and 6th of October. Whole-villa projects outside these areas can be scheduled on request.",
              },
              {
                question: "What warranty comes with made-to-measure treatments?",
                answer:
                  "Five years on hardware — tracks, mechanisms, brackets — and repair or replace for any workmanship fault found at installation or within the first year of use.",
              },
              {
                question: "Can I order fabric only, without installation?",
                answer:
                  "Yes. Installation is recommended but optional. Every order ships with an installation template, a drilling guide and our measurement confirmation sheet.",
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
