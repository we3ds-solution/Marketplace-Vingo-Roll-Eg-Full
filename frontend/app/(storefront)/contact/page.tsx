import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Faq } from "@/components/common/faq";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock3, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Studio, Measuring Visits & WhatsApp",
  description:
    "Visit the Vingo Roll Studio showroom in New Cairo, book a certified measuring visit, or reach us on WhatsApp and phone — Saturday to Thursday, 9:00–18:00.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <PageHeader
        eyebrow="Contact"
        title="Visit, call or message us"
        description="A real workshop with a real phone line — not a contact form that vanishes into a shared inbox."
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl">The studio</h2>
            <ul className="text-muted-foreground mt-5 space-y-4 text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="text-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  27 Road 90, 5th Settlement,<br />
                  New Cairo, Cairo Governorate, Egypt<br />
                  <span className="text-foreground">Showroom & workshop — bring your measurements, leave with a quote.</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <Link href="tel:+20224186090" className="hover:text-foreground">+20 2 2418 6090</Link>
                  <br />
                  <Link href="https://wa.me/201001234567" className="hover:text-foreground">WhatsApp: +20 100 123 4567</Link>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <Link href="mailto:hello@vingoroll.com" className="hover:text-foreground">hello@vingoroll.com</Link>
              </li>
              <li className="flex items-start gap-3">
                <Clock3 className="text-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  Saturday–Thursday, 9:00–18:00<br />
                  Friday: closed (workshop runs, phones monitored)
                </span>
              </li>
            </ul>

            <div className="bg-card border-border mt-8 rounded-sm border p-5">
              <h2 className="font-sans text-sm font-semibold">Service areas for measuring & installation</h2>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                New Cairo · 5th Settlement · Heliopolis · Maadi · Zamalek · Dokki · Mohandessin ·
                6th of October · Sheikh Zayed · Nasr City. Outside these areas we ship
                nationwide with installation templates; whole-villa projects can be scheduled on
                request.
              </p>
            </div>

            <Button asChild className="mt-6 gap-2">
              <Link href="/quote">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Request a quote online
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl">How fast we reply</h2>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm leading-relaxed">
              <li><strong>Phone & WhatsApp</strong> — same working day, usually within the hour during studio hours.</li>
              <li><strong>Quote requests</strong> — a written estimate with fabric options within one business day.</li>
              <li><strong>Measuring visits</strong> — usually within 3 working days; next-day in New Cairo for whole-home orders.</li>
              <li><strong>Aftercare & warranty</strong> — always answered by a human; escalation to the workshop manager if we miss an SLA.</li>
            </ul>

            <Faq
              title="Before you ask"
              items={[
                {
                  question: "Do I need to visit the showroom before ordering?",
                  answer:
                    "No. Free swatches are sent to your door and every order is confirmed against your written measurements. The showroom helps if you want to see mechanisms in operation, but it is optional.",
                },
                {
                  question: "Can I order a single roller blind, or is there a minimum order?",
                  answer:
                    "No minimum. One made-to-measure blind is a complete order — same measuring service, same 3–4 week timeline, same 5-year hardware warranty.",
                },
                {
                  question: "How do I send photos of my windows?",
                  answer:
                    "WhatsApp them to +20 100 123 4567 with the room name. Two angles per window (full width + recess close-up) are enough for us to advise before a measuring visit.",
                },
                {
                  question: "What if I live outside Cairo?",
                  answer:
                    "Nationwide shipping with a full installation template and phone support during fitting. Whole-home and villa projects schedule one of our measurers to travel — call to plan.",
                },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
