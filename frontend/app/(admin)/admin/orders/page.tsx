"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  shippingMethod: string | null;
};

type ListResponse = { items: OrderRow[]; total: number; page: number; pageSize: number };

const STATUSES = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as const;

export default function AdminOrdersPage() {
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", statusFilter, page],
    queryFn: () =>
      authedFetch<ListResponse>(
        `/api/v1/admin/orders?${new URLSearchParams({
          page: String(page),
          pageSize: "20",
          ...(statusFilter !== "All" ? { status: statusFilter } : {}),
        })}`,
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      authedFetch(`/api/v1/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Could not update the order"),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1;
  const tone = (s: string) =>
    s === "Pending" ? "amber" : s === "Delivered" ? "green" : s === "Cancelled" || s === "Refunded" ? "red" : "neutral";

  return (
    <>
      <AdminHeader title="Orders" description="Made-to-order fulfilment queue." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">{data?.total ?? 0} order(s)</p>
      </div>

      {isLoading ? (
        <div className="bg-muted h-64 animate-pulse rounded-sm" />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No orders found" />
      ) : (
        <>
          <AdminTable>
            <AdminTHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Items</AdminTh>
              <AdminTh className="text-right">Total</AdminTh>
              <AdminTh>Placed</AdminTh>
              <AdminTh>Status</AdminTh>
            </AdminTHead>
            <tbody>
              {data.items.map((o) => (
                <AdminTr key={o.id} className="hover:bg-muted/40">
                  <AdminTd>
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-accent font-medium">{o.orderNumber}</Link>
                  </AdminTd>
                  <AdminTd>
                    <p>{o.customerName ?? "Guest"}</p>
                    <p className="text-muted-foreground text-xs">{o.customerEmail}</p>
                  </AdminTd>
                  <AdminTd>{o.itemCount}</AdminTd>
                  <AdminTd className="text-right tabular-nums">{formatPrice(o.totalAmount)}</AdminTd>
                  <AdminTd className="text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-2">
                      <AdminBadge tone={tone(o.status)}>{o.status}</AdminBadge>
                      <Select
                        value={o.status}
                        onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v })}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs" aria-label="Order status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.filter((s) => s !== "All").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>

          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
}
