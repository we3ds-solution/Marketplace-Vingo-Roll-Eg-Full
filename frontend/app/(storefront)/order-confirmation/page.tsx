"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { apiGetOrder } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";
import type { ApiOrder } from "@/lib/api/types";
import { CheckCircle2 } from "lucide-react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    apiGetOrder(orderId)
      .then((result) => {
        setOrder(result);
        setNotFound(result === null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Order Confirmed" }]} />
      <PageHeader
        eyebrow="Success"
        title="Order confirmed"
        description="Thank you for your order. We'll send you a confirmation email shortly."
      />
      <Section>
        <div className="max-w-2xl space-y-6">
          {loading ? (
            <div className="space-y-3">
              <div className="bg-muted h-24 animate-pulse rounded-sm" />
              <div className="bg-muted h-40 animate-pulse rounded-sm" />
            </div>
          ) : notFound ? (
            <p role="alert" className="text-muted-foreground">
              We couldn&apos;t find that order — it may belong to a different browsing session.
            </p>
          ) : order ? (
            <>
              <div className="bg-card border-border flex items-start gap-4 rounded-sm border p-6">
                <CheckCircle2 className="text-emerald-600 mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Order {order.orderNumber}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {order.customerEmail ? <> · Confirmation to {order.customerEmail}</> : null}
                  </p>
                  {order.shippingAddress && (
                    <address className="text-muted-foreground mt-3 text-sm not-italic leading-relaxed">
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 ? (
                        <>, {order.shippingAddress.line2}</>
                      ) : null}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode} {order.shippingAddress.country}
                    </address>
                  )}
                </div>
              </div>

              <ul className="border-border divide-border divide-y rounded-sm border">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-baseline justify-between gap-4 p-4 text-sm">
                    <span>
                      {item.productName}
                      {(item.materialName || item.sizeLabel || item.mount) && (
                        <span className="text-muted-foreground block text-xs">
                          {[item.materialName, item.colorName, item.sizeLabel, item.mount]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap">
                      × {item.quantity} · {formatPrice(item.totalPrice)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="bg-card border-border rounded-sm border p-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Your order is being processed. Our studio will confirm the details by email shortly.
            </p>
          )}

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading your order…</div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
