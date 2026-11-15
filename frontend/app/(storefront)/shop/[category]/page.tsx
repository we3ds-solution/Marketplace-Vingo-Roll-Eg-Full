import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiGetCategories, apiGetProducts } from "@/lib/api/client";
import { mapApiCategory, mapApiProducts } from "@/lib/api/mappers";
import { ShopContent } from "@/components/shop/shop-content";

// Catalog changes on every deploy/seed — keep this page dynamic.
export const dynamic = "force-dynamic";

type Params = { category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await apiGetCategories().catch(() => []);
  const category = categories.find((c) => c.slug === slug);
  return {
    title: category ? `${category.name} — Vingo Roll` : "Shop",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug } = await params;

  const [productsResult, apiCategories] = await Promise.all([
    apiGetProducts({ pageSize: 100, category: categorySlug }),
    apiGetCategories(),
  ]);

  const categories = apiCategories.map(mapApiCategory);
  const category = categories.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <ShopContent
      products={mapApiProducts(productsResult.items)}
      categories={categories}
      intro={{
        eyebrow: category.tagline,
        title: category.name,
        description: category.description,
      }}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: category.name },
      ]}
    />
  );
}
