"use client";

import { create } from "zustand";
import { toast } from "sonner";
import {
  apiAddToCart,
  apiClearCart,
  apiGetCart,
  apiRemoveCartItem,
  apiUpdateCartItem,
} from "@/lib/api/client";
import type { ApiCart, ApiCartItem } from "@/lib/api/types";

export type CartItem = {
  /** Line item id assigned by the API (used as the merge-safe key). */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  /** Display-only option labels, e.g. Material / Color / Size / Mount. */
  options: Record<string, string>;
  materialId: string | null;
  colorId: string | null;
  sizeId: string | null;
  mount: string | null;
};

export type AddToCartInput = {
  productId: string;
  quantity: number;
  materialId?: string | null;
  colorId?: string | null;
  sizeId?: string | null;
  mount?: string | null;
};

type CartState = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  /** True once the first server sync completed. */
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  lastRemovedItem: CartItem | null;
  refresh: () => Promise<void>;
  add: (item: AddToCartInput) => Promise<void>;
  remove: (key: string) => Promise<void>;
  setQuantity: (key: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  undoRemove: () => Promise<void>;
};

function mapApiCartItem(item: ApiCartItem): CartItem {
  const options: Record<string, string> = {};
  if (item.materialName) options["Material"] = item.materialName;
  if (item.colorName) options["Color"] = item.colorName;
  if (item.sizeLabel) options["Size"] = item.sizeLabel;
  if (item.mount) options["Mount"] = item.mount;

  return {
    key: item.id,
    productId: item.productId,
    slug: item.productSlug,
    name: item.productName,
    image: item.imageUrl,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    options,
    materialId: item.materialId,
    colorId: item.colorId,
    sizeId: item.sizeId,
    mount: item.mount,
  };
}

const stateFromCart = (cart: ApiCart) => ({
  items: cart.items.map(mapApiCartItem),
  subtotal: cart.subtotal,
  shipping: cart.shipping,
  total: cart.total,
  hydrated: true,
  loading: false,
  error: null as string | null,
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  hydrated: false,
  loading: false,
  error: null,
  lastRemovedItem: null,

  refresh: async () => {
    set({ loading: true });
    try {
      const cart = await apiGetCart();
      set(stateFromCart(cart));
    } catch (error) {
      set({ loading: false, error: errorMessage(error) });
    }
  },

  add: async (item) => {
    try {
      const cart = await apiAddToCart(item);
      set(stateFromCart(cart));
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
      throw error;
    }
  },

  remove: async (key) => {
    const removed = get().items.find((i) => i.key === key) ?? null;
    try {
      const cart = await apiRemoveCartItem(key);
      set({ ...stateFromCart(cart), lastRemovedItem: removed });
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },

  setQuantity: async (key, quantity) => {
    const clamped = Math.max(0, Math.min(20, Math.trunc(quantity)));
    try {
      const cart = await apiUpdateCartItem(key, clamped);
      set(stateFromCart(cart));
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },

  clear: async () => {
    try {
      const cart = await apiClearCart();
      set({ ...stateFromCart(cart), lastRemovedItem: null });
    } catch (error) {
      set({ error: errorMessage(error) });
      toast.error(errorMessage(error));
    }
  },

  undoRemove: async () => {
    const removed = get().lastRemovedItem;
    if (!removed) return;

    set({ lastRemovedItem: null });
    try {
      await get().add({
        productId: removed.productId,
        quantity: removed.quantity,
        materialId: removed.materialId,
        colorId: removed.colorId,
        sizeId: removed.sizeId,
        mount: removed.mount,
      });
    } catch {
      // Error already surfaced by add()
    }
  },
}));

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);
