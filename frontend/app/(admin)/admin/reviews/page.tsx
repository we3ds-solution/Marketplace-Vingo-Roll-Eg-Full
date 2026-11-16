"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import {
  AdminHeader,
  AdminEmpty,
  AdminTable,
  AdminTHead,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin/admin-table";
import { Trash2, Star } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  productSlug: string;
  productName: string;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => authedFetch<Row[]>("/api/v1/admin/reviews"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => authedFetch(`/api/v1/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: () => toast.error("Could not delete the review"),
  });

  return (
    <>
      <AdminHeader title="Reviews" description="Moderate what customers say about each piece." />

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <AdminEmpty title="No reviews yet" />
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>Rating</AdminTh>
            <AdminTh>Product</AdminTh>
            <AdminTh>Author</AdminTh>
            <AdminTh>Excerpt</AdminTh>
            <AdminTh className="w-20 text-end">Delete</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((r) => (
              <AdminTr key={r.id} className="hover:bg-muted/40 align-top">
                <AdminTd>
                  <span className="text-accent flex items-center gap-1 whitespace-nowrap">
                    {"★".repeat(r.rating)}
                    <span className="text-muted-foreground text-xs">({r.rating})</span>
                  </span>
                  {r.verified && <span className="text-muted-foreground mt-0.5 block text-[10px]">Verified purchase</span>}
                </AdminTd>
                <AdminTd>
                  <p className="font-medium">{r.productName}</p>
                  <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.productSlug}</p>
                </AdminTd>
                <AdminTd className="text-muted-foreground">{r.author}</AdminTd>
                <AdminTd className="max-w-md">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{r.body}</p>
                </AdminTd>
                <AdminTd className="text-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this review?")) {
                        remove.mutate(r.id);
                      }
                    }}
                    className="text-muted-foreground hover:text-destructive inline-grid h-8 w-8 place-items-center rounded-sm"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <p className="text-muted-foreground mt-4 text-xs">
        Deleting a review does not recompute the product’s aggregate rating — edit the product instead if it matters.
      </p>
    </>
  );
}
