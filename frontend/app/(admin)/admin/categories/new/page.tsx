import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "New category",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <SimpleEntityForm
      title="New category"
      description="Add a product family."
      listEndpoint="/api/v1/admin/categories"
      slugFrom="name"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "text", name: "tagline", label: "Tagline" },
        { kind: "textarea", name: "description", label: "Description", rows: 3 },
        { kind: "url", name: "imageUrl", label: "Image URL" },
        { kind: "select", name: "group", label: "Group", options: [
          { value: "curtains", label: "curtains" },
          { value: "shades", label: "shades" },
          { value: "blinds", label: "blinds" },
          { value: "specialty", label: "specialty" },
        ] },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
