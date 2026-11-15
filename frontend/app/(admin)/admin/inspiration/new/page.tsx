import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-table";
import { InspirationForm } from "@/components/admin/inspiration-form";

export const metadata: Metadata = {
  title: "New story",
  robots: { index: false, follow: false },
};

export default function NewInspirationPage() {
  return (
    <>
      <AdminHeader title="New story" description="An editorial room with the exact products." />
      <InspirationForm />
    </>
  );
}
