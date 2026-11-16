"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Crumbs, Section, SectionHeading } from "@/components/common/section";
import { TrustLayer } from "@/components/common/trust-layer";
import { ProductGrid } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/data/faqs";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Product, Review } from "@/types";

export function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const [image, setImage] = useState(0);
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [mount, setMount] = useState("inside");
  const [qty, setQty] = useState(1);

  const add = useCartStore((s) => s.add);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wishlistSlugs = useWishlistStore((s) => s.slugs);
  const hydrated = useHydrated();

  const saved = wishlistSlugs.includes(product.slug);
  const mat = product.materials?.find((m) => m.id === material);
  const sz = product.sizes?.find((s) => s.id === size);
  const unitPrice = product.price + (mat?.priceDelta || 0) + (sz?.priceDelta || 0);

  const handleAddToCart = () => {
    void add({
      productId: product.id,
      quantity: qty,
      materialId: material || null,
      colorId: color || null,
      sizeId: size || null,
      mount,
    }).then(() => {
      toast.success(`${product.name} added to your cart`);
    });
  };

  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.name },
        ]}
      />
      <div className="container-page grid gap-6 py-10 md:py-14 lg:gap-10 lg:grid-cols-2">
        <div>
          <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src={product.images?.[image]?.src || ""}
              alt={product.images?.[image]?.alt || product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              className="object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setImage(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === image}
                    className={cn(
                      "bg-muted relative aspect-square w-full overflow-hidden rounded-sm border",
                      i === image ? "border-accent" : "border-transparent",
                    )}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 1024px) 12vw, 25vw"
                      quality={60}
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.sale && <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs rounded">Sale</span>}
            {product.newArrival && <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded">New</span>}
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl">{product.name}</h1>
          <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
            <Star className="fill-accent text-accent h-4 w-4" aria-hidden="true" />
            {product.rating?.toFixed(1) || "5.0"} · {product.reviewCount || 0} reviews
          </p>
          <p className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl">{formatPrice(unitPrice)}</span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through text-base">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-7">
            {product.materials && product.materials.length > 0 && (
              <fieldset>
                <legend className="eyebrow mb-3">1. Fabric</legend>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMaterial(m.id)}
                      aria-pressed={material === m.id}
                      className={cn(
                        "rounded-sm border px-4 py-2 text-sm transition-colors",
                        material === m.id
                          ? "border-accent bg-card"
                          : "border-border hover:border-accent",
                      )}
                    >
                      {m.name}
                      {m.priceDelta ? ` +${formatPrice(m.priceDelta)}` : ""}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.colors && product.colors.length > 0 && (
              <fieldset>
                <legend className="eyebrow mb-3">2. Colour</legend>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      aria-pressed={color === c.id}
                      aria-label={c.name}
                      title={c.name}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-transform",
                        color === c.id ? "border-accent scale-110" : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {product.colors.find((c) => c.id === color)?.name}
                </p>
              </fieldset>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <fieldset>
                <legend className="eyebrow mb-3">3. Size</legend>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id)}
                      aria-pressed={size === s.id}
                      className={cn(
                        "rounded-sm border px-4 py-2 text-sm transition-colors",
                        size === s.id ? "border-accent bg-card" : "border-border hover:border-accent",
                      )}
                    >
                      {s.label}
                      {s.priceDelta ? ` +${formatPrice(s.priceDelta)}` : ""}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="eyebrow mb-3">4. Mount</legend>
              <div className="flex gap-2">
                {["inside", "outside"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMount(m)}
                    aria-pressed={mount === m}
                    className={cn(
                      "rounded-sm border px-4 py-2 text-sm capitalize transition-colors",
                      mount === m ? "border-accent bg-card" : "border-border hover:border-accent",
                    )}
                  >
                    {m} mount
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-3">
              <div className="border-border flex items-center rounded-sm border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-10 text-center text-sm" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                >
                  +
                </button>
              </div>
              <Button size="lg" onClick={handleAddToCart}>
                Add to cart — {formatPrice(unitPrice * qty)}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => void toggleWish(product.slug)}
                aria-pressed={hydrated && saved}
              >
                <Heart
                  className={cn("me-2 h-4 w-4", hydrated && saved && "fill-current")}
                  aria-hidden="true"
                />{" "}
                {hydrated && saved ? "Saved" : "Save"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Not sure about colour?{" "}
              <Link href="/swatches" className="text-accent underline underline-offset-4">
                Order free swatches
              </Link>{" "}
              · Not sure about size?{" "}
              <Link href="/guides/measuring" className="text-accent underline underline-offset-4">
                Measuring guide
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <TrustLayer compact />
          </div>
        </div>
      </div>

      <Section>
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="max-w-3xl pt-8">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            {product.features && (
              <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
                {product.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
            {reviews.length > 0 ? (
              <ul className="grid max-w-3xl gap-6">
                {reviews.map((r) => (
                  <li key={r.id} className="border-border rounded-sm border p-5">
                    <div className="flex items-center gap-3">
                      <p className="text-accent text-xs" aria-label={`${r.rating} out of 5`}>
                        {"★".repeat(Math.max(0, Math.floor(r.rating)))}
                      </p>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg">{r.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{r.body}</p>
                    <p className="text-muted-foreground mt-3 text-xs">
                      {r.author} · {r.date}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No reviews for this piece yet.</p>
            )}
          </TabsContent>
          <TabsContent value="faq" className="pt-8">
            <Accordion type="single" collapsible className="max-w-3xl">
              {faqs.slice(0, 5).map((f) => (
                <AccordionItem key={f.question} value={f.question}>
                  <AccordionTrigger className="text-start">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </Section>

      <Section className="bg-card">
        <SectionHeading eyebrow="Related" title="Goes well with" />
        <ProductGrid products={related} />
      </Section>
    </>
  );
}
