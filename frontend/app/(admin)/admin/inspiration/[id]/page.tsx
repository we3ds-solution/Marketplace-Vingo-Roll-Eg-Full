"use client";

import { useParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-table";
import { InspirationForm } from "@/components/admin/inspiration-form";

export default function EditInspirationPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <AdminHeader title="Edit story" description="Update the narrative and linked products." />
      <InspirationForm existingId={id} />
    </>
  );
}
