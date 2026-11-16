import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Vingo Roll Studio collects, uses, stores and protects your personal data — including your rights under Egypt's Personal Data Protection Law No. 151 of 2020.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What we collect, why we collect it, how long we keep it — and the rights you have over it."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Last updated: 16 November 2026. This policy explains how Vingo Roll Studio
            ("Vingo Roll", "we", "our") handles personal data when you browse the site, order
            made-to-measure treatments, book measuring or installation, subscribe to the journal,
            or contact us. We process personal data in accordance with the Egyptian Personal Data
            Protection Law No. 151 of 2020 ("PDPL"), its executive regulations, and the Egyptian
            Consumer Protection Law No. 67 of 2006 where applicable.
          </p>

          <div>
            <h2 className="text-2xl">1. Who is responsible for your data</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              The data controller is Vingo Roll Studio, 27 Road 90, 5th Settlement, New Cairo,
              Cairo Governorate, Egypt. Data protection enquiries and rights requests go to{" "}
              <Link href="mailto:privacy@vingoroll.com" className="text-accent underline underline-offset-2">
                privacy@vingoroll.com
              </Link>
              . If we use a processor for a specific activity, that processor processes data only
              on our documented instructions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">2. What we collect</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li><strong>Account & identity</strong> — name, email, password (hashed, never stored in plain text), phone number if you provide it, and role (customer, vendor applicant, admin).</li>
              <li><strong>Orders & measurements</strong> — window widths/drops, mount preferences, fabric and lining selections, delivery address, installation notes, and any photos of the room you attach to an order.</li>
              <li><strong>Measurement visits</strong> — appointment time, address, access notes, and the confirmed dimension sheet our measurer records on site.</li>
              <li><strong>Leads & enquiries</strong> — the details you send through the consultation form, the quote form or WhatsApp, including your preferred contact times.</li>
              <li><strong>Newsletter</strong> — your email address and engagement signals (opens/clicks) if you subscribe to the Journal; unsubscribe works in one click and is honoured for existing lists too.</li>
              <li><strong>Device & usage</strong> — cookie/consent preferences, pages viewed, approximate location derived from IP for delivery-zone checks, and crash diagnostics.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">3. Why we use it, and on what legal basis</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li><strong>Contract performance</strong> (PDPL Art. 6) — to quote, produce, deliver, install and invoice your made-to-measure order.</li>
              <li><strong>Legitimate interest</strong> — fraud prevention, quality control at installation, after-care and warranty handling, and site security.</li>
              <li><strong>Consent</strong> — marketing emails you opt into, and non-essential cookies. Withdrawing consent never affects orders already in production.</li>
              <li><strong>Legal obligation</strong> — tax invoices, accounting records and responding to lawful requests from competent Egyptian authorities.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">4. Who we share it with</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              We do not sell personal data. We share it only with: delivery and installation
              partners bound by confidentiality terms; payment processors licensed in Egypt for
              transactions you choose to complete online; hosting and email providers under
              data-processing agreements; and authorities when the law requires it. Aggregated,
              non-identifying statistics may be published (for example average production time).
            </p>
          </div>

          <div>
            <h2 className="text-2xl">5. How long we keep it</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-2 ps-6 leading-relaxed">
              <li>Order and warranty records — 5 years after delivery (hardware warranty horizon).</li>
              <li>Invoices and accounting — the statutory retention period under Egyptian tax law.</li>
              <li>Marketing subscriptions — until you unsubscribe.</li>
              <li>Room photos you attach — deleted on request, or 24 months after the order is delivered, whichever comes first.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">6. Security</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Passwords are hashed with industry-standard algorithms. Sessions use short-lived
              access tokens held in memory and rotating refresh tokens in HttpOnly, Secure
              cookies — they are never readable by page scripts. Access to production data is
              role-scoped, logged, and reviewed. We test our installation and order pipeline
              regularly; no internet transmission is ever fully risk-free, and we say so plainly
              rather than pretend otherwise.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">7. Your rights under the PDPL</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              You have the right to access your data, correct it, erase it, restrict or object to
              processing, and receive a machine-readable copy. To exercise any of these rights,
              email <Link href="mailto:privacy@vingoroll.com" className="text-accent underline underline-offset-2">privacy@vingoroll.com</Link> from the
              address on the account, or write to the postal address above. We respond within 30
              days. If you are not satisfied with our response, you may escalate to the Egyptian
              Personal Data Protection Centre.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">8. International transfers & changes</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Where providers process data outside Egypt (for example global email delivery), we
              rely on contractual safeguards or adequacy decisions. We update this policy when our
              practices change and note the revision date at the top; material changes are
              announced on the site and, where appropriate, by email.
            </p>
          </div>

          <p className="border-border text-muted-foreground border-t pt-6 text-xs leading-relaxed">
            This policy is written for the demonstration storefront. Before production use by a
            real business it should be reviewed by Egyptian counsel. Demonstration data is
            illustrative and not a substitute for legal advice.
          </p>
        </div>
      </Section>
    </>
  );
}
