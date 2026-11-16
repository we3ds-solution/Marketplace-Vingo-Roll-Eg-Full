import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { apiGetNeeds } from "@/lib/api/client";
import { mapApiNeed } from "@/lib/api/mappers";
import {
  Moon,
  EyeOff,
  Thermometer,
  Sun,
  VolumeX,
  Wrench,
  Zap,
  Minimize2,
  Maximize2,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shop by need",
  description: "Find treatments by the problem they solve.",
};

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

const needIcons: Record<string, LucideIcon> = {
  moon: Moon,
  "eye-off": EyeOff,
  thermometer: Thermometer,
  sun: Sun,
  "volume-x": VolumeX,
  wrench: Wrench,
  zap: Zap,
  "minimize-2": Minimize2,
  "maximize-2": Maximize2,
};

export default async function ShopByNeedsPage() {
  const needs = (await apiGetNeeds()).map(mapApiNeed);

  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Shop by Need" },
        ]}
      />
      <PageHeader
        eyebrow="Shop by"
        title="What do you need?"
        description="Find treatments by the problem they solve."
      />
      <Section>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {needs.map((need, i) => {
            const Icon = needIcons[need.icon] ?? Sun;
            return (
              <Reveal key={need.id} delay={i * 70}>
                <Link
                  href={`/shop?need=${need.slug}`}
                  className="group border-border bg-card/60 flex h-full flex-col rounded-sm border p-6 transition-colors hover:border-accent"
                >
                  <span className="bg-accent/10 text-accent grid h-12 w-12 place-items-center rounded-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg">{need.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {need.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
