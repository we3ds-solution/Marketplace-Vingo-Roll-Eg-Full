/**
 * Vingo Roll Type Exports
 * Central export point for all types (re-exports from organized files)
 */

// Product types
export type {
  StockStatus,
  LightControl,
  Installation,
  ProductImage,
  MaterialOption,
  ColorOption,
  SizeOption,
  Product,
  Review,
} from "./product";

// Category & Collection types
export type { Category, Collection, Room, Need } from "./category";

// Swatch types
export type { Swatch, SwatchState } from "./swatch";

// Inspiration & Wishlist types
export type { InspirationPost, WishlistItem, WishlistState } from "./inspiration";

// Service types
export type { Service, ConsultationBooking, FAQ } from "./service";

// Filter types
export type { FilterState } from "./filters";

export { FILTER_DEFAULTS, SORT_OPTIONS, MATERIAL_TIERS, LIGHT_CONTROLS, STYLES, ROOM_TYPES, COLLECTIONS_LIST } from "./filters";

export { SERVICE_TOPICS } from "./service";
