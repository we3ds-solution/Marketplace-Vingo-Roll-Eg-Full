"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { formatPrice } from "@/lib/utils";
import { AdminBadge, AdminTable, AdminTHead, AdminTd, AdminTh, AdminTr } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  items: Array<{
    productName: string;
    productSlug: string;
    materialName: string | null;
    colorName: string | null;
    sizeLabel: string | null;
    mount: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  statusHistory: Array<{ status: string; notes: string | null; createdAt: string }>;
};

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as const;

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => authedFetch<OrderDetail>(`/api/v1/admin/orders/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    setNotes(data?.internalNotes ?? "");
  }, [data?.internalNotes]);

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      authedFetch(`/api/v1/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Could not update status"),
  });

  const saveNotes = useMutation({
    mutationFn: (internalNotes: string) =>
      authedFetch(`/api/v1/admin/orders/${id}/notes`, { method: "PATCH", body: JSON.stringify({ internalNotes }) }),
    onSuccess: () => {
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
    },
    onError: () => toast.error("Could not save notes"),
  });

  if (isLoading) return <div className="bg-muted h-96 animate-pulse rounded-sm" />;
  if (error || !data) return <p role="alert" className="text-destructive text-sm">Order not found.</p>;

  const tone = (s: string) =>
    s === "Pending" ? "amber" : s === "Delivered" ? "green" : s === "Cancelled" || s === "Refunded" ? "red" : "neutral";

  return (
    <>
      <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        Orders
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.orderNumber}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Placed {new Date(data.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
            {" "}· {data.shippingMethod ?? "standard"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminBadge tone={tone(data.status)}>{data.status}</AdminBadge>
          <Select value={data.status} onValueChange={(v) => updateStatus.mutate(v)}>
            <SelectTrigger className="w-40" aria-label="Order status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — items + totals */}
        <div className="space-y-6 lg:col-span-2">
          <AdminTable>
            <AdminTHead>
              <AdminTh>Item</AdminTh>
              <AdminTh className="text-end">Qty</AdminTh>
              <AdminTh className="text-end">Total</AdminTh>
            </AdminTHead>
            <tbody>
              {data.items.map((item, i) => (
                <AdminTr key={i}>
                  <AdminTd>
                    <Link href={`/admin/products`} className="hover:text-accent font-medium">{item.productName}</Link>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {[item.materialName, item.colorName, item.sizeLabel, item.mount].filter(Boolean).join(" · ")}
                    </p>
                  </AdminTd>
                  <AdminTd className="text-end">{item.quantity}</AdminTd>
                  <AdminTd className="text-end tabular-nums">{formatPrice(item.totalPrice)}</AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>

          <div className="bg-card border-border rounded-sm border p-6 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(data.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{data.shippingCost === 0 ? "FREE" : formatPrice(data.shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(data.taxAmount)}</span></div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span>{formatPrice(data.totalAmount)}</span></div>
          </div>

          {/* Status history */}
          <div>
            <h2 className="mb-2 text-sm font-semibold">Status history</h2>
            <ol className="border-border divide-border divide-y rounded-sm border text-sm">
              {data.statusHistory.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span>
                    <span className="font-medium">{h.status}</span>
                    {h.notes && <span className="text-muted-foreground"> — {h.notes}</span>}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right — customer + notes */}
        <div className="space-y-6">
          <div className="bg-card border-border rounded-sm border p-6">
            <h2 className="text-sm font-semibold">Customer</h2>
            {data.shippingAddress ? (
              <>
                <p className="mt-3 font-medium">{data.customerName}</p>
                <address className="text-muted-foreground mt-2 text-sm not-italic leading-relaxed">
                  {data.shippingAddress.line1}
                  {data.shippingAddress.line2 ? <>, {data.shippingAddress.line2}</> : null}
                  <br />
                  {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postalCode} {data.shippingAddress.country}
                </address>
                <div className="text-muted-foreground mt-3 space-y-1 text-xs">
                  {data.customerEmail && <a className="hover:text-accent block" href={`mailto:${data.customerEmail}`}>{data.customerEmail}</a>}
                  {data.customerPhone && <a className="hover:text-accent block" href={`tel:${data.customerPhone}`}>{data.customerPhone}</a>}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">Guest order without shipping address.</p>
            )}
            {data.customerNotes && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Customer notes</h3>
                <p className="text-muted-foreground mt-1 text-sm">{data.customerNotes}</p>
              </div>
            )}
          </div>

          <div className="bg-card border-border rounded-sm border p-6">
            <Label htmlFor="internal-notes" className="text-sm font-semibold">Internal notes</Label>
            <Textarea
              id="internal-notes"
              rows={4}
              className="mt-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private studio notes — never shown to the customer."
            />
            <Button size="sm" variant="outline" className="mt-3" onClick={() => saveNotes.mutate(notes)} disabled={saveNotes.isPending}>
              {saveNotes.isPending ? "Saving…" : "Save notes"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
