"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  hexCode: string;
  family: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminColorsPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Colors"
      description="The colour palette across all fabrics."
      newHref="/admin/colors/new"
      listEndpoint="/api/v1/admin/colors"
      searchable={false}
      queryKey="colors"
      columns={[
        { header: "Swatch", render: (r) => (
            <span
              className="border-border block h-8 w-12 rounded-sm border"
              style={{ backgroundColor: r.hexCode }}
              aria-hidden="true"
            />
          ) },
        { header: "Name", render: (r) => (
            <Link href={`/admin/colors/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
          ) },
        { header: "Hex", render: (r) => <span className="font-mono text-xs">{r.hexCode}</span>, className: "text-muted-foreground" },
        { header: "Family", render: (r) => r.family ?? "—", className: "text-muted-foreground" },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
