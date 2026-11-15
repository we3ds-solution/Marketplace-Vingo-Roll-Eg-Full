"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crumbs, PageHeader, Section, EmptyState } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { cartSubtotal, useCartStore } from "@/stores/cart-store";
import { apiCreateOrder, ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

type CheckoutAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const PAYMENT_LABELS: Record<string, string> = {
  quote: "Invoice me",
  card: "Credit card (demo)",
  cod: "Pay on delivery",
};

export default function CheckoutReviewPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const refresh = useCartStore((s) => s.refresh);

  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [payment, setPayment] = useState("quote");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
    try {
      const raw = sessionStorage.getItem("checkout_address");
      setAddress(raw ? (JSON.parse(raw) as CheckoutAddress) : null);
      setPayment(sessionStorage.getItem("checkout_payment") ?? "quote");
    } catch {
      setAddress(null);
    }
  }, [refresh]);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 45;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error("Missing shipping details — please start from the cart");
      router.push("/checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const order = await apiCreateOrder({
        customerName: `${address.firstName} ${address.lastName}`.trim(),
        customerEmail: address.email,
        customerPhone: address.phone,
        paymentMethod: payment,
        shippingMethod: "standard",
        street1: address.street1,
        street2: address.street2 || undefined,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country ?? "US",
      });

      sessionStorage.removeItem("checkout_address");
      sessionStorage.removeItem("checkout_payment");
      await refresh();
      router.push(`/order-confirmation?order=${order.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not place your order — please try again.",
      );
      setPlacing(false);
    }
  };

  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
          { label: "Review" },
        ]}
      />
      <PageHeader
        eyebrow="Step 3 of 3"
        title="Review your order"
        description="Review your order before confirming."
      />
      <Section>
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add treatments before reviewing your order."
            action={
              <Button asChild>
                <Link href="/shop">Browse treatments</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2 max-w-2xl">
              {/* Items */}
              <div className="border-border overflow-hidden rounded-sm border">
                <ul className="divide-border divide-y">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-4 p-4">
                      <Image
                        src={item.image}
                        alt=""
                        aria-hidden="true"
                        width={72}
                        height={90}
                        quality={60}
                        className="bg-muted h-20 w-16 rounded-sm object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {Object.entries(item.options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Address */}
              <div className="bg-card border-border rounded-sm border p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">Shipping address</h3>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/checkout">Edit</Link>
                  </Button>
                </div>
                {address ? (
                  <address className="text-muted-foreground mt-3 text-sm not-italic leading-relaxed">
                    {address.firstName} {address.lastName}
                    <br />
                    {address.street1}
                    {address.street2 ? <>, {address.street2}</> : null}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.email} · {address.phone}
                  </address>
                ) : (
                  <p className="text-muted-foreground mt-3 text-sm">
                    No address on file — go back and enter your details.
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="bg-card border-border rounded-sm border p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">Payment method</h3>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/checkout/payment">Edit</Link>
                  </Button>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {PAYMENT_LABELS[payment] ?? payment}
                </p>
              </div>

              {error && (
                <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-sm border px-4 py-3 text-sm">
                  {error}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="sticky top-24 h-fit bg-card rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold mb-4">Order total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base pt-4 mt-4 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing || !address}
              >
                {placing ? "Placing your order…" : "Place order"}
              </Button>
              <p className="text-muted-foreground mt-4 text-xs">
                No payment is taken — this is a demonstration site.
              </p>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
