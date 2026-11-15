import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "Edit material",
  robots: { index: false, follow: false },
};

export default function EditMaterialPage() {
  return (
    <SimpleEntityForm
      title="material"
      listEndpoint="/api/v1/admin/materials"
      slugFrom="name"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "select", name: "tier", label: "Tier", options: [
          { value: "Essential", label: "Essential" },
          { value: "Signature", label: "Signature" },
          { value: "Couture", label: "Couture" },
        ] },
        { kind: "number", name: "priceDelta", label: "Price delta (USD)", required: true },
        { kind: "textarea", name: "description", label: "Description", rows: 2 },
        { kind: "url", name: "swatchImageUrl", label: "Swatch image URL" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
