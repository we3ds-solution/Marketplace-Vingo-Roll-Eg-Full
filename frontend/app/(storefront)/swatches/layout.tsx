import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free fabric swatches — Judge colour in your own light",
  description:
    "Order up to eight real-fabric swatches free — drape, weight and opacity compared side by side, in your own home, in your own light.",
  alternates: { canonical: "/swatches" },
};

export default function SwatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
