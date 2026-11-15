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
import { toast } from "sonner";

type Lead = {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  productSlug: string | null;
  source: string | null;
  createdAt: string;
};

const STATUSES = ["New", "Contacted", "Qualified", "Closed"] as const;

export default function AdminLeadsPage() {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", statusFilter, typeFilter],
    queryFn: () =>
      authedFetch<Lead[]>(
        `/api/v1/admin/leads?${new URLSearchParams({
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        })}`,
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      authedFetch(`/api/v1/admin/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      toast.success("Lead updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
    onError: () => toast.error("Could not update the lead"),
  });

  const statusTone = (s: string) =>
    s === "New" ? "amber" : s === "Contacted" ? "neutral" : s === "Qualified" ? "green" : "red";

  return (
    <>
      <AdminHeader title="Leads" description="Quote requests, swatch orders and consultations." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Quote">Quote</SelectItem>
            <SelectItem value="Swatches">Swatches</SelectItem>
            <SelectItem value="Consultation">Consultation</SelectItem>
            <SelectItem value="Contact">Contact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.length === 0 ? (
        <AdminEmpty title="No leads found" />
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>Lead</AdminTh>
            <AdminTh>Type</AdminTh>
            <AdminTh>Contact</AdminTh>
            <AdminTh>Message</AdminTh>
            <AdminTh>Received</AdminTh>
            <AdminTh>Status</AdminTh>
          </AdminTHead>
          <tbody>
            {data.map((l) => (
              <AdminTr key={l.id} className="align-top hover:bg-muted/40">
                <AdminTd>
                  <p className="font-medium">{l.name}</p>
                  {l.productSlug && <p className="text-muted-foreground mt-0.5 font-mono text-xs">{l.productSlug}</p>}
                  {l.source && <p className="text-muted-foreground text-[10px]">{l.source}</p>}
                </AdminTd>
                <AdminTd><AdminBadge>{l.type}</AdminBadge></AdminTd>
                <AdminTd>
                  <a href={`mailto:${l.email}`} className="hover:text-accent text-xs">{l.email}</a>
                  {l.phone && <a href={`tel:${l.phone}`} className="text-muted-foreground mt-0.5 block text-xs">{l.phone}</a>}
                </AdminTd>
                <AdminTd className="max-w-sm text-xs text-muted-foreground">{l.message}</AdminTd>
                <AdminTd className="text-muted-foreground text-xs">
                  {new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </AdminTd>
                <AdminTd>
                  <Select
                    value={l.status}
                    onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v })}
                  >
                    <SelectTrigger className="h-8 w-28" aria-label="Lead status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}
