"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import Link from "next/link";

export default function ShopPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts({ page: 1, pageSize: 20 }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          Error loading products. Make sure backend is running on port 5000.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shop All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.items.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-4">
              {product.primaryImageUrl && (
                <img
                  src={product.primaryImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>

            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.shortDescription}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">${product.price}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compareAtPrice}
                </span>
              )}
            </div>

            {product.isFeatured && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                Featured
              </span>
            )}
          </Link>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            disabled={!data.hasPrevious}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            disabled={!data.hasNext}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
