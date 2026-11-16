import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Design consultation — Free in-home, video or showroom advice",
  description:
    "A 45-minute consultation with our window treatment designers: fabric direction, lining and hardware per room, written up with indicative pricing. Free, no obligation, anywhere in Cairo & Giza.",
  alternates: { canonical: "/services/design-consultation" },
};

export default function DesignConsultationPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Design Consultation" }
      ]} />
      <PageHeader
        eyebrow="Service · Complimentary"
        title="Design consultation"
        description="Forty-five minutes with a specialist who understands light, privacy and fabric — before you spend a pound."
      />
      <Section>
        <div className="max-w-3xl space-y-12">
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg leading-relaxed">
              A consultation is how a fabric catalogue becomes <em>your</em> answer. Bring photos,
              bring Pinterest boards, bring the children — we work with the whole picture: how
              the sun enters each room, what you actually want to see (and not see) from the
              street, where the air-conditioning blows, what your furniture already says.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Consultations run 45 minutes, in your home (Cairo & Giza), by video call, or at our
              New Cairo showroom with live working samples on the wall. Every booking is confirmed
              by phone within one business day.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">What you walk away with</h2>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li>A written recommendation per room: treatment type, fabric, lining, hardware finish.</li>
              <li>Indicative pricing per window and a whole-home total — no pressure either way.</li>
              <li>Mount decision explained (inside vs outside mount) for each window.</li>
              <li>A shortlist of swatches we will deliver free to your door afterwards.</li>
              <li>For motorised rooms: a wiring and power plan that your electrician can act on.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">Rooms we know well</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              West-facing master bedrooms that need real blackout at 6 a.m. in July; street-level
              living rooms that need daylight without sightlines; home offices that fight screen
              glare every afternoon; nurseries where motorised curtains on a sunrise schedule are
              not a luxury but a parenting strategy.
            </p>
          </div>

          <Faq
            title="Consultation FAQ"
            items={[
              {
                question: "Is the consultation really free?",
                answer:
                  "Yes — in-home, video or showroom, no fee, and no obligation to order. The written recommendation and indicative quote are yours to keep whether or not you proceed.",
              },
              {
                question: "How far in advance should I book?",
                answer:
                  "Two to three days is typical. Whole-home consultations before a renovation or a move can be scheduled further out — mention the date when you enquire.",
              },
              {
                question: "Can you consult on just one room?",
                answer:
                  "Absolutely. One bedroom is a complete consultation. Bring the room's constraints and we will design to them, nothing more.",
              },
              {
                question: "Do you consult for commercial projects?",
                answer:
                  "Yes — clinics, salons, showrooms and developer handovers. See the trade programme for commercial pricing and dedicated project handling.",
              },
            ]}
          />

          <div>
            <h2 className="text-2xl">Request your consultation</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              We confirm every request personally by phone within one business day.
            </p>
            <div className="mt-4">
              <LeadForm
                leadType="consultation"
                source="design-consultation-page"
                submitLabel="Request consultation"
                messageLabel="Your project"
                messagePlaceholder="e.g. Two living-room windows, want floor-to-ceiling drapery, flexible on fabric…"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
