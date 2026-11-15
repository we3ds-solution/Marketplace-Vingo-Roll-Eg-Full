import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "New color",
  robots: { index: false, follow: false },
};

export default function NewColorPage() {
  return (
    <SimpleEntityForm
      title="New color"
      description="A swatch for the palette."
      listEndpoint="/api/v1/admin/colors"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "text", name: "hexCode", label: "Hex code", required: true, mono: true, placeholder: "#EFE6D6" },
        { kind: "text", name: "family", label: "Family", placeholder: "Ivory" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
