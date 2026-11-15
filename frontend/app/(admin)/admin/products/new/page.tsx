import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-table";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default function AdminNewProductPage() {
  return (
    <>
      <div className="mb-4">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Products
        </Link>
      </div>
      <AdminHeader title="New product" description="Add a made-to-order piece to the catalog." />
      <ProductForm />
    </>
  );
}
