import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style finder — Which treatment fits your room?",
  description:
    "Answer five quick questions about light, privacy and style — get matched to curtains, roller shades or blinds that actually fit your room.",
  alternates: { canonical: "/style-finder" },
};

export default function StyleFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
