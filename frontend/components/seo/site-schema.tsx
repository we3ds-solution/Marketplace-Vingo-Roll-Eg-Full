import { JsonLd } from "@/components/seo/json-ld";

const baseUrl = "https://vingoroll.com";

/**
 * Site-wide structured data: the Organization/LocalBusiness entity and the
 * WebSite search action. Emitted once in the root layout.
 */
export function SiteSchema() {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": ["Organization", "LocalBusiness"],
          "@id": `${baseUrl}/#organization`,
          name: "Vingo Roll Studio",
          alternateName: "Vingo Roll",
          url: baseUrl,
          logo: `${baseUrl}/favicon.svg`,
          image: `${baseUrl}/images/hero/hero-living-room.jpg`,
          description:
            "Made-to-measure curtains, roller shades, roman blinds and motorized window treatments in Cairo, Egypt. Free fabric swatches, certified measuring, professional installation and a 5-year hardware warranty.",
          foundingDate: "1998",
          address: {
            "@type": "PostalAddress",
            streetAddress: "27 Road 90, 5th Settlement",
            addressLocality: "New Cairo",
            addressRegion: "Cairo Governorate",
            addressCountry: "EG",
          },
          telephone: "+20 2 2418 6090",
          email: "hello@vingoroll.com",
          openingHours: ["Sa-Th 09:00-18:00"],
          areaServed: [
            { "@type": "City", name: "Cairo" },
            { "@type": "City", name: "Giza" },
            { "@type": "Place", name: "New Cairo" },
            { "@type": "Place", name: "6th of October" },
            { "@type": "Place", name: "Sheikh Zayed" },
          ],
          sameAs: [
            "https://www.instagram.com/vingoroll",
            "https://www.pinterest.com/vingoroll",
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Vingo Roll Studio",
          publisher: { "@id": `${baseUrl}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
      ]}
    />
  );
}
