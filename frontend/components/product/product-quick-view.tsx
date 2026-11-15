"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Eye, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product, MaterialOption, ColorOption, SizeOption } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiGetProductBySlug } from "@/lib/api/client";
import { mapApiProductDetail } from "@/lib/api/mappers";

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Product Quick View Modal
 * Fetches the full product when opened, so options/features are real and
 * the cart line matches exactly what the user picked.
 */
export function ProductQuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [detail, setDetail] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption | undefined>();
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>();
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>();

  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    apiGetProductBySlug(product.slug)
      .then((result) => {
        if (cancelled || !result) return;
        const mapped = mapApiProductDetail(result);
        setDetail(mapped);
        setSelectedMaterial(mapped.materials[0]);
        setSelectedColor(mapped.colors[0]);
        setSelectedSize(mapped.sizes[0]);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load product details");
      });

    return () => {
      cancelled = true;
    };
  }, [open, product.slug]);

  const materialPrice = selectedMaterial?.priceDelta || 0;
  const sizePrice = selectedSize?.priceDelta || 0;
  const totalPrice = (detail?.price ?? product.price) + materialPrice + sizePrice;

  const handleAddToCart = useCallback(() => {
    if (!detail) return;

    void addToCart({
      productId: detail.id,
      quantity,
      materialId: selectedMaterial?.id ?? null,
      colorId: selectedColor?.id ?? null,
      sizeId: selectedSize?.id ?? null,
    })
      .then(() => {
        toast.success(
          `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart`,
          {
            description: `${detail.name} — ${selectedMaterial?.name ?? ""} in ${selectedColor?.name ?? ""}`,
            duration: 4000,
          },
        );
      })
      .catch(() => {
        // Error toast is surfaced by the store
      });

    setQuantity(1);
    onOpenChange(false);
  }, [detail, quantity, selectedMaterial, selectedColor, selectedSize, addToCart, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border/30 px-6 py-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {!detail ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="bg-muted aspect-[4/5] w-full animate-pulse rounded-lg" />
              <div className="space-y-4">
                <div className="bg-muted h-6 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
                <div className="bg-muted h-8 w-1/3 animate-pulse rounded" />
                <div className="bg-muted h-32 w-full animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6">
              {/* Product Image */}
              <div className="relative flex h-full min-h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                {(detail.images[0]?.src ?? product.images[0]?.src) && (
                  <Image
                    src={(detail.images[0]?.src ?? product.images[0]?.src) as string}
                    alt={detail.images[0]?.alt || detail.name}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    quality={80}
                    className="object-cover"
                  />
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <p className="text-muted-foreground text-sm">{detail.shortDescription}</p>
                  <p className="text-base mt-3">{detail.description}</p>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold">{formatPrice(totalPrice)}</span>
                    {detail.compareAtPrice && (
                      <span className="text-muted-foreground line-through text-sm">
                        {formatPrice(detail.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {detail.sale && <p className="text-destructive text-sm mt-1">Sale price</p>}
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {/* Material Selection */}
                  {detail.materials.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold block mb-2">Material</label>
                      <div className="grid grid-cols-2 gap-2">
                        {detail.materials.map((material) => (
                          <button
                            key={material.id}
                            onClick={() => setSelectedMaterial(material)}
                            className={cn(
                              "px-3 py-2 rounded border text-sm transition-colors",
                              selectedMaterial?.id === material.id
                                ? "border-accent bg-accent/10 text-accent font-medium"
                                : "border-border/50 text-muted-foreground hover:border-accent",
                            )}
                          >
                            {material.name}
                            {material.priceDelta > 0 && (
                              <span className="text-xs ml-1">
                                +{formatPrice(material.priceDelta)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {detail.colors.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold block mb-2">Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        {detail.colors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "px-3 py-2 rounded border text-xs transition-colors",
                              selectedColor?.id === color.id
                                ? "border-accent border-2"
                                : "border-border/50 hover:border-accent",
                            )}
                            title={color.name}
                          >
                            <div
                              className="w-6 h-6 rounded mb-1 mx-auto"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs line-clamp-1">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {detail.sizes.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold block mb-2">Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        {detail.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "px-3 py-2 rounded border text-sm transition-colors",
                              selectedSize?.id === size.id
                                ? "border-accent bg-accent/10 text-accent font-medium"
                                : "border-border/50 text-muted-foreground hover:border-accent",
                            )}
                          >
                            {size.label}
                            {size.priceDelta > 0 && (
                              <span className="text-xs ml-1">+{formatPrice(size.priceDelta)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div>
                    <label className="text-sm font-semibold block mb-2">Quantity</label>
                    <div className="border border-border/50 rounded flex items-center w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-center min-w-12">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(20, quantity + 1))}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {detail.features.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Features</p>
                    <ul className="space-y-1">
                      {detail.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-accent mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full py-3 text-base font-semibold"
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Quick View Button - Use in Product Cards
 */
export function QuickViewButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="bg-background/85 text-foreground hover:bg-background grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all opacity-0 group-hover:opacity-100"
        aria-label={`Quick view ${product.name}`}
        title="Quick view"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </button>
      <ProductQuickViewModal
        product={product}
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setOpen(false);
          } else {
            setOpen(newOpen);
          }
        }}
      />
    </>
  );
}
