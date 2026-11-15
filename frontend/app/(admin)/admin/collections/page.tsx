"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  slug: string;
  mood: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminCollectionsPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Collections"
      description="Curated edits — the designer, minimal and seasonal groupings."
      newHref="/admin/collections/new"
      listEndpoint="/api/v1/admin/collections"
      queryKey="collections"
      columns={[
        { header: "Name", render: (r) => (
            <div>
              <Link href={`/admin/collections/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.slug}</p>
            </div>
          ) },
        { header: "Mood", render: (r) => r.mood ?? "—", className: "text-muted-foreground" },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
