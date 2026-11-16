import { MetadataRoute } from "next";
import {
  apiGetCategories,
  apiGetCollections,
  apiGetInspirationStories,
  apiGetProducts,
  apiGetRooms,
} from "@/lib/api/client";

// Sitemap should reflect the live catalogue â€” evaluate per request.
export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vingoroll.com";

  // Static routes
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/about/our-story",
    "/contact",
    "/collections",
    "/inspiration",
    "/inspiration/rooms",
    "/services",
    "/services/design-consultation",
    "/services/measuring-installation",
    "/guides",
    "/guides/measuring",
    "/guides/care",
    "/guides/shipping",
    "/guides/returns",
    "/swatches",
    "/style-finder",
    "/smart-home",
    "/trade",
    "/quote",
    "/shop/needs",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/accessibility",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [products, categories, collections, stories, rooms] = await Promise.all([
      apiGetProducts({ pageSize: 100 }),
      apiGetCategories(),
      apiGetCollections(),
      apiGetInspirationStories(),
      apiGetRooms(),
    ]);

    const productPages = products.items.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/shop/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const collectionPages = collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const inspirationPages = stories.map((post) => ({
      url: `${baseUrl}/inspiration/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const roomPages = rooms.map((room) => ({
      url: `${baseUrl}/inspiration/rooms/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...productPages,
      ...categoryPages,
      ...collectionPages,
      ...inspirationPages,
      ...roomPages,
    ];
  } catch {
    // If the API is unreachable, ship at least the static routes
    return staticRoutes;
  }
}
