import type { Metadata } from "next";
import { apiGetInspirationStories, apiGetRooms } from "@/lib/api/client";
import { mapApiRoom, mapApiStory } from "@/lib/api/mappers";
import { InspirationGallery } from "@/components/inspiration/inspiration-gallery";

export const metadata: Metadata = {
  title: "Inspiration",
  description: "Each project lists the exact treatments used, so you can shop the look.",
};

export const revalidate = 60; // ISR: serve from Next's cache, revalidate in the background every minute

export default async function InspirationPage() {
  const [stories, rooms] = await Promise.all([
    apiGetInspirationStories(),
    apiGetRooms(),
  ]);

  return <InspirationGallery stories={stories.map(mapApiStory)} rooms={rooms.map(mapApiRoom)} />;
}
