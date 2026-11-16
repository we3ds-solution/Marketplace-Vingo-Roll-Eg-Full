type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/**
 * Renders a JSON-LD <script> block. Structured data is what Google (SEO) and
 * AI answer engines (GEO — ChatGPT, Perplexity, Gemini) use to extract
 * facts, breadcrumbs and Q&A pairs from the page.
 */
export function JsonLd({ data }: { data: JsonLdValue }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
