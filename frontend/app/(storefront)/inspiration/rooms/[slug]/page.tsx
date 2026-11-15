import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-card";
import { apiGetRoomBySlug } from "@/lib/api/client";
import { mapApiProducts } from "@/lib/api/mappers";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await apiGetRoomBySlug(slug).catch(() => null);
  return {
    title: room ? `${room.name} — Rooms` : "Room",
    description: room?.description ?? undefined,
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await apiGetRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const roomProducts = mapApiProducts(room.products);

  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Inspiration", href: "/inspiration" },
        { label: "Rooms", href: "/inspiration/rooms" },
        { label: room.name }
      ]} />
      <PageHeader
        eyebrow="Room"
        title={room.name}
        description={room.description ?? undefined}
      />
      <Section>
        {roomProducts.length > 0 ? (
          <ProductGrid products={roomProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available for this room yet.</p>
            <Link href="/shop" className="text-accent underline underline-offset-4 mt-4 inline-block">
              Browse all products
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}
