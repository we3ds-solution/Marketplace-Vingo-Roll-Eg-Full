/**
 * API DTO → frontend model mappers.
 * The frontend renders typed view models; the API owns the wire shape.
 * Keep every null→fallback decision here.
 */

import type {
  Category,
  Collection,
  InspirationPost,
  LightControl,
  Need,
  Product,
  Review,
  Room,
  StockStatus,
} from "@/types";

import type {
  ApiCategory,
  ApiCollection,
  ApiNeed,
  ApiProductDetail,
  ApiProductListItem,
  ApiReview,
  ApiRoom,
  ApiStory,
  ApiStoryDetail,
} from "./types";

const LIGHT_CONTROL_MAP: Record<string, LightControl> = {
  sheer: "sheer",
  lightfiltering: "light-filtering",
  light_filtering: "light-filtering",
  blackout: "blackout",
  roomdarkening: "blackout",
};

export function mapLightControl(value: string | null | undefined): LightControl {
  if (!value) return "light-filtering";
  return LIGHT_CONTROL_MAP[value.toLowerCase().replace(/-/g, "_")] ?? "light-filtering";
}

function mapStockStatus(value: string | null | undefined): StockStatus {
  switch (value) {
    case "in-stock":
    case "made-to-order":
    case "low-stock":
    case "sold-out":
      return value;
    default:
      return "in-stock";
  }
}

// ---------------------------------------------------------------- products

export function mapApiProductListItem(api: ApiProductListItem): Product {
  const product: Product = {
    id: api.id,
    slug: api.slug,
    name: api.name,
    shortDescription: api.shortDescription,
    description: api.shortDescription,
    categoryId: api.categorySlug ?? "",
    price: api.price,
    ...(api.compareAtPrice != null && { compareAtPrice: api.compareAtPrice }),
    currency: "USD",
    rating: api.rating,
    reviewCount: api.reviewCount,
    images: [{ src: api.primaryImageUrl, alt: api.name, kind: "main" }],
    materials: [],
    colors: [],
    sizes: [],
    features: [],
    specifications: {},
    ...(api.lightControl != null && { lightControl: mapLightControl(api.lightControl) }),
    rooms: api.roomSlugs,
    needs: api.needSlugs,
    collectionSlugs: api.collectionSlugs,
    materialTiers: api.materialTiers,
    styles: api.styles,
    installation: "both",
    motorized: api.motorized,
    stockStatus: "in-stock",
    createdAt: api.createdAt,
  };

  if (api.isFeatured) product.featured = true;
  if (api.isBestseller) product.bestseller = true;
  if (api.isNewArrival) product.newArrival = true;
  if (api.isOnSale) product.sale = true;

  return product;
}

export function mapApiProductDetail(api: ApiProductDetail): Product {
  const product: Product = {
    id: api.id,
    slug: api.slug,
    name: api.name,
    shortDescription: api.shortDescription,
    description: api.description,
    categoryId: api.categorySlug ?? "",
    ...(api.categorySlug && {
      category: {
        id: api.categorySlug,
        name: api.categoryName ?? api.categorySlug,
        slug: api.categorySlug,
      },
    }),
    ...(api.collectionSlugs[0] && { collectionId: api.collectionSlugs[0] }),
    price: api.price,
    ...(api.compareAtPrice != null && { compareAtPrice: api.compareAtPrice }),
    currency: api.currency ?? "USD",
    rating: api.rating,
    reviewCount: api.reviewCount,
    images: api.images.map((img) => ({
      src: img.url,
      alt: img.alt ?? api.name,
      kind: (img.kind === "main" || img.kind === "room" || img.kind === "texture" ? img.kind : "detail") as
        Product["images"][number]["kind"],
    })),
    materials: api.materials.map((m) => ({
      id: m.id,
      name: m.name,
      priceDelta: m.priceDelta,
      tier: (m.tier?.toLowerCase() ?? "essential") as Product["materials"][number]["tier"],
    })),
    colors: api.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hexCode ?? "#CCCCCC",
      family: c.family ?? "",
    })),
    sizes: api.sizes.map((s) => ({
      id: s.id,
      label: s.label ?? s.slug ?? "",
      widthIn: s.widthInches ?? 0,
      heightIn: s.heightInches ?? 0,
      priceDelta: s.priceDelta,
    })),
    features: api.features,
    specifications: api.specifications,
    ...(api.lightControl != null && { lightControl: mapLightControl(api.lightControl) }),
    rooms: api.roomSlugs,
    needs: api.needSlugs,
    styles: api.styles,
    installation: (api.installation as Product["installation"]) ?? "both",
    motorized: api.motorized,
    stockStatus: mapStockStatus(api.stockStatus),
  };

  if (api.isFeatured) product.featured = true;
  if (api.isBestseller) product.bestseller = true;
  if (api.isNewArrival) product.newArrival = true;
  if (api.isOnSale) product.sale = true;

  return product;
}

export const mapApiProducts = (items: ApiProductListItem[]): Product[] =>
  items.map(mapApiProductListItem);

export function mapRelatedProductToProduct(api: {
  slug: string;
  name: string;
  price: number;
  primaryImageUrl: string;
  rating: number;
  reviewCount: number;
}): Product {
  return {
    id: api.slug,
    slug: api.slug,
    name: api.name,
    shortDescription: "",
    description: "",
    categoryId: "",
    price: api.price,
    currency: "USD",
    rating: api.rating,
    reviewCount: api.reviewCount,
    images: [{ src: api.primaryImageUrl, alt: api.name, kind: "main" }],
    materials: [],
    colors: [],
    sizes: [],
    features: [],
    specifications: {},
    stockStatus: "in-stock",
  };
}

export function mapApiWishlistItemToProduct(api: {
  productSlug: string;
  productName: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
}): Product {
  const product: Product = {
    id: api.productSlug,
    slug: api.productSlug,
    name: api.productName,
    shortDescription: "",
    description: "",
    categoryId: "",
    price: api.price,
    ...(api.compareAtPrice != null && { compareAtPrice: api.compareAtPrice }),
    currency: "USD",
    rating: api.rating,
    reviewCount: api.reviewCount,
    images: [{ src: api.imageUrl, alt: api.productName, kind: "main" }],
    materials: [],
    colors: [],
    sizes: [],
    features: [],
    specifications: {},
    stockStatus: "in-stock",
  };

  if (api.isBestseller) product.bestseller = true;

  return product;
}

// --------------------------------------------------------------- taxonomy

export function mapApiCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    tagline: api.tagline ?? "",
    description: api.description ?? "",
    image: api.imageUrl ?? "",
    group: (api.group as Category["group"]) ?? "curtains",
  };
}

export function mapApiCollection(api: ApiCollection): Collection {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    story: api.story ?? "",
    description: api.description ?? "",
    image: api.imageUrl ?? "",
    mood: api.mood ?? "",
  };
}

export function mapApiRoom(api: ApiRoom): Room {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description ?? "",
    image: api.imageUrl ?? "",
    recommended: api.recommendedCategorySlugs,
  };
}

export function mapApiNeed(api: ApiNeed): Need {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description ?? "",
    icon: api.icon ?? "circle",
  };
}

// -------------------------------------------------------------- inspiration

export function mapApiStory(api: ApiStory): InspirationPost {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    excerpt: api.excerpt ?? "",
    body: [],
    room: api.roomSlug ?? "",
    style: api.style ?? "",
    treatment: api.treatment ?? "",
    image: api.imageUrl ?? "",
    productSlugs: [],
  };
}

export function mapApiStoryDetail(api: ApiStoryDetail): InspirationPost {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    excerpt: api.excerpt ?? "",
    body: api.sections.map((s) => s.body),
    room: api.roomSlug ?? "",
    style: api.style ?? "",
    treatment: api.treatment ?? "",
    image: api.imageUrl ?? "",
    productSlugs: api.products.map((p) => p.slug),
  };
}

// ---------------------------------------------------------------- reviews

export function mapApiReview(api: ApiReview): Review {
  return {
    id: api.id,
    productSlug: api.productSlug,
    author: api.author,
    rating: api.rating,
    title: api.title ?? "",
    body: api.body ?? "",
    date: api.createdAt.slice(0, 10),
    verified: api.verified,
  };
}
