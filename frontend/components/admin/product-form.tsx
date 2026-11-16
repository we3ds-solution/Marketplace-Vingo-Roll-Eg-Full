"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ImagePlus, Star, Trash2 } from "lucide-react";

export type ProductUpsertPayload = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  lightControl: string;
  installation: string;
  motorized: boolean;
  stockStatus: string;
  styles: string[];
  features: string[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isActive: boolean;
  materialIds: string[];
  colorIds: string[];
  sizeIds: string[];
  roomIds: string[];
  needIds: string[];
  collectionIds: string[];
};

export type ProductFormValues = ProductUpsertPayload;

const EMPTY: ProductFormValues = {
  slug: "",
  name: "",
  shortDescription: "",
  longDescription: "",
  price: 0,
  compareAtPrice: null,
  categoryId: null,
  lightControl: "LightFiltering",
  installation: "both",
  motorized: false,
  stockStatus: "in-stock",
  styles: [],
  features: [],
  specifications: {},
  isFeatured: false,
  isBestseller: false,
  isNewArrival: false,
  isOnSale: false,
  isActive: true,
  materialIds: [],
  colorIds: [],
  sizeIds: [],
  roomIds: [],
  needIds: [],
  collectionIds: [],
};

type Option = { id: string; name: string };
type CategoryOption = { id: string; name: string; slug: string };
type SizeOption = { id: string; label: string; slug: string };
type ColorOption = { id: string; name: string; hexCode: string };
type MaterialOption = { id: string; name: string; tier: string };
type CollectionOption = { id: string; name: string };
type ProductImage = { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number };

export type ProductFormDto = ProductFormValues & {
  id: string;
  images: ProductImage[];
  rating: number;
  reviewCount: number;
};

const inputCls = "mt-1.5";

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; label: string; hint?: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm border px-2.5 py-2 text-xs transition-colors",
                checked ? "border-accent bg-accent/10" : "border-border hover:border-accent",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(v) =>
                  onChange(v ? [...selected, option.id] : selected.filter((id) => id !== option.id))
                }
                aria-label={option.label}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{option.label}</span>
                {option.hint && <span className="text-muted-foreground truncate text-[10px]">{option.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProductForm({
  initial,
  onSaved,
}: {
  initial?: ProductFormDto;
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authedFetch } = useAuth();

  const [values, setValues] = useState<ProductFormValues>(() =>
    initial ? { ...initial } : { ...EMPTY },
  );
  const [stylesInput, setStylesInput] = useState((initial?.styles ?? []).join(", "));
  const [featuresInput, setFeaturesInput] = useState((initial?.features ?? []).join("\n"));
  const [specsInput, setSpecsInput] = useState(
    Object.entries(initial?.specifications ?? {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n"),
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = Boolean(initial?.id);

  const options = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: async () => {
      const [materials, colors, sizes, rooms, needs, collections, categories] = await Promise.all([
        authedFetch<MaterialOption[]>("/api/v1/admin/materials"),
        authedFetch<ColorOption[]>("/api/v1/admin/colors"),
        authedFetch<SizeOption[]>("/api/v1/admin/sizes"),
        authedFetch<Option[]>("/api/v1/admin/rooms"),
        authedFetch<Option[]>("/api/v1/admin/needs"),
        authedFetch<CollectionOption[]>("/api/v1/admin/collections"),
        authedFetch<CategoryOption[]>("/api/v1/admin/categories"),
      ]);
      return { materials, colors, sizes, rooms, needs, collections, categories };
    },
  });

  useEffect(() => {
    setStylesInput(values.styles.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useMutation({
    mutationFn: async (payload: ProductFormPayload) => {
      const specEntries = specsInput
        .split("\n")
        .map((line) => {
          const idx = line.indexOf(":");
          if (idx <= 0) return null;
          return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] as const;
        })
        .filter((entry): entry is readonly [string, string] => entry !== null && entry[0].length > 0);

      const body = {
        ...payload,
        compareAtPrice: payload.compareAtPrice && payload.compareAtPrice > 0 ? payload.compareAtPrice : null,
        longDescription: payload.longDescription?.trim() || null,
        styles: stylesInput.split(",").map((s) => s.trim()).filter(Boolean),
        features: featuresInput.split("\n").map((s) => s.trim()).filter(Boolean),
        specifications: Object.fromEntries(specEntries),
      };

      if (isEdit) {
        return authedFetch<ProductFormDto>(`/api/v1/admin/products/${initial!.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      }

      return authedFetch<ProductFormDto>("/api/v1/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (saved) => {
      toast.success(isEdit ? "Product saved" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      if (onSaved) onSaved(saved.id);
      if (!isEdit) router.push(`/admin/products/${saved.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save the product");
    },
  });

  const images = useQuery({
    queryKey: ["admin", "product", initial?.id, "images"],
    queryFn: () => authedFetch<ProductFormDto>(`/api/v1/admin/products/${initial!.id}`),
    enabled: isEdit,
  });

  const addImage = useMutation({
    mutationFn: () => {
      if (!imageUrl.trim()) {
        throw new Error("Paste an image URL first");
      }
      return authedFetch(`/api/v1/admin/products/${initial!.id}/images`, {
        method: "POST",
        body: JSON.stringify({ url: imageUrl.trim(), alt: imageAlt.trim() || null, isPrimary: false }),
      });
    },
    onSuccess: () => {
      setImageUrl("");
      setImageAlt("");
      toast.success("Image added");
      queryClient.invalidateQueries({ queryKey: ["admin", "product", initial?.id, "images"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add image"),
  });

  const removeImage = useMutation({
    mutationFn: (imageId: string) =>
      authedFetch(`/api/v1/admin/products/${initial!.id}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Image removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "product", initial?.id, "images"] });
    },
    onError: () => toast.error("Could not remove the image"),
  });

  const setPrimary = useMutation({
    mutationFn: (imageId: string) =>
      authedFetch(`/api/v1/admin/products/${initial!.id}/images/${imageId}/primary`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Primary image updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "product", initial?.id, "images"] });
    },
    onError: () => toast.error("Could not update the primary image"),
  });

  const optionGroups = useMemo(() => {
    if (!options.data) return [];
    const d = options.data;
    return [
      {
        label: "Materials",
        key: "materialIds" as const,
        options: d.materials.map((m) => ({ id: m.id, label: m.name, hint: m.tier })),
      },
      {
        label: "Colors",
        key: "colorIds" as const,
        options: d.colors.map((c) => ({ id: c.id, label: c.name, hint: c.hexCode })),
      },
      {
        label: "Sizes",
        key: "sizeIds" as const,
        options: d.sizes.map((s) => ({ id: s.id, label: s.label })),
      },
      {
        label: "Rooms",
        key: "roomIds" as const,
        options: d.rooms.map((r) => ({ id: r.id, label: r.name })),
      },
      {
        label: "Needs",
        key: "needIds" as const,
        options: d.needs.map((n) => ({ id: n.id, label: n.name })),
      },
      {
        label: "Collections",
        key: "collectionIds" as const,
        options: d.collections.map((c) => ({ id: c.id, label: c.name })),
      },
    ];
  }, [options.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Name is required";
    if (!values.slug.trim()) next.slug = "Slug is required";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim())) next.slug = "Use lowercase letters, numbers and hyphens";
    if (!values.shortDescription.trim()) next.shortDescription = "Short description is required";
    if (!(values.price > 0)) next.price = "Price must be greater than zero";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    save.mutate({ ...values });
  };

  const field = (name: string) => (errors[name] ? "border-destructive" : "");

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:gap-8 xl:grid-cols-[1.5fr_1fr]">
      {/* Left column — core details */}
      <div className="space-y-5">
        <section className="bg-card border-border rounded-sm border p-6">
          <h2 className="text-sm font-semibold">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" className={`${inputCls} ${field("name")}`} value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
              {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" className={`${inputCls} font-mono text-xs ${field("slug")}`} value={values.slug} onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))} />
              {errors.slug && <p className="text-destructive mt-1 text-xs">{errors.slug}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="short">Short description</Label>
              <Input id="short" className={`${inputCls} ${field("shortDescription")}`} value={values.shortDescription} onChange={(e) => setValues((v) => ({ ...v, shortDescription: e.target.value }))} />
              {errors.shortDescription && <p className="text-destructive mt-1 text-xs">{errors.shortDescription}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="long">Long description</Label>
              <Textarea id="long" rows={3} className={inputCls} value={values.longDescription ?? ""} onChange={(e) => setValues((v) => ({ ...v, longDescription: e.target.value }))} />
            </div>
          </div>
        </section>

        <section className="bg-card border-border rounded-sm border p-6">
          <h2 className="text-sm font-semibold">Pricing & merchandising</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min="0" step="0.01" className={`${inputCls} ${field("price")}`} value={values.price} onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) || 0 }))} />
              {errors.price && <p className="text-destructive mt-1 text-xs">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="compareAt">Compare-at price</Label>
              <Input id="compareAt" type="number" min="0" step="0.01" className={inputCls} value={values.compareAtPrice ?? ""} onChange={(e) => setValues((v) => ({ ...v, compareAtPrice: e.target.value === "" ? null : Number(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={values.categoryId ?? "none"} onValueChange={(v) => setValues((s) => ({ ...s, categoryId: v === "none" ? null : v }))}>
                <SelectTrigger id="category" className="mt-1.5">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {options.data?.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="light">Light control</Label>
              <Select value={values.lightControl} onValueChange={(v) => setValues((s) => ({ ...s, lightControl: v }))}>
                <SelectTrigger id="light" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sheer">Sheer</SelectItem>
                  <SelectItem value="LightFiltering">Light filtering</SelectItem>
                  <SelectItem value="Blackout">Blackout</SelectItem>
                  <SelectItem value="RoomDarkening">Room darkening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Stock status</Label>
              <Select value={values.stockStatus} onValueChange={(v) => setValues((s) => ({ ...s, stockStatus: v }))}>
                <SelectTrigger id="stock" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In stock</SelectItem>
                  <SelectItem value="made-to-order">Made to order</SelectItem>
                  <SelectItem value="low-stock">Low stock</SelectItem>
                  <SelectItem value="sold-out">Sold out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="install">Installation</Label>
              <Select value={values.installation} onValueChange={(v) => setValues((s) => ({ ...s, installation: v }))}>
                <SelectTrigger id="install" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">DIY or professional</SelectItem>
                  <SelectItem value="diy">DIY only</SelectItem>
                  <SelectItem value="professional">Professional only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {([
              ["motorized", "Motorized"],
              ["isFeatured", "Featured"],
              ["isBestseller", "Bestseller"],
              ["isNewArrival", "New arrival"],
              ["isOnSale", "On sale"],
              ["isActive", "Active"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={Boolean(values[key as keyof ProductFormValues])}
                  onCheckedChange={(v) => setValues((s) => ({ ...s, [key]: Boolean(v) }))}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="mt-4">
            <Label htmlFor="styles">Styles (comma-separated)</Label>
            <Input id="styles" className={inputCls} value={stylesInput} onChange={(e) => setStylesInput(e.target.value)} placeholder="Minimal, Natural" />
          </div>
        </section>

        <section className="bg-card border-border rounded-sm border p-6">
          <h2 className="text-sm font-semibold">Content</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" rows={4} className={inputCls} value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} placeholder={"Made to order in our own workroom\nWeighted, hand-finished hem"} />
            </div>
            <div>
              <Label htmlFor="specs">Specifications (Key: value per line)</Label>
              <Textarea id="specs" rows={5} className={`${inputCls} font-mono text-xs`} value={specsInput} onChange={(e) => setSpecsInput(e.target.value)} placeholder={"Composition: Natural fibre blend\nLead time: 3–4 weeks"} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : isEdit ? "Save product" : "Create product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>

      {/* Right column — options, images */}
      <div className="space-y-5">
        <section className="bg-card border-border rounded-sm border p-6">
          <h2 className="text-sm font-semibold">Options</h2>
          {options.isLoading ? (
            <div className="bg-muted mt-3 h-40 animate-pulse rounded-sm" />
          ) : (
            <div className="mt-4 space-y-5">
              {optionGroups.map((group) => (
                <CheckboxGroup
                  key={group.key}
                  label={group.label}
                  options={group.options}
                  selected={values[group.key]}
                  onChange={(ids) => setValues((v) => ({ ...v, [group.key]: ids }))}
                />
              ))}
            </div>
          )}
        </section>

        {isEdit && (
          <section className="bg-card border-border rounded-sm border p-6">
            <h2 className="text-sm font-semibold">Images</h2>

            <ul className="mt-4 space-y-2">
              {images.data?.images.map((image) => (
                <li key={image.id} className="border-border flex items-center gap-3 rounded-sm border p-2">
                  <Image
                    src={image.url}
                    alt={image.alt ?? ""}
                    width={64}
                    height={64}
                    unoptimized
                    className="bg-muted h-16 w-16 shrink-0 rounded-sm object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground truncate font-mono text-[11px]">{image.url}</p>
                    {image.isPrimary && <p className="text-accent mt-0.5 text-[11px] font-medium">Primary</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Make primary"
                      aria-label="Make primary"
                      onClick={() => setPrimary.mutate(image.id)}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-sm border transition-colors",
                        image.isPrimary ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-accent",
                      )}
                    >
                      <Star className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      aria-label="Remove image"
                      onClick={() => removeImage.mutate(image.id)}
                      className="grid h-8 w-8 place-items-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/… image URL"
                aria-label="Image URL"
              />
              <Button type="button" variant="outline" onClick={() => addImage.mutate()} disabled={addImage.isPending}>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only sm:ms-1.5">Add</span>
              </Button>
            </div>
            <Input
              className="mt-2"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Alt text (optional)"
              aria-label="Image alt text"
            />
          </section>
        )}
      </div>
    </form>
  );
}

export type ProductFormPayload = ProductFormValues;
