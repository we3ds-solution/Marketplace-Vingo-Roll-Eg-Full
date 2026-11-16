import type { Metadata } from "next";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-card";
import { apiGetProducts } from "@/lib/api/client";
import { mapApiProducts } from "@/lib/api/mappers";

export const metadata: Metadata = {
  title: "Smart & motorized treatments",
  description: "Control your window treatments with your voice, phone, or schedule.",
};

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export default async function SmartHomePage() {
  const products = mapApiProducts(
    (await apiGetProducts({ pageSize: 100 })).items,
  ).filter((p) => p.motorized);

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Smart & Motorized" }]} />
      <PageHeader
        eyebrow="Technology"
        title="Smart & motorized treatments"
        description="Control your window treatments with your voice, phone, or schedule."
      />
      <Section>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-muted-foreground">Motorized products coming soon.</p>
        )}
      </Section>
    </>
  );
}
