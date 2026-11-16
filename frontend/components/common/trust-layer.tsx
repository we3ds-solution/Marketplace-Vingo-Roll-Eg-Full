import { Ruler, Truck, Shield, Palette } from "lucide-react";
import Link from "next/link";
import { Card, CardIconRow } from "@/components/ui/card";
import { Section } from "@/components/common/section";

const items = [
  {
    icon: Palette,
    title: "Free swatches",
    body: "Judge colour in your own light before you commit.",
    to: "/swatches" as const,
    cta: "Order samples",
  },
  {
    icon: Ruler,
    title: "Measuring help",
    body: "Step-by-step guides, or a technician who does it for you.",
    to: "/guides/measuring" as const,
    cta: "Measuring center",
  },
  {
    icon: Truck,
    title: "Shipping & lead times",
    body: "Made-to-order in 3–4 weeks, tracked to your door.",
    to: "/guides/shipping" as const,
    cta: "Shipping info",
  },
  {
    icon: Shield,
    title: "Custom-order policy",
    body: "5-year hardware warranty and a clear returns policy.",
    to: "/guides/returns" as const,
    cta: "Returns & warranty",
  },
];

export function TrustLayer({ compact = false }: { compact?: boolean }) {
  const gridClass = compact
    ? "grid gap-4 sm:grid-cols-2"
    : "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4";

  const list = (
    <ul className={gridClass}>
      {items.map(({ icon: Icon, ...item }) => (
        <li key={item.title}>
          <Card className="hover:border-accent/60 flex h-full flex-col gap-3 p-5 transition-colors sm:p-6">
            <CardIconRow icon={Icon} title={item.title} />
            <p className="text-muted-foreground text-xs leading-relaxed">{item.body}</p>
            <Link
              href={item.to}
              className="text-accent focus-visible:ring-ring mt-auto inline-flex w-fit items-center gap-1 rounded-sm pt-1 text-xs underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2"
            >
              {item.cta}
            </Link>
          </Card>
        </li>
      ))}
    </ul>
  );

  // Compact (product detail): bare list, no section chrome.
  // Default: own section so position/rhythm matches every other page section.
  return compact ? list : <Section>{list}</Section>;
}
