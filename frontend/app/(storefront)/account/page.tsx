"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crumbs, PageHeader, Section, EmptyState } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { formatPrice } from "@/lib/utils";
import { LogOut, Package, ShieldCheck, User } from "lucide-react";

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
                  <Button asChild>
                    <Link href="/register">Create account</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
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
        <div className="grid gap-8 lg:grid-cols-3">
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

            <div className="mt-6 flex flex-col gap-2">
              {isAdmin && (
                <Button asChild variant="secondary" className="justify-start">
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                    Open admin dashboard
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="justify-start">
                <Link href="/wishlist">
                  <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                  View wishlist
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
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
                    <div className="text-right">
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
