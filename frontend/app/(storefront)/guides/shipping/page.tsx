import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shipping & lead times",
  description: "How long made-to-order treatments take, what shipping costs and how delivery works.",
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
        description="Made-to-order means cut for you, checked by hand, then shipped."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl">Lead times</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Made-to-order pieces leave our workroom in <strong>3–4 weeks</strong>. In-stock hardware
              and ready-to-hang lines ship in 2–3 business days. Motorised shades need an extra week
              for motor commissioning.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Shipping cost</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Flat <strong>$45</strong> to the contiguous US. <strong>Free over $500</strong>. Remote
              and white-glove installation deliveries are quoted individually.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Delivery</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Everything ships tracked and insured. Made-to-order drapery hangs from our own install
              team in the greater Los Angeles area; elsewhere we partner with certified local
              installers who know our hardware.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Tracking</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              You&apos;ll get a tracking link by email the moment your order leaves the workroom — and
              a call before delivery day to confirm the window is clear.
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
