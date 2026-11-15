"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  slug: string;
  label: string;
  widthInches: number;
  heightInches: number;
  priceDelta: number;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminSizesPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Sizes"
      description="Standard drop sizes and their price deltas."
      newHref="/admin/sizes/new"
      listEndpoint="/api/v1/admin/sizes"
      searchable={false}
      queryKey="sizes"
      columns={[
        { header: "Label", render: (r) => (
            <Link href={`/admin/sizes/${r.id}`} className="hover:text-accent font-medium">{r.label}</Link>
          ) },
        { header: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span>, className: "text-muted-foreground" },
        { header: "Delta", render: (r) => formatPrice(r.priceDelta) },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
