import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "Edit room",
  robots: { index: false, follow: false },
};

export default function EditRoomPage() {
  return (
    <SimpleEntityForm
      title="room"
      listEndpoint="/api/v1/admin/rooms"
      slugFrom="name"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "textarea", name: "description", label: "Description", rows: 2 },
        { kind: "url", name: "imageUrl", label: "Image URL" },
        { kind: "list", name: "recommendedCategorySlugs", label: "Recommended categories", placeholder: "drapery, sheers, wood-woven" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
