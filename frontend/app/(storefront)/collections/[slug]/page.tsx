import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Crumbs, Section, SectionHeading } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { apiGetCollectionBySlug, apiGetInspirationStories } from "@/lib/api/client";
import { mapApiProducts, mapApiStory } from "@/lib/api/mappers";

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await apiGetCollectionBySlug(slug).catch(() => null);
  return {
    title: collection ? `${collection.name} — Collections` : "Collection",
    description: collection?.story ?? collection?.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await apiGetCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const items = mapApiProducts(collection.products);
  const related = (await apiGetInspirationStories())
    .slice(0, 2)
    .map(mapApiStory);

  return (
    <>
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <Image
          src={collection.imageUrl ?? ""}
          alt={`${collection.name} collection`}
          fill
          priority
          sizes="100vw"
          quality={80}
          className="animate-image-reveal object-cover"
        />
        <div className="veil absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-12">
            <p className="eyebrow text-white/70">{collection.mood}</p>
            <h1 className="mt-3 text-4xl text-white md:text-6xl">{collection.name}</h1>
          </div>
        </div>
      </div>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.name },
        ]}
      />
      <Section>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {collection.story}
        </p>
      </Section>
      <Section className="bg-card">
        <SectionHeading eyebrow="Pieces" title={`${items.length} in this collection`} />
        {items.length > 0 ? (
          <ProductGrid products={items} />
        ) : (
          <p className="text-muted-foreground">More pieces are joining this collection soon.</p>
        )}
      </Section>
      <Section>
        <SectionHeading eyebrow="Related" title="Rooms in this spirit" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {related.map((post) => (
            <Link
              key={post.id}
              href={`/inspiration/${post.slug}`}
              className="group block"
            >
              <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={75}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 text-xl">{post.title}</h3>
            </Link>
          ))}
        </div>
        <Button asChild className="mt-8" variant="outline">
          <Link href="/collections">All collections</Link>
        </Button>
      </Section>
    </>
  );
}
