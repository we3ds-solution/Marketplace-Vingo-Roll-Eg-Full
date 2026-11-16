"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { QuickViewButton } from "@/components/product/product-quick-view";
import { toast } from "sonner";
import type { Product } from "@/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const wishlist = useWishlistStore((s) => s.slugs);
  const toggle = useWishlistStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.add);
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.slug);
  const main = product.images[0];
  const hover = product.images[1] ?? main;

  const handleAddToCart = () => {
    // Quick add — the API applies default options (first fabric/colour/size)
    void addToCart({
      productId: product.id,
      quantity: 1,
    })
      .then(() => toast.success(`${product.name} added to cart`))
      .catch(() => {
        // Error toast is surfaced by the store
      });
  };

  return (
    <article className="group relative">
      <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-sm">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
          <Image
            src={main?.src ?? ""}
            alt={main?.alt ?? product.name}
            fill
            sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={80}
            priority={priority}
            className="object-cover transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-0"
          />
          {hover && (
            <Image
              src={hover.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              quality={75}
              className="scale-[1.04] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>
        <div className="absolute top-3 start-3 z-20 flex flex-col gap-1.5">
          {product.sale && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs rounded">Sale</span>
          )}
          {product.newArrival && (
            <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded">New</span>
          )}
          {product.bestseller && (
            <span className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded">Bestseller</span>
          )}
        </div>

        {/* Icon stack — end side (heart & quick view) */}
        <div className="absolute top-3 end-3 z-30 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.slug);
            }}
            aria-pressed={saved}
            aria-label={
              saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
            }
            className="bg-background/85 text-foreground hover:bg-background grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-colors"
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden="true" />
          </button>
          <QuickViewButton product={product} />
        </div>

        {/* Add to cart — hover-reveal, docked to the inline bottom inset */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-center gap-2 rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent/90"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-medium tracking-tight">{product.name}</h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 max-w-xs text-xs leading-relaxed">
            {product.description}
          </p>
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
            <Star className="fill-accent text-accent h-3 w-3" aria-hidden="true" />
            <span>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </p>
        </div>
        <div className="text-end">
          <p className="text-sm font-medium">{formatPrice(product.price)}</p>
          {product.compareAtPrice ? (
            <p className="text-muted-foreground text-xs line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  density = "comfortable",
}: {
  products: Product[];
  density?: "comfortable" | "dense";
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-10 py-16 text-center">
        <p className="text-sm font-semibold">Nothing matches those filters</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try widening the price range or clearing a filter.
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 sm:gap-6",
        density === "dense" ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 3} />
      ))}
    </div>
  );
}
