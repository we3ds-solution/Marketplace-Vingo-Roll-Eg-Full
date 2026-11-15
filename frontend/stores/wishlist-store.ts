"use client";

import { create } from "zustand";
import { toast } from "sonner";
import {
  apiAddToWishlist,
  apiClearWishlist,
  apiGetWishlist,
  apiRemoveFromWishlist,
} from "@/lib/api/client";
import type { ApiWishlistItem } from "@/lib/api/types";

export type WishlistEntry = ApiWishlistItem;

type WishlistState = {
  /** Full saved items from the API (productSlug, price, imageUrl, …). */
  items: WishlistEntry[];
  /** Convenience selector — slugs only. */
  slugs: string[];
  /** True once the first server sync completed. */
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggle: (slug: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  clear: () => Promise<void>;
};

const stateFromWishlist = (wishlist: { items: WishlistEntry[] }) => ({
  items: wishlist.items,
  slugs: wishlist.items.map((i) => i.productSlug),
  hydrated: true,
  loading: false,
  error: null as string | null,
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  slugs: [],
  hydrated: false,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true });
    try {
      const wishlist = await apiGetWishlist();
      set(stateFromWishlist(wishlist));
    } catch (error) {
      set({ loading: false, error: errorMessage(error) });
    }
  },

  toggle: async (slug) => {
    const exists = get().slugs.includes(slug);
    try {
      const wishlist = exists
        ? await apiRemoveFromWishlist(slug)
        : await apiAddToWishlist(slug);
      set(stateFromWishlist(wishlist));
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },

  remove: async (slug) => {
    try {
      const wishlist = await apiRemoveFromWishlist(slug);
      set(stateFromWishlist(wishlist));
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },

  clear: async () => {
    try {
      const wishlist = await apiClearWishlist();
      set(stateFromWishlist(wishlist));
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },
}));
