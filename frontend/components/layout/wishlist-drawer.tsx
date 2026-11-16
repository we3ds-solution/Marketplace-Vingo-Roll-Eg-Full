"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, X, Star } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function WishlistDrawer() {
  const open = useUIStore((s) => s.wishlistOpen);
  const close = useUIStore((s) => s.closeWishlist);
  const { items, hydrated, remove, clear } = useWishlistStore();
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    if (open) {
      void useWishlistStore.getState().refresh();
    }
  }, [open]);

  const savings = items.reduce((sum, item) => {
    if (item.compareAtPrice && item.compareAtPrice > item.price) {
      return sum + (item.compareAtPrice - item.price);
    }
    return sum;
  }, 0);

  const handleAddToBag = async (item: (typeof items)[number]) => {
    try {
      await addToCart({ productId: item.productId, quantity: 1 });
      toast.success(`${item.productName} added to your bag`);
    } catch {
      // cart store surfaces the error toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? useUIStore.getState().openWishlist() : close())}>
      <SheetContent side="right" className="w-[92vw] max-w-md p-0 flex flex-col">
        <SheetHeader className="border-border border-b p-6 pb-5">
          <SheetTitle className="font-display flex items-center gap-2 text-xl">
            <Heart className="text-accent h-5 w-5" aria-hidden="true" />
            Wishlist
            <span className="text-muted-foreground text-sm font-normal tabular-nums">
              ({items.length})
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Saved products — move them to your bag when you are ready
          </SheetDescription>
        </SheetHeader>

        {!hydrated ? (
          <div className="flex-1 space-y-4 p-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-muted h-24 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
            <Heart className="text-muted-foreground mb-4 h-12 w-12 opacity-40" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold">Nothing saved yet</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Tap the heart on any product to keep it here while you decide.
            </p>
            <Button asChild className="mt-6" onClick={close}>
              <Link href="/shop">Browse treatments</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-border divide-y overflow-y-auto">
              {items.map((item) => (
                <li key={item.productSlug} className="flex gap-4 p-4">
                  <Link href={`/product/${item.productSlug}`} onClick={close} className="shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={80}
                      height={100}
                      className="bg-muted h-24 w-20 rounded-sm object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={close}
                        className="hover:text-accent line-clamp-2 text-sm font-medium transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        onClick={() => void remove(item.productSlug)}
                        aria-label={`Remove ${item.productName} from wishlist`}
                        className="text-muted-foreground hover:text-destructive grid h-7 w-7 shrink-0 place-items-center rounded-sm transition-colors"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-[11px]">
                      <Star className="fill-accent text-accent h-3 w-3" aria-hidden="true" />
                      {item.rating.toFixed(1)} ({item.reviewCount})
                      {item.isBestseller && (
                        <span className="text-accent ms-1 font-medium">· Bestseller</span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-muted-foreground text-xs line-through">
                            {formatPrice(item.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => void handleAddToBag(item)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                        Add to bag
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-border border-t p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  {items.length} saved piece{items.length === 1 ? "" : "s"}
                </span>
                {savings > 0 && (
                  <span className="text-accent font-medium">Saving {formatPrice(savings)}</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => void clear()}>
                  Clear all
                </Button>
                <Button className="flex-1" onClick={close}>
                  Keep browsing
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
