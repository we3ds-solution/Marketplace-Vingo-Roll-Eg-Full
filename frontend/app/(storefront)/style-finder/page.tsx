"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-card";
import { apiGetProducts } from "@/lib/api/client";
import { mapApiProducts } from "@/lib/api/mappers";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { Product } from "@/types";

type Answers = {
  room: string;
  light: string;
  style: string;
  budget: string;
  effort: string;
};

const QUESTIONS: Array<{
  id: keyof Answers;
  title: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    id: "room",
    title: "Which room are we treating?",
    options: [
      { value: "living-room", label: "Living room" },
      { value: "bedroom", label: "Bedroom" },
      { value: "kids-room", label: "Kids room" },
      { value: "dining-room", label: "Dining room" },
      { value: "home-office", label: "Home office" },
      { value: "kitchen", label: "Kitchen" },
    ],
  },
  {
    id: "light",
    title: "How much light should come through?",
    options: [
      { value: "blackout", label: "Near-dark — sleep, nurseries, media rooms" },
      { value: "light-filtering", label: "Soft, diffused daylight" },
      { value: "sheer", label: "As much air and view as possible" },
    ],
  },
  {
    id: "style",
    title: "What's the room's mood?",
    options: [
      { value: "Minimal", label: "Minimal — quiet planes, no fuss" },
      { value: "Classic", label: "Classic — pleats, tapes, interlining" },
      { value: "Contemporary", label: "Contemporary — matte, deep, motorised" },
      { value: "Natural", label: "Natural — linen, jute, honest weave" },
      { value: "Designer", label: "Designer — statement fabric, full gesture" },
    ],
  },
  {
    id: "budget",
    title: "Budget for the whole window?",
    options: [
      { value: "essential", label: "Essential — solid value, fast decisions" },
      { value: "signature", label: "Signature — better cloth, better hardware" },
      { value: "couture", label: "Couture — no ceiling, the finest we weave" },
    ],
  },
  {
    id: "effort",
    title: "Installation?",
    options: [
      { value: "diy", label: "I'll fit it myself — bracket and click" },
      { value: "professional", label: "Send your technician" },
      { value: "both", label: "Either — advise me" },
    ],
  },
];

function recommendation(answers: Answers): { slug: string; name: string; why: string } {
  if (answers.light === "blackout") {
    return {
      slug: "blackout-curtains",
      name: "Blackout curtains",
      why: "Genuine darkness with a soft, domestic hand — our triple-weave blocks light without the plastic look.",
    };
  }

  if (answers.light === "sheer") {
    return {
      slug: "sheers",
      name: "Sheer curtains",
      why: "Open-weave voile that turns hard afternoon light into a warm haze and keeps your view.",
    };
  }

  switch (answers.style) {
    case "Classic":
      return {
        slug: "drapery",
        name: "Drapery",
        why: "Hand-finished pinch pleats and a weighted hem — the details that make a ceiling feel taller.",
      };
    case "Natural":
      return {
        slug: "wood-woven",
        name: "Wood & woven shades",
        why: "Hand-woven reed and jute with the natural variation of a real material.",
      };
    case "Contemporary":
    case "Minimal":
      return answers.room === "bedroom" || answers.room === "home-office"
        ? {
            slug: "roller-shades",
            name: "Roller shades",
            why: "A single unbroken plane of fabric, recessed hardware and genuinely quiet operation.",
          }
        : {
            slug: "roman-shades",
            name: "Roman shades",
            why: "Crisp flat folds in upholstery-grade cloth, mounted inside or out.",
          };
    case "Designer":
      return {
        slug: "drapery",
        name: "Drapery",
        why: "Full-height, hand-finished drapery in our designer fabrics — the complete gesture.",
      };
    default:
      return {
        slug: "curtains",
        name: "Curtains",
        why: "Made-to-measure curtains in linen, cotton and velvet — hemmed to the millimetre.",
      };
  }
}

export default function StyleFinderPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [products, setProducts] = useState<Product[]>([]);

  const isComplete = QUESTIONS.every((q) => answers[q.id]);
  const result = isComplete ? recommendation(answers as Answers) : null;

  useEffect(() => {
    if (!result) return;
    apiGetProducts({ category: result.slug, pageSize: 4 })
      .then((r) => setProducts(mapApiProducts(r.items)))
      .catch(() => setProducts([]));
  }, [result?.slug]);

  const progress = (step / QUESTIONS.length) * 100;
  const current = QUESTIONS[step];

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Style Finder" }]} />
      <PageHeader
        eyebrow="Style finder"
        title="Which treatment is right for you?"
        description="Five questions, one honest recommendation."
      />
      <Section>
        {!result ? (
          <div className="max-w-2xl">
            <div className="bg-muted h-1.5 overflow-hidden rounded-full" aria-hidden="true">
              <div
                className="bg-accent h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Question {step + 1} of {QUESTIONS.length}
            </p>

            <h2 className="mt-6 text-2xl md:text-3xl">{current?.title}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {current?.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [current.id]: option.value }));
                    setStep((s) => Math.min(s + 1, QUESTIONS.length));
                  }}
                  className="border-border hover:border-accent hover:bg-accent/5 rounded-sm border p-4 text-left text-sm transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back
              </Button>
              {step < QUESTIONS.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!answers[current?.id ?? "room"]}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-card border-border max-w-2xl rounded-sm border p-8">
              <p className="eyebrow">Our recommendation</p>
              <h2 className="mt-2 text-3xl">{result.name}</h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">{result.why}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/shop/${result.slug}`}>
                    Shop {result.name}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnswers({});
                    setStep(0);
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Start over
                </Button>
              </div>
            </div>
            {products.length > 0 && (
              <div className="mt-10">
                <h3 className="mb-6 text-xl">From {result.name}</h3>
                <ProductGrid products={products} density="dense" />
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
