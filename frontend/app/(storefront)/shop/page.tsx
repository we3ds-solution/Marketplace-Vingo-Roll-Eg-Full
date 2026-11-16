import type { Metadata } from "next";
import { Suspense } from "react";
import { apiGetCategories, apiGetProducts } from "@/lib/api/client";
import { mapApiCategory, mapApiProducts } from "@/lib/api/mappers";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata: Metadata = {
  title: "Shop all products",
  description:
    "Curtains, shades and blinds cut for your windows. Filter by room, light and style — or let the style finder decide.",
};

export const revalidate = 60; // ISR: catalog pages are served from the Next.js cache and revalidate in the background every minute

export default async function ShopPage() {
  const [productsResult, categories] = await Promise.all([
    apiGetProducts({ pageSize: 100 }),
    apiGetCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="container-page grid gap-4 py-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-muted h-80 animate-pulse rounded-sm" />
          ))}
        </div>
      }
    >
      <ShopContent
        products={mapApiProducts(productsResult.items)}
        categories={categories.map(mapApiCategory)}
      />
    </Suspense>
  );
}
