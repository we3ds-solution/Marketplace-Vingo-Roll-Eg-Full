import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "svc-consultation",
    slug: "design-consultation",
    name: "Design Consultation",
    summary: "Sit with a design specialist in your home, over video, or in a showroom.",
    details: [
      "Fabric and hardware direction for the whole home",
      "Light, privacy and insulation planning per room",
      "Written recommendation with indicative pricing",
    ],
    price: "Complimentary",
  },
  {
    id: "svc-measuring",
    slug: "measuring-installation",
    name: "Measuring & Installation",
    summary: "A certified measurer measures every window; our installers fit, level and test.",
    details: [
      "Inside and outside mount assessment on site",
      "Bracket, clearance, plumb and obstruction checks",
      "Measurements guaranteed against fit errors",
      "Motorised shades paired and scenes configured",
      "Packaging removed and recycled",
    ],
    price: "Measuring credited to your order · fitting quoted per window",
  },
  {
    id: "svc-swatches",
    slug: "swatches",
    href: "/swatches",
    name: "Material Swatches",
    summary: "Generous real-fabric samples delivered so you can judge colour in your own light.",
    details: [
      "Large-format cuttings, not postage stamps",
      "Compare drape, weight and opacity side by side",
      "See colour under morning and evening light",
    ],
    price: "Free",
  },
];
