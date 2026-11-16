import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Crumbs, Section, SectionHeading } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { apiGetInspirationStories, apiGetInspirationStory } from "@/lib/api/client";
import {
  mapApiStory,
  mapApiStoryDetail,
  mapRelatedProductToProduct,
} from "@/lib/api/mappers";

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await apiGetInspirationStory(slug).catch(() => null);
  return {
    title: post ? `${post.title} — Inspiration` : "Inspiration",
    description: post?.excerpt ?? undefined,
  };
}

export default async function InspirationPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await apiGetInspirationStory(slug);

  if (!story) {
    notFound();
  }

  const post = mapApiStoryDetail(story);
  const featured = story.products.map(mapRelatedProductToProduct);
  const related = (await apiGetInspirationStories())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)
    .map(mapApiStory);

  return (
    <>
      <div className="relative h-[64vh] min-h-[480px] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          quality={80}
          className="animate-image-reveal object-cover"
        />
        <div className="veil absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-12">
            <p className="eyebrow text-white/70">{post.room} · {post.style}</p>
            <h1 className="mt-3 max-w-2xl text-4xl text-white md:text-6xl">{post.title}</h1>
          </div>
        </div>
      </div>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Inspiration", href: "/inspiration" },
          { label: post.title },
        ]}
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground text-xl leading-relaxed">{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </Section>
      {featured.length > 0 && (
        <Section className="bg-card">
          <SectionHeading eyebrow="Featured" title="Shop this room" />
          <ProductGrid products={featured} />
        </Section>
      )}
      <Section>
        <SectionHeading eyebrow="Related" title="More inspiration" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {related.map((p) => (
            <Link key={p.id} href={`/inspiration/${p.slug}`} className="group block">
              <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={75}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="eyebrow mt-3">{p.style}</p>
              <h3 className="mt-1 text-xl">{p.title}</h3>
            </Link>
          ))}
        </div>
        <Button asChild className="mt-8" variant="outline">
          <Link href="/inspiration">All inspiration</Link>
        </Button>
      </Section>
    </>
  );
}
