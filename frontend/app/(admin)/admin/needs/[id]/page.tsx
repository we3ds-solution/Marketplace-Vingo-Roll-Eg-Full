import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "Edit need",
  robots: { index: false, follow: false },
};

export default function EditNeedPage() {
  return (
    <SimpleEntityForm
      title="need"
      listEndpoint="/api/v1/admin/needs"
      slugFrom="name"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "textarea", name: "description", label: "Description", rows: 2 },
        { kind: "text", name: "icon", label: "Icon" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
