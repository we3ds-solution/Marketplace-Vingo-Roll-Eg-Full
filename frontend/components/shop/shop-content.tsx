"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-card";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useProductFilters } from "@/hooks/use-product-filters";
import type { FilterState } from "@/types/filters";
import { FILTER_DEFAULTS } from "@/types/filters";
import type { Category, Product } from "@/types";

export function ShopContent({
  products,
  categories,
  intro,
  crumbs,
}: {
  products: Product[];
  categories: Category[];
  intro?: { eyebrow: string; title: string; description: string };
  crumbs?: Array<{ label: string; href?: string }>;
}) {
  const [filters, setFilters] = useState<FilterState>(FILTER_DEFAULTS);
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("search") ?? "").trim().toLowerCase();
  const needParam = searchParams.get("need") ?? "";

  const baseFiltered = useProductFilters(products, filters);
  const filteredProducts = baseFiltered.filter((product) => {
    if (searchQuery) {
      const haystack = [
        product.name,
        product.shortDescription,
        product.category?.name ?? "",
        ...(product.styles ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }

    if (needParam) {
      const slugs = (product.needs ?? []).map((n) => (typeof n === "string" ? n : n.slug));
      if (!slugs.includes(needParam)) return false;
    }

    return true;
  });

  return (
    <>
      <Crumbs items={crumbs ?? [{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <PageHeader
        eyebrow={intro?.eyebrow ?? "Every treatment"}
        title={intro?.title ?? "Shop all products"}
        description={
          intro?.description ??
          "Curtains, shades and blinds cut for your windows. Filter by room, light and style — or let the style finder decide."
        }
      >
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 5).map((cat) => (
            <Button key={cat.id} asChild variant="outline" size="sm">
              <Link href={`/shop/${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>
      </PageHeader>
      <Section>
        {(searchQuery || needParam) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">Filtering by:</span>
            {searchQuery && (
              <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                “{searchQuery}”
                <Link href="/shop" aria-label="Clear search filter" className="hover:text-foreground">
                  <X className="h-3 w-3" aria-hidden="true" />
                </Link>
              </span>
            )}
            {needParam && (
              <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                Need: {needParam}
                <Link href="/shop" aria-label="Clear need filter" className="hover:text-foreground">
                  <X className="h-3 w-3" aria-hidden="true" />
                </Link>
              </span>
            )}
          </div>
        )}
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <p className="text-muted-foreground text-sm">{filteredProducts.length} products</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-4 sm:p-6">
              <SheetHeader className="sr-only">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  resultsCount={filteredProducts.length}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={filteredProducts.length}
            />
          </aside>

          <div>
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </Section>
    </>
  );
}
