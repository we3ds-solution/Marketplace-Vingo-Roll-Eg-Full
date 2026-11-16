"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, History, Sparkles, CornerDownLeft } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { apiGetProducts } from "@/lib/api/client";
import type { ApiProductListItem } from "@/lib/api/types";

const RECENTS_KEY = "vingo-recent-searches";
const MAX_RECENTS = 6;
const MAX_RESULTS = 8;

const RECOMMENDED = [
  "Belgian linen curtains",
  "Blackout",
  "Roman shades",
  "Sheer curtains",
  "Motorized",
  "On sale",
];

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeRecents(terms: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(terms.slice(0, MAX_RECENTS)));
}

export function SearchModal() {
  const open = useUIStore((s) => s.searchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [results, setResults] = useState<ApiProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  // Hydrate recents on first open
  useEffect(() => {
    if (open) {
      setRecents(readRecents());
      setActive(0);
      // Focus the input once the animation has mounted
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Debounced live search
  useEffect(() => {
    if (!open || trimmed.length < 2) {
      setResults([]);
      setTotal(0);
      setSearching(false);
      return;
    }

    setSearching(true);
    const id = window.setTimeout(() => {
      apiGetProducts({ search: trimmed, pageSize: MAX_RESULTS })
        .then((res) => {
          setResults(res.items);
          setTotal(res.totalCount);
        })
        .catch(() => {
          setResults([]);
          setTotal(0);
        })
        .finally(() => setSearching(false));
    }, 180);

    return () => window.clearTimeout(id);
  }, [trimmed, open]);

  const commitSearch = useCallback(
    (term: string) => {
      const value = term.trim();
      if (!value) return;
      const next = [value, ...readRecents().filter((r) => r.toLowerCase() !== value.toLowerCase())];
      writeRecents(next);
      setRecents(next);
      router.push(`/shop?search=${encodeURIComponent(value)}`);
      closeSearch();
    },
    [router, closeSearch],
  );

  const removeRecent = useCallback((term: string) => {
    const next = readRecents().filter((r) => r !== term);
    writeRecents(next);
    setRecents(next);
  }, []);

  const clearRecents = useCallback(() => {
    window.localStorage.removeItem(RECENTS_KEY);
    setRecents([]);
  }, []);

  // Keyboard navigation inside the palette
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const optionCount = results.length + 1; // + "see all results" row
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % optionCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + optionCount) % optionCount);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (trimmed && active < results.length) {
        router.push(`/product/${results[active].slug}`);
        closeSearch();
      } else {
        commitSearch(trimmed);
      }
    } else if (event.key === "Escape") {
      closeSearch();
    }
  };

  // Global shortcut: Ctrl/Cmd+K toggles, handled in Providers
  if (!open) return null;

  const hasQuery = trimmed.length >= 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      className="fixed inset-0 z-50 flex items-start justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={closeSearch}
        className="animate-fade-in absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="animate-menu-in relative mx-4 mt-[8vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            type="text"
            inputMode="search"
            autoComplete="off"
            placeholder="Search curtains, shades, rooms, needs…"
            aria-label="Search products"
            className="placeholder:text-muted-foreground/70 h-14 w-full bg-transparent text-base outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear query"
              className="text-muted-foreground hover:text-foreground grid h-8 w-8 shrink-0 place-items-center rounded-sm transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="text-muted-foreground border-border hidden shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
              ESC
            </kbd>
          )}
        </div>

        {/* Body */}
        <div ref={listRef} className="max-h-[62vh] overflow-y-auto p-3">
          {!hasQuery ? (
            <>
              {/* Recent searches */}
              {recents.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="flex flex-wrap gap-2 px-2 pb-1">
                    {recents.map((term) => (
                      <li key={term} className="flex items-center gap-1 rounded-full border border-border bg-muted/60 py-1.5 ps-3 pe-1 text-xs">
                        <button type="button" onClick={() => commitSearch(term)} className="hover:text-accent transition-colors">
                          {term}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRecent(term)}
                          aria-label={`Remove ${term} from recent searches`}
                          className="text-muted-foreground hover:text-foreground grid h-5 w-5 place-items-center rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended */}
              <div>
                <div className="mb-2 flex items-center gap-2 px-2">
                  <Sparkles className="text-accent h-3.5 w-3.5" aria-hidden="true" />
                  <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    Recommended for you
                  </p>
                </div>
                <ul className="grid grid-cols-1 gap-1 px-2 sm:grid-cols-2">
                  {RECOMMENDED.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => commitSearch(term)}
                        className="hover:bg-muted/60 hover:text-accent flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-start text-sm transition-colors"
                      >
                        <History className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{term}</span>
                        <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider">
                {searching ? "Searching…" : total > 0 ? `${total} result${total === 1 ? "" : "s"}` : "No matches"}
              </p>

              {results.length > 0 ? (
                <ul role="listbox" aria-activedescendant={results[active]?.slug}>
                  {results.map((product, index) => {
                    const selected = index === active;
                    return (
                      <li key={product.id} role="option" aria-selected={selected}>
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeSearch}
                          onMouseEnter={() => setActive(index)}
                          className={cn(
                            "flex items-center gap-3 rounded-sm px-2 py-2 transition-colors",
                            selected ? "bg-accent/10" : "hover:bg-muted/60",
                          )}
                        >
                          <Image
                            src={product.primaryImageUrl}
                            alt=""
                            width={48}
                            height={60}
                            className="bg-muted h-14 w-12 rounded-sm object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{product.name}</span>
                            <span className="text-muted-foreground mt-0.5 block text-xs">
                              {product.categoryName ?? product.lightControl ?? "Made to order"}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-medium tabular-nums">{formatPrice(product.price)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-muted-foreground text-sm">Nothing matches “{trimmed}”.</p>
                  <p className="text-muted-foreground mt-1 text-xs">Try a room, a fabric family or a light-control level.</p>
                </div>
              )}

              {/* See all results */}
              {results.length > 0 && (
                <button
                  type="button"
                  onClick={() => commitSearch(trimmed)}
                  onMouseEnter={() => setActive(results.length)}
                  className={cn(
                    "mt-1 flex w-full items-center justify-between rounded-sm border-t border-border px-3 py-3 text-sm font-medium transition-colors",
                    active === results.length ? "bg-accent/10 text-accent" : "hover:bg-muted/60",
                  )}
                >
                  <span>View all {total} results for “{trimmed}”</span>
                  <CornerDownLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="text-muted-foreground flex items-center justify-between border-t border-border px-5 py-2 text-[10px]">
          <span>↑↓ to navigate · Enter to select · Esc to close</span>
          <span>Ctrl K to reopen</span>
        </div>
      </div>
    </div>
  );
}
