import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "Edit collection",
  robots: { index: false, follow: false },
};

export default function EditCollectionPage() {
  return (
    <SimpleEntityForm
      title="collection"
      listEndpoint="/api/v1/admin/collections"
      slugFrom="name"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "text", name: "mood", label: "Mood" },
        { kind: "textarea", name: "story", label: "Story", rows: 3 },
        { kind: "textarea", name: "description", label: "Description", rows: 2 },
        { kind: "url", name: "imageUrl", label: "Image URL" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
