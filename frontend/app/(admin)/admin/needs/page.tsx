"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminNeedsPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Needs"
      description="Problem-based shopping — blackout, privacy, heat and more."
      newHref="/admin/needs/new"
      listEndpoint="/api/v1/admin/needs"
      queryKey="needs"
      columns={[
        { header: "Name", render: (r) => (
            <div>
              <Link href={`/admin/needs/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.slug}</p>
            </div>
          ) },
        { header: "Icon", render: (r) => <span className="font-mono text-xs">{r.icon ?? "—"}</span>, className: "text-muted-foreground" },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
