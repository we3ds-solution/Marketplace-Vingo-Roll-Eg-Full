import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./styles.css";
import { Providers } from "@/components/providers";

const cairo = Cairo({ subsets: ["latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: {
    default: "Vingo Roll Studio - Premium Window Treatments",
    template: "%s | Vingo Roll Studio",
  },
  description: "Made-to-measure curtains & window treatments",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
