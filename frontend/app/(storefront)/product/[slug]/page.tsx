import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiGetProductBySlug } from "@/lib/api/client";
import {
  mapApiProductDetail,
  mapApiReview,
  mapRelatedProductToProduct,
} from "@/lib/api/mappers";
import { ProductDetail } from "@/components/product/product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await apiGetProductBySlug(slug).catch(() => null);

  return {
    title: detail ? `${detail.name} — Vingo Roll` : "Product",
    description: detail?.shortDescription ?? undefined,
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

  return <ProductDetail product={product} reviews={reviews} related={related} />;
}
