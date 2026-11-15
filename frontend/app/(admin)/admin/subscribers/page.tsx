"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import {
  AdminHeader,
  AdminTable,
  AdminTHead,
  AdminTd,
  AdminTh,
  AdminTr,
  AdminBadge,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Row = {
  id: string;
  email: string;
  isActive: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
};

export default function AdminSubscribersPage() {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: () => authedFetch<Row[]>("/api/v1/admin/subscribers"),
  });

  const unsubscribe = useMutation({
    mutationFn: (id: string) => authedFetch(`/api/v1/admin/subscribers/${id}/unsubscribe`, { method: "PATCH" }),
    onSuccess: () => {
      toast.success("Subscriber unsubscribed");
      queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
    },
    onError: () => toast.error("Could not update subscriber"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => authedFetch(`/api/v1/admin/subscribers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Subscriber removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
    },
    onError: () => toast.error("Could not delete subscriber"),
  });

  return (
    <>
      <AdminHeader title="Newsletter subscribers" description="Everyone who joined via the storefront journal signup." />

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-sm border border-dashed px-6 py-12 text-center text-sm">
          No subscribers yet.
        </p>
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>Email</AdminTh>
            <AdminTh>Joined</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((s) => (
              <AdminTr key={s.id}>
                <AdminTd>{s.email}</AdminTd>
                <AdminTd className="text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </AdminTd>
                <AdminTd><AdminBadge tone={s.isActive ? "green" : "red"}>{s.isActive ? "Subscribed" : "Unsubscribed"}</AdminBadge></AdminTd>
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {s.isActive && (
                      <Button variant="outline" size="sm" onClick={() => unsubscribe.mutate(s.id)}>
                        Unsubscribe
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Delete this subscriber record?")) remove.mutate(s.id);
                      }}
                    >
                      Delete
                    </Button>
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
