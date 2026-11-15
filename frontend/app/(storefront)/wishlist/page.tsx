"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Crumbs, PageHeader, Section, EmptyState } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-card";
import { useWishlistStore } from "@/stores/wishlist-store";
import { mapApiWishlistItemToProduct } from "@/lib/api/mappers";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);
  const refresh = useWishlistStore((s) => s.refresh);
  const hydrated = useWishlistStore((s) => s.hydrated);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saved = items.map(mapApiWishlistItemToProduct);

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <PageHeader
        eyebrow="Saved"
        title="Your wishlist"
        description="Saved to your browsing session — it stays with you across this device."
      />
      <Section>
        {!hydrated ? (
          <div className="bg-muted h-64 animate-pulse rounded-sm" />
        ) : saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any piece to keep it here."
            action={
              <Button asChild>
                <Link href="/shop">Browse treatments</Link>
              </Button>
            }
          />
        ) : (
          <>
            <ProductGrid products={saved} />
            <Button variant="ghost" className="mt-10" onClick={() => void clear()}>
              Clear wishlist
            </Button>
          </>
        )}
      </Section>
    </>
  );
}
