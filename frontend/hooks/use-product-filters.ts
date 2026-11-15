/**
 * useProductFilters - Hook for filtering and sorting products
 * Products carry their association slugs from the API (roomSlugs,
 * collectionSlugs, materialTiers), so filters are plain membership checks.
 */

import { useMemo } from "react";
import type { Product } from "@/types";
import type { FilterState } from "@/types/filters";

export function useProductFilters(products: Product[], filters: FilterState): Product[] {
  return useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );

    // Material tier filter — the API tells us which fabric tiers the product offers
    if (filters.materialTiers.length > 0) {
      filtered = filtered.filter((p) =>
        p.materialTiers?.some((t) => filters.materialTiers.includes(t.toLowerCase())),
      );
    }

    // Light control filter
    if (filters.lightControl.length > 0) {
      filtered = filtered.filter((p) => filters.lightControl.includes(p.lightControl || ""));
    }

    // Room filter
    if (filters.rooms.length > 0) {
      filtered = filtered.filter((p) =>
        p.rooms?.some((r) => {
          const roomSlug = typeof r === "string" ? r : r.slug;
          return filters.rooms.includes(roomSlug);
        }),
      );
    }

    // Collection filter (matches by collection slug)
    if (filters.collections.length > 0) {
      filtered = filtered.filter((p) =>
        p.collectionSlugs?.some((slug) => filters.collections.includes(slug)),
      );
    }

    // Style filter (case-insensitive)
    if (filters.styles.length > 0) {
      const wanted = filters.styles.map((s) => s.toLowerCase());
      filtered = filtered.filter((p) =>
        p.styles?.some((s) => wanted.includes(s.toLowerCase())),
      );
    }

    // Sorting
    return applySorting(filtered, filters.sortBy);
  }, [products, filters]);
}

/**
 * applySorting - Internal helper to apply sort logic
 * Extracted for reusability and testability
 */
function applySorting(products: Product[], sortBy: FilterState["sortBy"]): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case "bestseller":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "relevance":
    default:
      // Keep original order
      break;
  }

  return sorted;
}
