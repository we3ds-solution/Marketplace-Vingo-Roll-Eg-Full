import type { Metadata } from "next";
import { apiGetCategories, apiGetProducts } from "@/lib/api/client";
import { mapApiCategory, mapApiProducts } from "@/lib/api/mappers";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata: Metadata = {
  title: "Shop all products",
  description:
    "Curtains, shades and blinds cut for your windows. Filter by room, light and style — or let the style finder decide.",
};

// Catalog changes on every deploy/seed — keep this page dynamic.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [productsResult, categories] = await Promise.all([
    apiGetProducts({ pageSize: 100 }),
    apiGetCategories(),
  ]);

  return (
    <ShopContent
      products={mapApiProducts(productsResult.items)}
      categories={categories.map(mapApiCategory)}
    />
  );
}
