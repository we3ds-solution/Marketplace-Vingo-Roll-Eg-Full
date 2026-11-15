import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { apiGetCollections } from "@/lib/api/client";
import { mapApiCollection } from "@/lib/api/mappers";

export const metadata: Metadata = {
  title: "Collections",
  description: "Six points of view on the same question: how should this room hold light?",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = (await apiGetCollections()).map(mapApiCollection);

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />
      <PageHeader
        eyebrow="Curation"
        title="Collections"
        description="Six points of view on the same question: how should this room hold light?"
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-sm">
                  <Image
                    src={c.image}
                    alt={`${c.name} collection`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    quality={75}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="eyebrow mt-4">{c.mood}</p>
                <h2 className="mt-1 text-2xl">{c.name}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {c.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
