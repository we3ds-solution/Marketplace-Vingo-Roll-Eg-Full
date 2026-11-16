"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";

export type FaqItem = { question: string; answer: string };

/**
 * Visible FAQ accordion + matching FAQPage JSON-LD.
 *
 * The schema is generated from the same source of truth as the visible
 * answers, so search and answer engines see exactly what the visitor sees.
 * Questions are phrased as natural queries — the exact strings people type
 * (and that AI engines quote back).
 */
export function Faq({
  title = "Frequently asked questions",
  items,
  id = "faq",
}: {
  title?: string;
  items: FaqItem[];
  id?: string;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-12">
      <h2 id={`${id}-heading`} className="font-display text-2xl leading-tight">
        {title}
      </h2>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <Accordion type="single" collapsible className="mt-6">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-sm font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
