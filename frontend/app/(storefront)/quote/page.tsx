import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Request a quote — Fixed-price custom quote within one business day",
  description:
    "Tell us your windows, we reply with a written quote: fabric options, mount decisions, fixed price and a production slot — within one business day.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Quote Request" }]} />
      <PageHeader
        eyebrow="Quote"
        title="Request a custom quote"
        description="Tell us about your windows — we'll come back with measurements, options and a fixed price."
      />
      <Section>
        <div className="max-w-3xl space-y-12">
          <div>
            <h2 className="text-2xl">What happens after you send this</h2>
            <ol className="text-muted-foreground mt-4 list-decimal space-y-2 ps-6 leading-relaxed">
              <li><strong>Same business day</strong> — we read your note, check the gallery context, and call or WhatsApp you to clarify rooms and mount types.</li>
              <li><strong>Within one business day</strong> — a written quote: treated options (curtain vs blind per window), fabrics, linings, hardware finish, delivery and installation, and a fixed total.</li>
              <li><strong>If you accept</strong> — free swatches dispatch same day, and we book the certified measuring visit; production starts after measurements are confirmed in writing.</li>
              <li><strong>No obligation</strong> — every quote expires after 30 days; we never hold a production slot without your go-ahead.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl">What to include for the fastest answer</h2>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li>Room(s) and approximate window count, plus ceiling height if you know it.</li>
              <li>Any obstructions: AC units, arches, corners, existing curtains, smart-home gear.</li>
              <li>Light direction (east/west matters enormously for blackout and UV fading).</li>
              <li>Style lean — sheers, blackout, dual layers, motorisation — or "you decide based on the room".</li>
              <li>Photos help enormously: two angles per window is plenty.</li>
            </ul>
          </div>

          <Faq
            title="Quote FAQ"
            items={[
              {
                question: "How fixed is a fixed quote?",
                answer:
                  "The total is fixed once measurements are confirmed. Only two things move it: a scope change you ask for (adding a window, a different fabric) or a measurement found at the visit that contradicts your self-reported ones — we call before we change anything.",
              },
              {
                question: "How much does a typical made-to-measure order cost?",
                answer:
                  "It depends honestly on fabric, width and lining — a roller blind for a bedroom sits in a very different bracket from floor-to-ceiling drapery for a double-height living room. The catalogue shows per-product indicative pricing; your quote is where the real number lands.",
              },
              {
                question: "Can you quote for just one window?",
                answer:
                  "Yes — a single window gets the same written quote, free swatches and measuring credit arrangement as a whole villa.",
              },
              {
                question: "Do quotes expire?",
                answer:
                  "Thirty days, because fabric prices and import costs move. After that we happily re-quote — usually within the hour.",
              },
            ]}
          />

          <div>
            <h2 className="text-2xl">Tell us about the project</h2>
            <div className="mt-4">
              <LeadForm
                leadType="quote"
                source="quote-page"
                submitLabel="Request quote"
                messageLabel="About your project"
                messagePlaceholder="e.g. Three windows in a west-facing living room, want full-height linen with blackout lining, ceiling is 2.7m…"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
