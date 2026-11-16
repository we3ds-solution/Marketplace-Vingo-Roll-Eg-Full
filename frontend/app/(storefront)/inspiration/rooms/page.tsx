import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { apiGetRooms } from "@/lib/api/client";
import { mapApiRoom } from "@/lib/api/mappers";

export const metadata: Metadata = {
  title: "Shop by room",
  description: "Browse window treatments by the space they belong in.",
};

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export default async function InspirationRoomsPage() {
  const rooms = (await apiGetRooms()).map(mapApiRoom);

  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Inspiration", href: "/inspiration" },
        { label: "Shop by Room" }
      ]} />
      <PageHeader
        eyebrow="Shop by"
        title="Room by room"
        description="Browse window treatments by the space they belong in."
      />
      <Section>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <Reveal key={room.id} delay={i * 70}>
              <Link href={`/inspiration/rooms/${room.slug}`} className="group block">
                <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-sm">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    quality={75}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-lg">{room.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {room.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
