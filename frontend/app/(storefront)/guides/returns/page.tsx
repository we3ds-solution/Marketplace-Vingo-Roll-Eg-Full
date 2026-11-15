import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: "Our returns policy for made-to-order and ready-to-hang treatments.",
};

export default function ReturnsGuidePage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: "Returns" }
      ]} />
      <PageHeader
        eyebrow="Guides"
        title="Returns & exchanges"
        description="Made-to-order is cut for you — here's where we stand."
      />
      <Section>
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl">Made-to-order pieces</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Because each treatment is cut to your measurements, made-to-order goods are
              <strong> final sale</strong> once cutting begins. That&apos;s why we send free swatches
              first, and confirm measurements before every cut.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Whilst in production</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Changed your mind or spotted an error? Contact us within <strong>48 hours</strong> of
              ordering and we can usually pause production, change measurements or swap fabric before
              the cut.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Ready-to-hang items</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Stocked hardware and ready-made pieces can be returned within <strong>14 days</strong>
              of delivery, unused and in original packaging, for a full refund of the item price.
              Shipping is non-refundable.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Damage & faults</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              If anything arrives damaged or faulty, photograph it and contact us within 7 days —
              we&apos;ll repair, replace or refund, and cover the freight both ways.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/swatches">Order swatches first</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
