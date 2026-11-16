import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./styles.css";
import { Providers } from "@/components/providers";
import { SiteSchema } from "@/components/seo/site-schema";

const cairo = Cairo({ subsets: ["latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  metadataBase: new URL("https://vingoroll.com"),
  title: {
    default: "Vingo Roll Studio — Made-to-Measure Curtains & Window Treatments in Cairo",
    template: "%s | Vingo Roll Studio",
  },
  description:
    "Made-to-measure curtains, roller shades, roman blinds, venetian blinds and motorized window treatments — crafted in our Cairo workshop since 1998. Free fabric swatches, certified measuring, professional installation.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vingoroll.com",
    siteName: "Vingo Roll Studio",
    title: "Vingo Roll Studio — Made-to-Measure Curtains & Window Treatments",
    description:
      "Custom curtains, shades and blinds cut for your windows. Free swatches, certified measuring, 3–4 week made-to-order delivery across Cairo & Giza.",
    images: [
      {
        url: "/images/hero/hero-living-room.jpg",
        width: 1600,
        height: 900,
        alt: "Sunlit living room dressed with floor-to-ceiling ivory linen curtains by Vingo Roll",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vingo Roll",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cairo.variable}>
        <SiteSchema />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
