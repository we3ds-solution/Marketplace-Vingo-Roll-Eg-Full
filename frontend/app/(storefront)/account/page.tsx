"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crumbs, PageHeader, Section, EmptyState } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useUIStore } from "@/stores/ui-store";
import { formatPrice } from "@/lib/utils";
import { LogOut, Package, ShieldCheck, User, Store, Clock3, XCircle } from "lucide-react";

type MyOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
};

export default function AccountPage() {
  const { user, status, isAdmin, signOut, authedFetch } = useAuth();
  const isVendor = user?.roles.includes("Vendor") ?? false;
  const vendorStatus = user?.vendorApplicationStatus ?? null;
  const [orders, setOrders] = useState<MyOrder[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    authedFetch<MyOrder[]>("/api/v1/orders/mine")
      .then((result) => {
        if (!cancelled) setOrders(result);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [status, authedFetch]);

  if (status === "loading") {
    return (
      <>
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <Section>
          <div className="bg-muted h-48 max-w-2xl animate-pulse rounded-sm" />
        </Section>
      </>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <>
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <PageHeader
          eyebrow="Account"
          title="Your account"
          description="Order history, saved items and trade access — one sign-in away."
        />
        <Section>
          <div className="max-w-2xl">
            <EmptyState
              title="You're browsing as a guest"
              description="Create an account to link orders and wishlists to you — or sign in if you already have one."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => useUIStore.getState().openAuthModal("register")}>Create account</Button>
                  <Button variant="outline" onClick={() => useUIStore.getState().openAuthModal("login")}>Sign in</Button>
                </div>
              }
            />
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
      <PageHeader
        eyebrow="Account"
        title={`Hello, ${user.displayName.split(" ")[0]}.`}
        description="Your profile, orders and saved designs."
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile */}
          <div className="bg-card border-border rounded-sm border p-6">
            <div className="flex items-center gap-4">
              <span className="bg-accent/10 text-accent grid h-14 w-14 place-items-center rounded-full">
                <User className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-semibold">{user.displayName}</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account</dt>
                <dd>Customer</dd>
              </div>
              {isVendor && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex items-center gap-1 text-accent">
                    <Store className="h-4 w-4" aria-hidden="true" />
                    Vendor
                  </dd>
                </div>
              )}
              {isAdmin && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex items-center gap-1 text-accent">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Studio admin
                  </dd>
                </div>
              )}
            </dl>

            {vendorStatus === "Pending" && (
              <div className="mt-4 flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Vendor application under review.</span> Our trade desk approves
                  applications within 1–2 business days — we&apos;ll send you an in-app message and upgrade your
                  account when it&apos;s approved.
                </span>
              </div>
            )}

            {vendorStatus === "Rejected" && (
              <div className="mt-4 flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Vendor application not approved.</span> Contact the studio if you
                  believe this is a mistake.
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {isAdmin && (
                <Button asChild variant="secondary" className="justify-start">
                  <Link href="/admin">
                    <ShieldCheck className="me-2 h-4 w-4" aria-hidden="true" />
                    Open admin dashboard
                  </Link>
                </Button>
              )}
              <button
                type="button"
                onClick={() => useUIStore.getState().openWishlist()}
                className="border-border hover:border-accent inline-flex w-full items-center justify-start gap-2 rounded-sm border px-4 py-2 text-sm transition-colors"
              >
                <Package className="me-2 h-4 w-4" aria-hidden="true" />
                View wishlist
              </button>
              <Button variant="ghost" className="justify-start" onClick={() => void signOut()}>
                <LogOut className="me-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-card border-border rounded-sm border p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold">Your orders</h2>
            {orders === null ? (
              <div className="bg-muted mt-4 h-28 animate-pulse rounded-sm" />
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  Nothing yet — every made-to-order piece starts with a swatch.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/shop">Browse treatments</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-border divide-y text-sm">
                {orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <Link
                        href={`/order-confirmation?order=${order.id}`}
                        className="hover:text-accent font-medium underline-offset-4 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      <p className="text-muted-foreground text-xs">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted-foreground mt-6 text-xs">
              Orders placed as a guest won&apos;t appear here — link future orders by signing in before checkout.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
