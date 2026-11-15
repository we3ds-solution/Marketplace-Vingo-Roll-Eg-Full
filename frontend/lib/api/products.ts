import api from "../api";

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  categoryName?: string;
  primaryImageUrl: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  rating: number;
  reviewCount: number;
}

export interface PaginatedProducts {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ProductsQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
}

export const productsApi = {
  getProducts: async (query: ProductsQuery = {}): Promise<PaginatedProducts> => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.pageSize) params.append("pageSize", query.pageSize.toString());
    if (query.category) params.append("category", query.category);
    if (query.search) params.append("search", query.search);
    if (query.featured !== undefined) params.append("featured", query.featured.toString());
    if (query.bestseller !== undefined) params.append("bestseller", query.bestseller.toString());

    const { data } = await api.get<PaginatedProducts>(`/products?${params}`);
    return data;
  },

  getFeatured: async (): Promise<PaginatedProducts> => {
    const { data } = await api.get<PaginatedProducts>("/products/featured");
    return data;
  },

  getBestsellers: async (): Promise<PaginatedProducts> => {
    const { data } = await api.get<PaginatedProducts>("/products/bestsellers");
    return data;
  },
};
