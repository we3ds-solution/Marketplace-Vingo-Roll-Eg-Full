import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Measuring & installation — Certified measurers, in-house fitters",
  description:
    "Every window measured at three points, recess tolerance checked, mount confirmed — then installed by our own team. Measuring fee credited to your order. Cairo & Giza.",
  alternates: { canonical: "/services/measuring-installation" },
};

export default function MeasuringInstallationPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Measuring & Installation" }
      ]} />
      <PageHeader
        eyebrow="Service"
        title="Measuring & installation"
        description="Miss a millimetre and a made-to-measure blind is a curtain. We don't."
      />
      <Section>
        <div className="max-w-3xl space-y-12">
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our certified measurers treat your window like a tailor treats a shoulder — three
              measurements across the width, three down the height, recess depth, sill projection,
              handle clearance, and the sag of a 2.4-metre span under load. Only what the tape
              says makes the order sheet.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Visits are scheduled within 3 working days (often next day in New Cairo). The fee is
              credited back to your order when you proceed, and the measurement confirmation sheet
              is signed by you before anything is cut.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">What happens during the measuring visit</h2>
            <ol className="text-muted-foreground mt-4 list-decimal space-y-2 ps-6 leading-relaxed">
              <li>Photo survey of every window with measurements written on paper, attached to your order.</li>
              <li>Inside vs outside mount decided per window — blackout favours outside mounts with full overlap.</li>
              <li>Obstructions noted: AC units, arches, corners, exposed cables, smart-home hubs.</li>
              <li>Substrate check for mounting — masonry, gypsum, timber, or aluminium composite, because brackets behave differently on each.</li>
              <li>Track height and stacking advice so panels actually clear the glass when open.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl">What installation includes</h2>
            <ul className="text-muted-foreground mt-4 list-disc space-y-2 ps-6 leading-relaxed">
              <li>Brackets and tracks mounted to the correct substrate, levelled and plumb.</li>
              <li>Fabric hung, hems checked, blackout linings sealed against side glare.</li>
              <li>Motorised shades paired to remotes/apps/wall switches, scenes and sunrise schedules configured with you.</li>
              <li>Child-safety cord cleats installed where blinds are in reach of children.</li>
              <li>All packaging removed and recycled; a final walk-through with you before we leave.</li>
            </ul>
          </div>

          <Faq
            title="Measuring & installation FAQ"
            items={[
              {
                question: "What does the measuring visit cost?",
                answer:
                  "A flat visit fee per address, credited back in full when your order proceeds — so the measuring is effectively free with any made-to-measure purchase. Ask for the current rate when booking.",
              },
              {
                question: "Can you measure after I've ordered online?",
                answer:
                  "Yes — order first, measure within days, and we hold production until the signed measurement confirmation sheet comes back. Nothing is cut before it.",
              },
              {
                question: "Do you install motorised shades and pair them to my phone?",
                answer:
                  "Yes. Our fitters pair motors to remotes, wall switches, and Matter/Zigbee-compatible apps where your devices support them — see the Smart Home page for the protocols we support.",
              },
              {
                question: "What if the window is unreachable or unusual — a ramp, a stairwell, a skylight?",
                answer:
                  "Tell us on booking. We bring ladders, extendable poles and a second fitter for awkward drops; skylight and clerestory work is quoted per case and is always measured first.",
              },
            ]}
          />

          <div>
            <h2 className="text-2xl">Book a measuring visit</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              We confirm every booking personally by phone within one business day.
            </p>
            <div className="mt-4">
              <LeadForm
                leadType="consultation"
                source="measuring-installation-page"
                submitLabel="Book a visit"
                messageLabel="Your windows"
                messagePlaceholder="e.g. 4 windows in the primary bedroom, one tricky bay — approx 2.4m wide…"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
