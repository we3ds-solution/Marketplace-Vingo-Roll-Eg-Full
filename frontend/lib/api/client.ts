/**
 * Typed fetchers for the Vingo Roll API.
 *
 * - Client components: cookies flow via `credentials: "include"` (guest
 *   session cookie `vingo_session`).
 * - Server components: anonymous catalog reads, no cookie needed.
 */

import type {
  ApiCart,
  ApiCategory,
  ApiCollection,
  ApiCollectionDetail,
  ApiColor,
  ApiMaterial,
  ApiNeed,
  ApiOrder,
  ApiProductDetail,
  ApiProductListItem,
  ApiReview,
  ApiRoom,
  ApiRoomDetail,
  ApiSize,
  ApiStory,
  ApiStoryDetail,
  ApiWishlist,
  Paginated,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const body: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const errorBody = body as { error?: string; errors?: Record<string, string[]> } | undefined;
    throw new ApiError(
      response.status,
      errorBody?.error ?? `Request failed with status ${response.status}`,
      errorBody?.errors,
    );
  }

  return body as T;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// ------------------------------------------------------------------ catalog

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  collection?: string;
  room?: string;
  need?: string;
  search?: string;
  lightControl?: string;
  materialTier?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  sort?: string;
};

export const apiGetProducts = (params: ProductListParams = {}) =>
  apiFetch<Paginated<ApiProductListItem>>(`/api/v1/products${qs(params)}`);

/** Returns null when the product does not exist (API 404). */
export const apiGetProductBySlug = async (slug: string): Promise<ApiProductDetail | null> => {
  try {
    return await apiFetch<ApiProductDetail>(`/api/v1/products/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const apiGetCategories = () => apiFetch<ApiCategory[]>(`/api/v1/categories`);
export const apiGetCollections = () => apiFetch<ApiCollection[]>(`/api/v1/collections`);

export const apiGetCollectionBySlug = async (
  slug: string,
  sort?: string,
): Promise<ApiCollectionDetail | null> => {
  try {
    return await apiFetch<ApiCollectionDetail>(
      `/api/v1/collections/${encodeURIComponent(slug)}${qs({ sort })}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const apiGetRooms = () => apiFetch<ApiRoom[]>(`/api/v1/rooms`);

export const apiGetRoomBySlug = async (
  slug: string,
  sort?: string,
): Promise<ApiRoomDetail | null> => {
  try {
    return await apiFetch<ApiRoomDetail>(
      `/api/v1/rooms/${encodeURIComponent(slug)}${qs({ sort })}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const apiGetNeeds = () => apiFetch<ApiNeed[]>(`/api/v1/needs`);
export const apiGetSizes = () => apiFetch<ApiSize[]>(`/api/v1/sizes`);
export const apiGetMaterials = () => apiFetch<ApiMaterial[]>(`/api/v1/materials`);
export const apiGetColors = () => apiFetch<ApiColor[]>(`/api/v1/colors`);

export const apiGetInspirationStories = (room?: string) =>
  apiFetch<ApiStory[]>(`/api/v1/inspiration${qs({ room })}`);

export const apiGetInspirationStory = async (
  slug: string,
): Promise<ApiStoryDetail | null> => {
  try {
    return await apiFetch<ApiStoryDetail>(`/api/v1/inspiration/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const apiGetReviews = (productSlug: string) =>
  apiFetch<ApiReview[]>(`/api/v1/reviews/${encodeURIComponent(productSlug)}`);

export const apiAddReview = (payload: {
  productSlug: string;
  author: string;
  rating: number;
  title?: string;
  body?: string;
}) =>
  apiFetch<ApiReview>(`/api/v1/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ------------------------------------------------------------------- cart

export const apiGetCart = () => apiFetch<ApiCart>(`/api/v1/cart`);

export const apiAddToCart = (payload: {
  productId: string;
  quantity: number;
  materialId?: string | null;
  colorId?: string | null;
  sizeId?: string | null;
  mount?: string | null;
}) =>
  apiFetch<ApiCart>(`/api/v1/cart/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiUpdateCartItem = (itemId: string, quantity: number) =>
  apiFetch<ApiCart>(`/api/v1/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const apiRemoveCartItem = (itemId: string) =>
  apiFetch<ApiCart>(`/api/v1/cart/items/${itemId}`, { method: "DELETE" });

export const apiClearCart = () => apiFetch<ApiCart>(`/api/v1/cart`, { method: "DELETE" });

// --------------------------------------------------------------- wishlist

export const apiGetWishlist = () => apiFetch<ApiWishlist>(`/api/v1/wishlist`);

export const apiAddToWishlist = (productSlug: string) =>
  apiFetch<ApiWishlist>(`/api/v1/wishlist/items`, {
    method: "POST",
    body: JSON.stringify({ productSlug }),
  });

export const apiRemoveFromWishlist = (productSlug: string) =>
  apiFetch<ApiWishlist>(`/api/v1/wishlist/items/${encodeURIComponent(productSlug)}`, {
    method: "DELETE",
  });

export const apiClearWishlist = () =>
  apiFetch<ApiWishlist>(`/api/v1/wishlist`, { method: "DELETE" });

// ------------------------------------------------------------------ orders

export const apiCreateOrder = (payload: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) =>
  apiFetch<ApiOrder>(`/api/v1/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiGetOrder = async (id: string): Promise<ApiOrder | null> => {
  try {
    return await apiFetch<ApiOrder>(`/api/v1/orders/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

// --------------------------------------------------------------- marketing

export const apiCreateLead = (payload: {
  leadType: "quote" | "swatches" | "consultation" | "contact";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  productSlug?: string;
  source?: string;
}) =>
  apiFetch<{ id: string }>(`/api/v1/leads`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiSubscribeNewsletter = (email: string) =>
  apiFetch<{ subscribed: boolean }>(`/api/v1/newsletter/subscribe`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
