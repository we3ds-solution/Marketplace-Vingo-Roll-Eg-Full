/**
 * API DTO types — wire format of the Vingo Roll backend (camelCase JSON).
 * Keep these in sync with the C# DTOs under Vingo.Application/Features.
 */

export type Paginated<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

// ------------------------------------------------------------------ catalog

export type ApiProductListItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  categorySlug: string | null;
  categoryName: string | null;
  primaryImageUrl: string;
  lightControl: string | null;
  styles: string[];
  roomSlugs: string[];
  collectionSlugs: string[];
  needSlugs: string[];
  materialTiers: string[];
  createdAt: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  motorized: boolean;
  rating: number;
  reviewCount: number;
};

export type ApiProductImage = {
  url: string;
  alt: string | null;
  kind: string;
};

export type ApiOption = {
  id: string;
  name: string;
  priceDelta: number;
  tier?: string | null;
  hexCode?: string | null;
  family?: string | null;
  label?: string | null;
  slug?: string | null;
  widthInches?: number | null;
  heightInches?: number | null;
};

export type ApiReview = {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  createdAt: string;
};

export type ApiRelatedProduct = {
  slug: string;
  name: string;
  price: number;
  primaryImageUrl: string;
  rating: number;
  reviewCount: number;
};

export type ApiProductDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  categorySlug: string | null;
  categoryName: string | null;
  collectionSlugs: string[];
  roomSlugs: string[];
  needSlugs: string[];
  styles: string[];
  lightControl: string | null;
  installation: string;
  motorized: boolean;
  stockStatus: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  rating: number;
  reviewCount: number;
  images: ApiProductImage[];
  materials: ApiOption[];
  colors: ApiOption[];
  sizes: ApiOption[];
  features: string[];
  specifications: Record<string, string>;
  reviews: ApiReview[];
  relatedProducts: ApiRelatedProduct[];
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  group: string | null;
  productCount: number;
  parentId: string | null;
};

export type ApiCollection = {
  id: string;
  name: string;
  slug: string;
  mood: string | null;
  story: string | null;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

export type ApiCollectionDetail = {
  id: string;
  name: string;
  slug: string;
  mood: string | null;
  story: string | null;
  description: string | null;
  imageUrl: string | null;
  products: ApiProductListItem[];
};

export type ApiRoom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  recommendedCategorySlugs: string[];
  productCount: number;
};

export type ApiRoomDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  recommendedCategorySlugs: string[];
  products: ApiProductListItem[];
};

export type ApiNeed = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  productCount: number;
};

export type ApiStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  roomSlug: string | null;
  style: string | null;
  treatment: string | null;
  productCount: number;
};

export type ApiStorySection = {
  heading: string | null;
  body: string;
  imageUrl: string | null;
};

export type ApiStoryDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  roomSlug: string | null;
  style: string | null;
  treatment: string | null;
  sections: ApiStorySection[];
  products: ApiRelatedProduct[];
};

export type ApiMaterial = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  priceDelta: number;
  description: string | null;
  swatchImageUrl: string | null;
};

export type ApiColor = {
  id: string;
  name: string;
  hexCode: string;
  family: string | null;
};

export type ApiSize = {
  id: string;
  slug: string;
  label: string;
  widthInches: number;
  heightInches: number;
  priceDelta: number;
};

// ----------------------------------------------------------------- shopping

export type ApiCartItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  materialId: string | null;
  colorId: string | null;
  sizeId: string | null;
  materialName: string | null;
  colorName: string | null;
  sizeLabel: string | null;
  mount: string | null;
};

export type ApiCart = {
  id: string;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  items: ApiCartItem[];
};

export type ApiWishlistItem = {
  productId: string;
  productSlug: string;
  productName: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
};

export type ApiWishlist = {
  count: number;
  items: ApiWishlistItem[];
};

export type ApiOrderItem = {
  productName: string;
  productSlug: string;
  materialName: string | null;
  colorName: string | null;
  sizeLabel: string | null;
  mount: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  createdAt: string;
  itemCount: number;
  items: ApiOrderItem[];
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
};
