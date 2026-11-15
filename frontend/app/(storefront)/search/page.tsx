"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { Crumbs, PageHeader, Section, EmptyState } from "@/components/common/section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-card";
import { apiGetCategories, apiGetInspirationStories, apiGetProducts } from "@/lib/api/client";
import { mapApiCategory, mapApiProducts, mapApiStory } from "@/lib/api/mappers";
import type { Category, InspirationPost, Product } from "@/types";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const need = searchParams.get("need") || "";
  const [value, setValue] = useState(q);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<InspirationPost[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiGetProducts(need ? { need, pageSize: 100 } : { pageSize: 100 }),
      apiGetCategories(),
      apiGetInspirationStories(),
    ])
      .then(([productResult, apiCategories, apiStories]) => {
        if (cancelled) return;
        setProducts(mapApiProducts(productResult.items));
        setCategories(apiCategories.map(mapApiCategory));
        setPosts(apiStories.map(mapApiStory));
      })
      .catch(() => {
        // Keep the last good result on transient API errors
      });

    return () => {
      cancelled = true;
    };
  }, [need]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();

    // With a need filter active, products come pre-filtered from the API —
    // a text query narrows further on top.
    const matchesQuery = (values: Array<string | undefined>) =>
      !query || values.some((v) => v?.toLowerCase().includes(query));

    return {
      products: products.filter((p) =>
        matchesQuery([
          p.name,
          p.description,
          ...(p.styles ?? []),
          ...(p.needs ?? []).map((n) => (typeof n === "string" ? n : n.slug)),
          ...(p.rooms ?? []).map((r) => (typeof r === "string" ? r : r.slug)),
        ]),
      ),
      categories: query
        ? categories.filter((c) =>
            matchesQuery([c.name, c.description, c.tagline]),
          )
        : [],
      posts: query
        ? posts.filter((i) => matchesQuery([i.title, i.excerpt, i.room]))
        : [],
    };
  }, [q, products, categories, posts]);

  const hasContext = q.trim().length > 0 || need.length > 0;
  const empty =
    hasContext &&
    !results.products.length &&
    !results.categories.length &&
    !results.posts.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
      />
      <PageHeader eyebrow="Search" title="Find your treatment">
        <form
          onSubmit={handleSearch}
          className="flex max-w-xl gap-2"
          role="search"
        >
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <Input
            id="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="linen, blackout, bedroom…"
          />
          <Button type="submit">
            <SearchIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {need && (
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="border-accent text-accent inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors"
              aria-label="Clear need filter"
            >
              Need: {need}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          {["linen", "blackout", "bedroom", "motorized"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setValue(t);
                router.push(`/search?q=${encodeURIComponent(t)}`);
              }}
              className="border-border hover:border-accent rounded-full border px-3 py-1 text-xs transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </PageHeader>
      <Section>
        {!hasContext ? (
          <EmptyState
            title="Search the whole catalog"
            description="Try a material, a room, or how you want the light to behave."
          />
        ) : empty ? (
          <EmptyState
            title={`No matches for "${q || need}"`}
            description="Try a broader term, or take the style finder for a recommendation."
            action={
              <Button asChild>
                <Link href="/style-finder">Style finder</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-16">
            {results.categories.length > 0 && (
              <div>
                <h2 className="mb-5 text-2xl">Categories</h2>
                <ul className="flex flex-wrap gap-2">
                  {results.categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/shop/${c.slug}`}
                        className="border-border hover:border-accent rounded-full border px-4 py-2 text-sm transition-colors"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.products.length > 0 && (
              <div>
                <h2 className="mb-6 text-2xl">
                  {need ? "Treatments for this need" : "Products"}
                </h2>
                <ProductGrid products={results.products} />
              </div>
            )}
            {results.posts.length > 0 && (
              <div>
                <h2 className="mb-5 text-2xl">Inspiration</h2>
                <ul className="space-y-3">
                  {results.posts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/inspiration/${p.slug}`}
                        className="hover:text-accent text-sm underline underline-offset-4"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading search…</div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
