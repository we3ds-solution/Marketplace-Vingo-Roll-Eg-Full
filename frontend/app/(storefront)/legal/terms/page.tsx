import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Terms and conditions for shopping with Vingo Roll Studio — made-to-order rules, measuring responsibility, delivery, payment, warranty and Egyptian governing law.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        description="The rules of the road for orders, made-to-measure goods, delivery, installation and warranty."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Last updated: 16 November 2026. By using this site or placing an order you agree to
            these terms. If anything here is unclear, contact us before ordering — we would
            rather explain a clause than litigate one.
          </p>

          <div>
            <h2 className="text-2xl">1. The service</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Vingo Roll Studio is a made-to-measure window treatment workshop offering curtains,
              roller/roman/pleated/venetian/vertical blinds, sheers, blackout linings, tracks and
              motorized smart-home integration, sold online and in our New Cairo showroom. The
              storefront catalogue is indicative; confirmed dimensions, fabrics and prices are
              those stated in your written order confirmation or quote.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">2. Accounts & orders</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li>You must provide accurate contact and delivery details; we are not liable for deliveries that fail because details were wrong.</li>
              <li>An order is binding once you confirm the specification and pay the required deposit. Custom-made goods are excluded from the 14-day change-of-mind return right under the Egyptian Consumer Protection Law No. 67 of 2006 — as permitted for bespoke products.</li>
              <li>Discretionary accounts and corporate/trade customers receive separate written terms.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">3. Measurement responsibility</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              You may supply measurements yourself or book our certified measuring visit. If you
              supply measurements, you confirm they were taken with a steel tape, at three points
              across the width, and in centimetres — our order confirmation sheet records these.
              Remakes caused by inaccurate customer measurements are chargeable; remakes caused by
              our measuring error are always on us, including labour.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">4. Production, delivery & installation</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Standard made-to-order timeline is 3–4 weeks from measurement confirmation and
              deposit. Delivery in Cairo and Giza is by our own team with installation; other
              governorates ship with an installation template. Installation appointments are
              confirmed by phone or WhatsApp within the week of delivery. If an installation
              appointment fails due to site unpreparedness (no access, no fixing substrate, no
              power for motorized fitting), we may reschedule with a call-out fee.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">5. Payment</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Payment methods are shown at checkout (bank transfer, card via licensed Egyptian
              payment processors, and cash on delivery where offered). Made-to-order goods
              require a deposit before cutting begins; the balance is due on delivery or
              installation. Prices are in USD on this storefront and may fluctuate between
              confirmation and invoice for imports; any change over 5% will be notified before
              production.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">6. Changes, cancellation & returns</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Contact us within <strong>48 hours of ordering</strong> and we will usually pause or
              re-cut before production starts — fabric, width, drop and lining can all be swapped
              at that stage. After cutting, made-to-order goods are final sale. Ready-stock items
              can be returned within 14 days of delivery unused and in original packaging;
              shipping is non-refundable. Damage or faults on arrival are repaired, replaced or
              refunded at our option, with freight covered both ways — see the{" "}
              <Link href="/guides/returns" className="text-accent underline underline-offset-2">
                Returns guide
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl">7. Warranty & liability</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Five years on tracks, brackets and mechanisms. Fabric is covered for manufacturing
              defects at delivery or within 12 months of installation. Warranty excludes misuse,
              unauthorised modification, sun damage beyond normal fading, and cleaning damage from
              harsh solvents. To the fullest extent permitted by Egyptian law, our aggregate
              liability for any claim is limited to the amount paid for the affected order.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">8. Intellectual property & site use</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Content, photography and design on this site belong to Vingo Roll Studio. You may
              not scrape, republish or commercially reuse it without written permission. You may
              not use the site to transmit unlawful content, probe its security, or impersonate
              the studio or other customers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">9. Governing law & disputes</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              These terms are governed by the laws of the Arab Republic of Egypt. Any dispute is
              subject to the exclusive jurisdiction of the competent courts of Cairo, without
              prejudice to consumer-protection rights granted by Egyptian law. If a clause is
              found unenforceable, the remainder stands.
            </p>
          </div>

          <p className="border-border text-muted-foreground border-t pt-6 text-xs leading-relaxed">
            These terms are written for the demonstration storefront and should be reviewed by
            Egyptian counsel before production use. Nothing here limits rights guaranteed to
            consumers by Egyptian law.
          </p>
        </div>
      </Section>
    </>
  );
}
