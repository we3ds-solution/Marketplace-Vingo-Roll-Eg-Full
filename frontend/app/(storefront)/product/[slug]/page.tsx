import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiGetProductBySlug } from "@/lib/api/client";
import {
  mapApiProductDetail,
  mapApiReview,
  mapRelatedProductToProduct,
} from "@/lib/api/mappers";
import { ProductDetail } from "@/components/product/product-detail";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await apiGetProductBySlug(slug).catch(() => null);

  return {
    title: detail ? detail.name : "Product",
    description: detail?.shortDescription ?? undefined,
    alternates: { canonical: `/product/${slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await apiGetProductBySlug(slug);

  if (!detail) {
    notFound();
  }

  const product = mapApiProductDetail(detail);
  const reviews = detail.reviews.map(mapApiReview);
  const related = detail.relatedProducts.map(mapRelatedProductToProduct);

  const baseUrl = "https://vingoroll.com";
  const imageOf = (src: string) => (src.startsWith("http") ? src : `${baseUrl}${src}`);
  const availability =
    product.stockStatus === "sold-out"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${baseUrl}/product/${product.slug}`,
          name: product.name,
          description: product.shortDescription,
          sku: product.id,
          brand: { "@type": "Brand", name: "Vingo Roll Studio" },
          category: product.category?.name,
          image: product.images.slice(0, 6).map((img) => imageOf(img.src)),
          ...(product.reviewCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                },
              }
            : {}),
          offers: {
            "@type": "Offer",
            price: product.price.toFixed(2),
            priceCurrency: product.currency ?? "USD",
            availability,
            url: `${baseUrl}/product/${product.slug}`,
          },
        }}
      />
      <ProductDetail product={product} reviews={reviews} related={related} />
    </>
  );
}
