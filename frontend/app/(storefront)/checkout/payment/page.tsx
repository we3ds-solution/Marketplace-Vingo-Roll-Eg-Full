"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, FileText, BadgeDollarSign } from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    value: "quote",
    icon: FileText,
    title: "Invoice me",
    description: "Our studio confirms every detail, then invoices you after signing off.",
  },
  {
    value: "card",
    icon: CreditCard,
    title: "Credit card (demo)",
    description: "Simulated payment — no card details are collected or charged.",
  },
  {
    value: "cod",
    icon: BadgeDollarSign,
    title: "Pay on delivery",
    description: "Pay the installer once your treatments are hung.",
  },
] as const;

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<string>(() => {
    if (typeof window === "undefined") return "quote";
    return sessionStorage.getItem("checkout_payment") ?? "quote";
  });

  const handleContinue = () => {
    sessionStorage.setItem("checkout_payment", method);
    router.push("/checkout/review");
  };

  return (
    <>
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
          { label: "Payment" },
        ]}
      />
      <PageHeader
        eyebrow="Step 2 of 3"
        title="Payment"
        description="This is a demonstration site. No payment is processed — choose how you'd like to pay."
      />
      <Section>
        <div className="max-w-2xl space-y-4">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = method === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMethod(option.value)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-4 rounded-sm border p-5 text-left transition-colors",
                  active ? "border-accent bg-accent/5" : "border-border hover:border-accent",
                )}
              >
                <span className="bg-accent/10 text-accent grid h-10 w-10 shrink-0 place-items-center rounded-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{option.title}</span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}

          <div className="flex gap-3 pt-4">
            <Button size="lg" onClick={handleContinue}>
              Continue to Review
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/checkout">Back</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
