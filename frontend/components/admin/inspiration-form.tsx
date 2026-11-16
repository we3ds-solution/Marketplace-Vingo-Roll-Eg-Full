"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminEmpty } from "@/components/admin/admin-table";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

type Section = { heading: string; body: string; imageUrl: string };

export function InspirationForm({ existingId }: { existingId?: string }) {
  const router = useRouter();
  const { authedFetch } = useAuth();
  const isEdit = Boolean(existingId);

  const detail = useQuery({
    queryKey: ["admin", "inspiration", existingId],
    queryFn: () => authedFetch<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      heroImageUrl: string | null;
      roomSlug: string | null;
      style: string | null;
      treatment: string | null;
      sortOrder: number;
      isPublished: boolean;
      sections: Section[];
      productSlugs: string[];
    }>(`/api/v1/admin/inspiration/${existingId}`),
    enabled: isEdit,
  });

  const products = useQuery({
    queryKey: ["admin", "products", "all-for-mention"],
    queryFn: () => authedFetch<{ items: Array<{ id: string; slug: string; name: string }>; total: number }>(
      "/api/v1/admin/products?pageSize=100",
    ),
  });

  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    heroImageUrl: "",
    roomSlug: "",
    style: "",
    treatment: "",
    sortOrder: 0,
    isPublished: true,
  });
  const [sections, setSections] = useState<Section[]>([{ heading: "", body: "", imageUrl: "" }]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!detail.data) return;
    setForm({
      slug: detail.data.slug,
      title: detail.data.title,
      excerpt: detail.data.excerpt ?? "",
      heroImageUrl: detail.data.heroImageUrl ?? "",
      roomSlug: detail.data.roomSlug ?? "",
      style: detail.data.style ?? "",
      treatment: detail.data.treatment ?? "",
      sortOrder: detail.data.sortOrder,
      isPublished: detail.data.isPublished,
    });
    setSections(detail.data.sections.length > 0 ? detail.data.sections : [{ heading: "", body: "", imageUrl: "" }]);
    setSelectedProducts(detail.data.productSlugs);
  }, [detail.data]);

  const toggleProduct = (slug: string) =>
    setSelectedProducts((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    const body = {
      ...form,
      excerpt: form.excerpt.trim() || null,
      heroImageUrl: form.heroImageUrl.trim() || null,
      roomSlug: form.roomSlug.trim() || null,
      style: form.style.trim() || null,
      treatment: form.treatment.trim() || null,
      sections: sections.filter((s) => s.body.trim()),
      productSlugs: selectedProducts,
    };

    setSaving(true);
    try {
      await authedFetch(isEdit ? `/api/v1/admin/inspiration/${existingId}` : "/api/v1/admin/inspiration", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      toast.success(isEdit ? "Story saved" : "Story created");
      router.push("/admin/inspiration");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the story");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && detail.isLoading) {
    return <div className="bg-muted h-96 animate-pulse rounded-sm" />;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" className="mt-1.5" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" className="mt-1.5 font-mono text-xs" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="room">Room</Label>
          <Input id="room" className="mt-1.5" placeholder="living-room" value={form.roomSlug} onChange={(e) => setForm((f) => ({ ...f, roomSlug: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="style">Style</Label>
          <Input id="style" className="mt-1.5" placeholder="Minimal" value={form.style} onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="treatment">Treatment</Label>
          <Input id="treatment" className="mt-1.5" placeholder="sheers" value={form.treatment} onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Input id="excerpt" className="mt-1.5" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="hero">Hero image URL</Label>
          <Input id="hero" className="mt-1.5 font-mono text-xs" value={form.heroImageUrl} onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="sort">Sort order</Label>
          <Input id="sort" type="number" min={0} className="mt-1.5" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))} />
        </div>
        <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={form.isPublished} onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: Boolean(v) }))} />
          Published
        </label>
      </div>

      {/* Sections */}
      <fieldset>
        <legend className="text-sm font-semibold">Story sections</legend>
        <div className="mt-3 space-y-3">
          {sections.map((section, i) => (
            <div key={i} className="border-border rounded-sm border p-3">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={section.heading}
                  placeholder={`Heading (optional) for section ${i + 1}`}
                  onChange={(e) =>
                    setSections((prev) => prev.map((s, j) => (j === i ? { ...s, heading: e.target.value } : s)))
                  }
                  aria-label={`Section ${i + 1} heading`}
                />
                <button
                  type="button"
                  onClick={() => setSections((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove section"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <Textarea
                className="mt-2"
                rows={3}
                value={section.body}
                placeholder="Body copy…"
                onChange={(e) =>
                  setSections((prev) => prev.map((s, j) => (j === i ? { ...s, body: e.target.value } : s)))
                }
                aria-label={`Section ${i + 1} body`}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setSections((prev) => [...prev, { heading: "", body: "", imageUrl: "" }])}
        >
          <Plus className="me-1.5 h-4 w-4" aria-hidden="true" />
          Add section
        </Button>
      </fieldset>

      {/* Products */}
      <fieldset>
        <legend className="text-sm font-semibold">Shop the look</legend>
        {products.isLoading ? (
          <div className="bg-muted mt-2 h-24 animate-pulse rounded-sm" />
        ) : (
          <div className="mt-2 grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {products.data?.items.map((p) => (
              <label key={p.slug} className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={selectedProducts.includes(p.slug)}
                  onCheckedChange={() => toggleProduct(p.slug)}
                  aria-label={p.name}
                />
                <span className="truncate">{p.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {isEdit && detail.data && detail.data.productSlugs.length === 0 && (
        <AdminEmpty title="No products linked" description="Tick products above — they'll appear as the 'Shop this room' grid." />
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save story" : "Create story"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/inspiration")}>Cancel</Button>
      </div>
    </form>
  );
}
