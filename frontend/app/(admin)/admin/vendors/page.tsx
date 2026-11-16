"use client";

import { useState } from "react";
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
  AdminBadge,
} from "@/components/admin/admin-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

type Row = {
  id: string;
  userId: string;
  companyName: string;
  message: string;
  status: string;
  userEmail: string;
  userDisplayName: string;
  createdAt: string;
  decidedAt: string | null;
};

const FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;

export default function AdminVendorsPage() {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "vendor-applications", statusFilter],
    queryFn: () =>
      authedFetch<Row[]>(
        `/api/v1/admin/vendor-applications${statusFilter !== "All" ? `?status=${statusFilter}` : ""}`,
      ),
  });

  const decide = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      action === "approve"
        ? authedFetch(`/api/v1/admin/vendor-applications/${id}/approve`, { method: "POST" })
        : authedFetch(`/api/v1/admin/vendor-applications/${id}/reject`, {
            method: "POST",
            body: JSON.stringify({ reason: null }),
          }),
    onSuccess: (_, { action }) => {
      toast.success(action === "approve" ? "Vendor approved — they've been notified" : "Application rejected — the applicant has been notified");
      queryClient.invalidateQueries({ queryKey: ["admin", "vendor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update the application"),
  });

  const tone = (s: string) => (s === "Pending" ? "amber" : s === "Approved" ? "green" : "red");

  return (
    <>
      <AdminHeader
        title="Vendor applications"
        description="Approve trade accounts — approval upgrades the account to Vendor and sends them a notification."
        action={
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 mb-4 rounded-sm border px-4 py-3 text-xs">
        Approving grants the <span className="font-semibold">Vendor</span> role. The applicant keeps shopping as a
        client until then and gets an in-app notification the moment you decide.
      </div>

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <AdminEmpty
          title={statusFilter === "Pending" ? "No pending applications" : "Nothing here yet"}
          description={statusFilter === "Pending" ? "Every application has been decided." : undefined}
        />
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>Company</AdminTh>
            <AdminTh>Applicant</AdminTh>
            <AdminTh>Message</AdminTh>
            <AdminTh>Applied</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-end">Decision</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((row) => (
              <AdminTr key={row.id} className="align-top hover:bg-muted/40">
                <AdminTd>
                  <p className="font-medium">{row.companyName}</p>
                </AdminTd>
                <AdminTd>
                  <p>{row.userDisplayName}</p>
                  <a href={`mailto:${row.userEmail}`} className="text-muted-foreground hover:text-accent text-xs">
                    {row.userEmail}
                  </a>
                </AdminTd>
                <AdminTd className="max-w-sm text-xs text-muted-foreground">
                  {row.message || <span className="italic opacity-60">No message</span>}
                </AdminTd>
                <AdminTd className="text-muted-foreground text-xs">
                  {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </AdminTd>
                <AdminTd><AdminBadge tone={tone(row.status)}>{row.status}</AdminBadge></AdminTd>
                <AdminTd className="text-end">
                  {row.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 border-emerald-600/40 text-emerald-600 hover:bg-emerald-600/10 dark:text-emerald-400"
                        onClick={() => decide.mutate({ id: row.id, action: "approve" })}
                        disabled={decide.isPending}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => decide.mutate({ id: row.id, action: "reject" })}
                        disabled={decide.isPending}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {row.decidedAt ? `Decided ${new Date(row.decidedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "—"}
                    </span>
                  )}
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}
