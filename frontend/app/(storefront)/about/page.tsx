"use client";

import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <PageHeader
        eyebrow="About"
        title="Made to measure since 1998"
        description="Family-owned workshop specializing in custom window treatments."
      />
      <Section>
        <div className="max-w-3xl space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            For over two decades, we've been crafting custom window treatments that transform how light enters your space.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every curtain, shade, and blind is made to order in our workshop, ensuring perfect fit and finish for your windows.
          </p>
          <Button asChild>
            <Link href="/about/our-story">Read our story</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
