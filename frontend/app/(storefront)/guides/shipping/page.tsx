import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shipping & lead times — 3–4 weeks, measured before cut",
  description:
    "How made-to-order shipping works in Cairo & Giza: production timeline, delivery with our own install team, nationwide shipping, tracking and costs.",
  alternates: { canonical: "/guides/shipping" },
};

export default function ShippingGuidePage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: "Shipping" }
      ]} />
      <PageHeader
        eyebrow="Guides"
        title="Shipping & lead times"
        description="Made-to-order means cut for you, checked by hand, then travelled across town by our own team."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl">Lead times</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Made-to-order pieces leave our New Cairo workshop in <strong>3–4 weeks</strong> from
              written measurement confirmation — not from checkout. In-stock hardware and
              ready-to-hang lines ship in 2–3 business days. Motorised shades add about a week for
              motor commissioning and pairing.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Delivery in Cairo & Giza</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Inside our service area (New Cairo, 5th Settlement, Heliopolis, Maadi, Zamalek,
              Mohandessin, Dokki, 6th of October, Sheikh Zayed) your order is delivered and
              installed by our own team — no courier handover, no install lottery. We come with
              the fitting crew, hang everything, test motors, and take the packaging with us.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Shipping elsewhere in Egypt</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Governorates outside Cairo and Giza get the same made-to-measure product shipped
              tracked with a full installation template, fixings pack and measurement confirmation
              sheet, with phone and WhatsApp support during your fit. Whole-villa projects get a
              scheduled measurer visit and a fitting crew if the scope justifies it — ask.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Delivery & installation cost</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Delivery inside Cairo and Giza is included in your installation quote. Nationwide
              shipments are quoted per governorate and weight — rollers ship flat, drapes ship
              boxed, motorised systems ship with the motors commissioned first. Installation price
              is per window on your quote, never a surprise at the door.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Tracking & communication</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              You get three updates you can act on: when production starts (after measurement
              sign-off), when it leaves the workshop, and a call before delivery day to confirm
              the room is clear and someone is home. If anything slips — imported fabric,
              custom-coated hardware — we tell you early, not at the deadline.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/contact">Questions about your order?</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
