/**
 * Shop filter state and option lists.
 * Values match the seeded catalogue exactly — keep them in sync with the
 * backend seed (Vingo.Infrastructure Persistence/Seed) or filters
 * will silently match nothing.
 */

export interface FilterState {
  priceRange: [number, number];
  materialTiers: string[];
  lightControl: string[];
  rooms: string[];
  collections: string[];
  styles: string[];
  sortBy: "relevance" | "price-asc" | "price-desc" | "newest" | "bestseller";
}

export const FILTER_DEFAULTS: FilterState = {
  priceRange: [0, 5000],
  materialTiers: [],
  lightControl: [],
  rooms: [],
  collections: [],
  styles: [],
  sortBy: "relevance",
};

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "bestseller", label: "Bestsellers" },
] as const;

export const MATERIAL_TIERS = [
  { value: "essential", label: "Essential" },
  { value: "signature", label: "Signature" },
  { value: "couture", label: "Couture" },
] as const;

export const LIGHT_CONTROLS = [
  { value: "sheer", label: "Sheer" },
  { value: "light-filtering", label: "Light Filtering" },
  { value: "blackout", label: "Blackout" },
] as const;

export const STYLES = [
  { value: "Minimal", label: "Minimal" },
  { value: "Classic", label: "Classic" },
  { value: "Contemporary", label: "Contemporary" },
  { value: "Natural", label: "Natural Textures" },
  { value: "Designer", label: "Designer" },
] as const;

export const ROOM_TYPES = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining-room", label: "Dining Room" },
  { value: "home-office", label: "Home Office" },
  { value: "kids-room", label: "Kids Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "patio-outdoor", label: "Patio/Outdoor" },
] as const;

export const COLLECTIONS_LIST = [
  { value: "designer", label: "The Designer Edit" },
  { value: "natural-textures", label: "Natural Textures" },
  { value: "minimal", label: "Minimal" },
  { value: "classic", label: "Classic" },
  { value: "contemporary", label: "Contemporary" },
  { value: "seasonal", label: "Seasonal Archive" },
] as const;
