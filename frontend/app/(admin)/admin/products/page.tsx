"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { formatPrice } from "@/lib/utils";
import {
  AdminHeader,
  AdminEmpty,
  AdminTable,
  AdminTHead,
  AdminTd,
  AdminTh,
  AdminTr,
  AdminBadge,
} from "@/components/admin/admin-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  categorySlug: string | null;
  categoryName: string | null;
  primaryImageUrl: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isActive: boolean;
  stockStatus: string;
};

type ListResponse = {
  items: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
};

export default function AdminProductsPage() {
  const { authedFetch } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<string>("all");
  const [page, setPage] = useState(1);

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => authedFetch<Array<{ id: string; slug: string; name: string }>>("/api/v1/admin/categories"),
  });

  const products = useQuery({
    queryKey: ["admin", "products", search, category, active, page],
    queryFn: () =>
      authedFetch<ListResponse>(
        `/api/v1/admin/products?${new URLSearchParams({
          page: String(page),
          pageSize: "20",
          ...(search ? { search } : {}),
          ...(category !== "all" ? { category } : {}),
          ...(active !== "all" ? { active } : {}),
        })}`,
      ),
    placeholderData: keepPreviousData,
  });

  const totalPages = products.data ? Math.max(1, Math.ceil(products.data.total / 20)) : 1;

  return (
    <>
      <AdminHeader
        title="Products"
        description="The full catalog — including offline pieces and drafts."
        action={
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus className="me-1.5 h-4 w-4" aria-hidden="true" />
              New product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or slug…"
            className="ps-9"
            aria-label="Search products"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-48" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.data?.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={active} onValueChange={(v) => { setActive(v); setPage(1); }}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !products.data || products.data.items.length === 0 ? (
        <AdminEmpty
          title="No products found"
          description="Try a different search or clear the filters."
        />
      ) : (
        <>
          <AdminTable>
            <AdminTHead>
              <AdminTh className="w-14"></AdminTh>
              <AdminTh>Product</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh className="text-end">Price</AdminTh>
              <AdminTh>Flags</AdminTh>
              <AdminTh>Status</AdminTh>
            </AdminTHead>
            <tbody>
              {products.data.items.map((p) => (
                <AdminTr key={p.id} className="hover:bg-muted/40">
                  <AdminTd>
                    {p.primaryImageUrl ? (
                      <Image
                        src={p.primaryImageUrl}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                        className="bg-muted h-12 w-12 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-12 w-12 rounded-sm" />
                    )}
                  </AdminTd>
                  <AdminTd>
                    <Link href={`/admin/products/${p.id}`} className="hover:text-accent font-medium">
                      {p.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">{p.slug}</p>
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">{p.categoryName ?? "—"}</AdminTd>
                  <AdminTd className="text-end tabular-nums">{formatPrice(p.price)}</AdminTd>
                  <AdminTd>
                    <div className="flex flex-wrap gap-1">
                      {p.isFeatured && <AdminBadge tone="green">Featured</AdminBadge>}
                      {p.isBestseller && <AdminBadge>Bestseller</AdminBadge>}
                      {p.isNewArrival && <AdminBadge tone="amber">New</AdminBadge>}
                      {p.isOnSale && <AdminBadge tone="red">Sale</AdminBadge>}
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <AdminBadge tone={p.isActive ? "green" : "red"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </AdminBadge>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {products.data.total} product{products.data.total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <span className="tabular-nums text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
