"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  group: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminCategoriesPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Categories"
      description="Curtain, shade and blind families — the shop navigation."
      newHref="/admin/categories/new"
      listEndpoint="/api/v1/admin/categories"
      queryKey="categories"
      columns={[
        { header: "Name", render: (r) => (
            <div>
              <Link href={`/admin/categories/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.slug}</p>
            </div>
          ) },
        { header: "Group", render: (r) => r.group ?? "—", className: "text-muted-foreground" },
        { header: "Tagline", render: (r) => r.tagline ?? "—", className: "text-muted-foreground" },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
