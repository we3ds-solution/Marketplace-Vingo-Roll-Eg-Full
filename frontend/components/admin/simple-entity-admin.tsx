"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export type SimpleColumn<Row> = {
  header: string;
  render: (row: Row) => ReactNode;
  className?: string;
};

type SimpleEntityAdminProps<Row extends { id: string }> = {
  title: string;
  description?: string;
  newHref: string;
  /** Admin list endpoint, e.g. /api/v1/admin/categories */
  listEndpoint: string;
  /** Search endpoint with ?search= */
  searchable?: boolean;
  columns: SimpleColumn<Row>[];
  queryKey: string;
  deleteEndpoint?: (id: string) => string;
};

export function SimpleEntityAdmin<Row extends { id: string }>({
  title,
  description,
  newHref,
  listEndpoint,
  searchable = true,
  columns,
  queryKey,
  deleteEndpoint,
}: SimpleEntityAdminProps<Row>) {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", queryKey, search],
    queryFn: () =>
      authedFetch<Row[]>(
        searchable && search
          ? `${listEndpoint}?search=${encodeURIComponent(search)}`
          : listEndpoint,
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      authedFetch(deleteEndpoint ? deleteEndpoint(id) : `${listEndpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", queryKey] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    },
  });

  return (
    <>
      <AdminHeader
        title={title}
        description={description}
        action={
          <Button asChild size="sm">
            <Link href={newHref}>
              <Plus className="me-1.5 h-4 w-4" aria-hidden="true" />
              New
            </Link>
          </Button>
        }
      />

      {searchable && (
        <div className="relative mb-4 max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="ps-9"
            aria-label="Search"
          />
        </div>
      )}

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <AdminEmpty title="Nothing here yet" description="Create the first one to get started." />
      ) : (
        <AdminTable>
          <AdminTHead>
            {columns.map((c, i) => (
              <AdminTh key={i} className={c.className}>{c.header}</AdminTh>
            ))}
            <AdminTh className="w-24 text-end">Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((row) => (
              <AdminTr key={row.id} className="hover:bg-muted/40">
                {columns.map((c, i) => (
                  <AdminTd key={i} className={c.className}>{c.render(row)}</AdminTd>
                ))}
                <AdminTd className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`${newHref.replace(/\/new$/, "")}/${row.id}`}
                      className="text-muted-foreground hover:text-accent inline-grid h-8 w-8 place-items-center rounded-sm transition-colors"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this record? This cannot be undone.")) {
                          remove.mutate(row.id);
                        }
                      }}
                      className="text-muted-foreground hover:text-destructive inline-grid h-8 w-8 place-items-center rounded-sm transition-colors"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return <AdminBadge tone={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</AdminBadge>;
}
