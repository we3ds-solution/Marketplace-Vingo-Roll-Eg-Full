import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { ProductGrid } from "@/components/product/product-card";
import { TrustLayer } from "@/components/common/trust-layer";
import { apiGetCategories, apiGetProducts } from "@/lib/api/client";
import { mapApiCategory, mapApiProducts } from "@/lib/api/mappers";

// ISR: catalog pages are served from the Next.js cache and revalidate in the background every minute
export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export const metadata: Metadata = {
  title: "Made-to-Measure Curtains & Window Treatments in Cairo",
  description:
    "Curtains, roller shades, roman blinds and motorized window treatments, measured and made for your windows. Free swatches, 3–4 week delivery, 5-year hardware warranty — Cairo & Giza.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [productsResult, apiCategories] = await Promise.all([
    apiGetProducts({ pageSize: 6, isFeatured: true }),
    apiGetCategories(),
  ]);

  const featured = mapApiProducts(productsResult.items);
  const heroCategories = apiCategories.map(mapApiCategory).slice(0, 4);

  return (
    <>
      {/* Hero â€” full-viewport on every screen */}
      <section className="relative min-h-[540px] h-[100svh]">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src="/images/hero/hero-living-room.jpg"
            alt="Sunlit living room with floor-to-ceiling ivory linen curtains"
            fill
            priority
            sizes="100vw"
            quality={80}
            className="animate-image-reveal h-full w-full object-cover"
          />
          <div className="veil absolute inset-0" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-16 md:pb-24">
              <p className="eyebrow animate-fade-up text-white/70">Made to measure since 1998</p>
              <h1 className="animate-fade-up mt-4 max-w-3xl text-4xl leading-[1.03] text-white sm:text-6xl lg:text-7xl">
                Light, tailored to the room it falls in.
              </h1>
              <p className="animate-fade-up mt-6 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                Curtains, shades and blinds cut for your windows â€” with swatches, measuring and
                installation handled by people who do this every day.
              </p>
              <div className="animate-fade-up mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/shop">Shop treatments</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/services/design-consultation">Book a consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <Section>
        <SectionHeading
          eyebrow="Treatments"
          title="Start with the shape of the light"
          description="Four families cover most rooms. If you're unsure, the style finder narrows it down in a minute."
          action={
            <Button asChild variant="ghost">
              <Link href="/shop">
                All treatments <ArrowRight className="ms-2 h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {heroCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80}>
              <Link href={`/shop/${cat.slug}`} className="group block">
                <div className="bg-muted relative aspect-[3/4] overflow-hidden rounded-sm">
                  <Image
                    src={cat.image}
                    alt={`${cat.name} â€” ${cat.tagline}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    quality={75}
                    className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                  <div className="veil absolute inset-0" aria-hidden="true" />
                  <div className="absolute inset-x-5 bottom-5">
                    <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                    <p className="mt-1 text-sm text-white/75">{cat.tagline}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Featured Products */}
      <Section>
        <SectionHeading
          eyebrow="Featured"
          title="Bestsellers & new arrivals"
          action={
            <Button asChild variant="ghost">
              <Link href="/shop">
                All products <ArrowRight className="ms-2 h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <ProductGrid products={featured} />
      </Section>

      {/* Trust Layer */}
      <TrustLayer />
    </>
  );
}
