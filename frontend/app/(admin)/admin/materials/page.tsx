"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  priceDelta: number;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminMaterialsPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Materials"
      description="Fabric tiers and their price deltas — essential to couture."
      newHref="/admin/materials/new"
      listEndpoint="/api/v1/admin/materials"
      searchable={false}
      queryKey="materials"
      columns={[
        { header: "Name", render: (r) => (
            <div>
              <Link href={`/admin/materials/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.slug}</p>
            </div>
          ) },
        { header: "Tier", render: (r) => r.tier },
        { header: "Delta", render: (r) => formatPrice(r.priceDelta) },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
