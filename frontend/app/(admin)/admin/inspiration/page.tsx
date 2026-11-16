"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, Pencil } from "lucide-react";

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  roomSlug: string | null;
  style: string | null;
  sortOrder: number;
  isPublished: boolean;
  sectionCount: number;
  productCount: number;
};

export default function AdminInspirationPage() {
  const { authedFetch } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inspiration"],
    queryFn: () => authedFetch<StoryRow[]>("/api/v1/admin/inspiration"),
  });

  return (
    <>
      <AdminHeader
        title="Inspiration"
        description="Editorial stories — the lookbook behind the catalog."
        action={
          <Button asChild size="sm">
            <Link href="/admin/inspiration/new">
              <Plus className="me-1.5 h-4 w-4" aria-hidden="true" />
              New story
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <AdminEmpty title="No stories yet" description="Create the first editorial story." />
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>Title</AdminTh>
            <AdminTh>Room</AdminTh>
            <AdminTh>Style</AdminTh>
            <AdminTh>Sections</AdminTh>
            <AdminTh>Products</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="w-20 text-end">Edit</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((s) => (
              <AdminTr key={s.id} className="hover:bg-muted/40">
                <AdminTd>
                  <Link href={`/admin/inspiration/${s.id}`} className="hover:text-accent font-medium">{s.title}</Link>
                  <p className="text-muted-foreground mt-0.5 font-mono text-xs">{s.slug}</p>
                </AdminTd>
                <AdminTd className="text-muted-foreground">{s.roomSlug ?? "—"}</AdminTd>
                <AdminTd className="text-muted-foreground">{s.style ?? "—"}</AdminTd>
                <AdminTd>{s.sectionCount}</AdminTd>
                <AdminTd>{s.productCount}</AdminTd>
                <AdminTd><AdminBadge tone={s.isPublished ? "green" : "amber"}>{s.isPublished ? "Published" : "Draft"}</AdminBadge></AdminTd>
                <AdminTd className="text-end">
                  <Link href={`/admin/inspiration/${s.id}`} className="text-muted-foreground hover:text-accent inline-grid h-8 w-8 place-items-center rounded-sm" aria-label="Edit">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}
