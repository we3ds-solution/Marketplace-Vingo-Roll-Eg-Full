"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useConsentStore } from "@/stores/consent-store";
import { footerColumns } from "@/lib/data/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiSubscribeNewsletter, ApiError } from "@/lib/api/client";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage(null);

    try {
      await apiSubscribeNewsletter(email);
      setStatus("done");
      setEmail("");
      setMessage("Thank you — you're on the list.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof ApiError ? error.message : "Could not subscribe — please try again.",
      );
    }
  }

  return (
    <footer className="border-border bg-card border-t">
      <div className="container-page py-16">
        <div className="border-border grid gap-6 border-b pb-14 lg:grid-cols-[1.2fr_2fr] lg:gap-10">
          <div>
            <Link href="/" className="font-display text-2xl tracking-[0.2em] uppercase">
              Vingo<span className="text-accent">.</span>Roll
            </Link>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              Made-to-measure curtains, shades and blinds — with the measuring, design and
              installation help that makes them fit.
            </p>
            <form onSubmit={onSubmit} className="mt-8 max-w-sm" noValidate>
              <label htmlFor="newsletter" className="eyebrow mb-2 block">
                Journal & new arrivals
              </label>
              <div className="flex gap-2">
                <Input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="you@example.com"
                  aria-invalid={status === "error"}
                  aria-describedby="newsletter-status"
                />
                <Button type="submit" variant="secondary" disabled={status === "submitting"}>
                  {status === "submitting" ? "Joining…" : "Join"}
                </Button>
              </div>
              <p
                id="newsletter-status"
                role="status"
                className={`mt-2 min-h-5 text-xs ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {message ?? " "}
              </p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="eyebrow mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={"slug" in link && link.slug ? `/shop/${link.slug}` : link.to}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground flex flex-col gap-4 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Vingo Roll. All prices indicative and for demonstration.
          </p>
          <ul className="flex flex-wrap items-center gap-5">
            <li>Instagram</li>
            <li>Pinterest</li>
            <li>Journal</li>
            <li>
              <button
                type="button"
                onClick={() => useConsentStore.getState().reopenPreferences()}
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:outline-none focus-visible:ring-2 rounded-sm"
              >
                Cookie preferences
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
