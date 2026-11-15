"use client";

import { SimpleEntityAdmin, StatusBadge } from "@/components/admin/simple-entity-admin";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export default function AdminRoomsPage() {
  return (
    <SimpleEntityAdmin<Row>
      title="Rooms"
      description="Room-based shopping — living room, bedroom and beyond."
      newHref="/admin/rooms/new"
      listEndpoint="/api/v1/admin/rooms"
      queryKey="rooms"
      columns={[
        { header: "Name", render: (r) => (
            <div>
              <Link href={`/admin/rooms/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{r.slug}</p>
            </div>
          ) },
        { header: "Description", render: (r) => <span className="line-clamp-1 max-w-md">{r.description ?? "—"}</span>, className: "text-muted-foreground" },
        { header: "Products", render: (r) => r.productCount },
        { header: "Status", render: (r) => <StatusBadge active={r.isActive} /> },
      ]}
    />
  );
}
