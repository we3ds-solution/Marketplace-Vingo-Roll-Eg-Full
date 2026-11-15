import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "New size",
  robots: { index: false, follow: false },
};

export default function NewSizePage() {
  return (
    <SimpleEntityForm
      title="New size"
      description="A standard drop size and its price delta."
      listEndpoint="/api/v1/admin/sizes"
      fields={[
        { kind: "slug", name: "slug", label: "Slug", required: true, mono: true },
        { kind: "text", name: "label", label: "Label", required: true, placeholder: '50" × 84"' },
        { kind: "number", name: "widthInches", label: "Width (in)", required: true },
        { kind: "number", name: "heightInches", label: "Height (in)", required: true },
        { kind: "number", name: "priceDelta", label: "Price delta (USD)", required: true },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
