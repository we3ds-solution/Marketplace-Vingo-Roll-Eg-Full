"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { formatPrice } from "@/lib/utils";
import { AdminHeader, AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, AdminBadge } from "@/components/admin/admin-table";
import {
  Package,
  FolderTree,
  Layers,
  ShoppingBag,
  Inbox,
  Mail,
  Star,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

type Stats = {
  products: number;
  activeProducts: number;
  categories: number;
  collections: number;
  orders: number;
  pendingOrders: number;
  leads: number;
  newLeads: number;
  subscribers: number;
  reviews: number;
  stories: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    customerName: string | null;
    totalAmount: number;
    createdAt: string;
  }>;
};

type CardDef = {
  key: keyof Pick<
    Stats,
    "products" | "categories" | "collections" | "orders" | "leads" | "subscribers" | "reviews" | "stories"
  > & string;
  label: string;
  icon: LucideIcon;
  href: string;
  sub?: keyof Pick<Stats, "pendingOrders" | "newLeads"> & string;
  subLabel?: string;
};

const CARDS: CardDef[] = [
  { key: "products", label: "Products", icon: Package, href: "/admin/products" },
  { key: "categories", label: "Categories", icon: FolderTree, href: "/admin/categories" },
  { key: "collections", label: "Collections", icon: Layers, href: "/admin/collections" },
  { key: "orders", label: "Orders", icon: ShoppingBag, href: "/admin/orders", sub: "pendingOrders", subLabel: "pending" },
  { key: "leads", label: "Leads", icon: Inbox, href: "/admin/leads", sub: "newLeads", subLabel: "new" },
  { key: "subscribers", label: "Subscribers", icon: Mail, href: "/admin/subscribers" },
  { key: "reviews", label: "Reviews", icon: Star, href: "/admin/reviews" },
  { key: "stories", label: "Stories", icon: Newspaper, href: "/admin/inspiration" },
];

export default function AdminDashboardPage() {
  const { authedFetch } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => authedFetch<Stats>("/api/v1/admin/stats"),
  });

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Studio overview — catalog, orders and marketing in one place."
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-muted h-28 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const value = data[card.key] as number;
            const subValue = card.sub ? (data[card.sub] as number) : null;
            return (
              <Link
                key={card.key}
                href={card.href}
                className="bg-card border-border hover:border-accent group rounded-sm border p-5 transition-colors"
              >
                <Icon className="text-muted-foreground group-hover:text-accent h-5 w-5 transition-colors" aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {card.label}
                  {subValue !== null && subValue > 0 && (
                    <span className="text-amber-600 dark:text-amber-400"> · {subValue} {card.subLabel}</span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-accent text-xs underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        {!data || data.recentOrders.length === 0 ? (
          <p className="text-muted-foreground border-border rounded-sm border border-dashed px-6 py-10 text-center text-sm">
            No orders yet — when the pilot store launches, they&apos;ll appear here.
          </p>
        ) : (
          <AdminTable>
            <AdminTHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh className="text-right">Total</AdminTh>
              <AdminTh>Placed</AdminTh>
            </AdminTHead>
            <tbody>
              {data.recentOrders.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:text-accent font-medium"
                    >
                      {order.orderNumber}
                    </Link>
                  </AdminTd>
                  <AdminTd>{order.customerName ?? "Guest"}</AdminTd>
                  <AdminTd>
                    <AdminBadge tone={order.status === "Pending" ? "amber" : "neutral"}>
                      {order.status}
                    </AdminBadge>
                  </AdminTd>
                  <AdminTd className="text-right tabular-nums">{formatPrice(order.totalAmount)}</AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </div>
    </>
  );
}
