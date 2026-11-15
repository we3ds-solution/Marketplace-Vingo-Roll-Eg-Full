import type { Metadata } from "next";
import { SimpleEntityForm } from "@/components/admin/simple-entity-form";

export const metadata: Metadata = {
  title: "Edit color",
  robots: { index: false, follow: false },
};

export default function EditColorPage() {
  return (
    <SimpleEntityForm
      title="color"
      listEndpoint="/api/v1/admin/colors"
      fields={[
        { kind: "text", name: "name", label: "Name", required: true },
        { kind: "text", name: "hexCode", label: "Hex code", required: true, mono: true },
        { kind: "text", name: "family", label: "Family" },
        { kind: "number", name: "sortOrder", label: "Sort order" },
        { kind: "checkbox", name: "isActive", label: "Active" },
      ]}
    />
  );
}
