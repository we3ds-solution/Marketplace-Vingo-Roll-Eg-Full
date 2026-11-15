import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { ProductGrid } from "@/components/product/product-card";
import { TrustLayer } from "@/components/common/trust-layer";
import { categories, IMG } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";
import { rooms } from "@/lib/data/rooms";
import { inspiration, testimonials } from "@/lib/data/content";

export default function HomePage() {
  const featured = products.filter((p) => p.flags?.featured).slice(0, 6);
  const heroCategories = categories.slice(0, 4);
  const designer = collections[0]!;

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={IMG.hero}
            alt="Sunlit living room with floor-to-ceiling ivory linen curtains"
            width={1920}
            height={1088}
            className="animate-image-reveal h-full w-full object-cover"
          />
          <div className="veil absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-16 md:pb-24">
              <p className="eyebrow animate-fade-up text-white/70">Made to measure since 1998</p>
              <h1 className="animate-fade-up mt-4 max-w-3xl text-4xl leading-[1.03] text-white sm:text-6xl lg:text-7xl">
                Light, tailored to the room it falls in.
              </h1>
              <p className="animate-fade-up mt-6 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                Curtains, shades and blinds cut for your windows — with swatches, measuring and
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
                All treatments <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {heroCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80}>
              <Link href={`/shop/${cat.slug}`} className="group block">
                <div className="bg-muted relative aspect-[3/4] overflow-hidden rounded-sm">
                  <img
                    src={cat.image}
                    alt={`${cat.name} — ${cat.tagline}`}
                    width={1200}
                    height={1600}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                  <div className="veil absolute inset-0" aria-hidden="true" />
                  <div className="absolute right-5 bottom-5 left-5">
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
                All products <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
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
