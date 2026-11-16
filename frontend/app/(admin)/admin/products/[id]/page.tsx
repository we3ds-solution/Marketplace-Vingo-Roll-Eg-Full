"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { AdminHeader, AdminEmpty } from "@/components/admin/admin-table";
import { ProductForm, type ProductFormDto } from "@/components/admin/product-form";

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { authedFetch } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => authedFetch<ProductFormDto>(`/api/v1/admin/products/${id}`),
    enabled: Boolean(id),
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          Products
        </Link>
      </div>
      <AdminHeader
        title={data?.name ?? "Edit product"}
        description={data ? `/${data.slug} · ${data.rating.toFixed(1)} rating · ${data.reviewCount} reviews` : undefined}
      />

      {isLoading ? (
        <div className="bg-muted h-96 animate-pulse rounded-sm" />
      ) : error || !data ? (
        <AdminEmpty title="Product not found" description="It may have been deleted. Go back to the list." />
      ) : (
        <ProductForm initial={data} />
      )}
    </>
  );
}
