"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConsentStore } from "@/stores/consent-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cookie, ChevronDown, X } from "lucide-react";

/**
 * Cookie-consent banner — pinned bottom-center at every screen size.
 * Centering is done by layout (flexbox) so keyframe transforms never fight it;
 * the animation only moves vertically. Appears 5s after a first visit;
 * `animate-toast-in` on mount, `animate-toast-out` when decided/dismissed.
 */
export function CookieConsent() {
  const consent = useConsentStore((s) => s.consent);
  const hydrated = useConsentStore((s) => s.hydrated);
  const preferencesVisible = useConsentStore((s) => s.preferencesVisible);
  const hydrateFromCookie = useConsentStore((s) => s.hydrateFromCookie);
  const acceptAll = useConsentStore((s) => s.acceptAll);
  const acceptEssentialOnly = useConsentStore((s) => s.acceptEssentialOnly);
  const saveCustom = useConsentStore((s) => s.saveCustom);

  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: true, marketing: false });

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  // 5s delay, only if no decision stored and not manually reopened
  useEffect(() => {
    if (!hydrated) return;
    if (consent) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), 5000);
    return () => window.clearTimeout(id);
  }, [hydrated, consent]);

  useEffect(() => {
    if (preferencesVisible) {
      setShow(true);
      setClosing(false);
    }
  }, [preferencesVisible]);

  const decide = (action: () => void) => {
    setClosing(true);
    window.setTimeout(() => {
      action();
      setShow(false);
      setClosing(false);
      setCustomizing(false);
    }, 260);
  };

  const visible = hydrated && (preferencesVisible || (consent === null && show));

  if (!hydrated || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie preferences"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 sm:px-6"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "border-border bg-card/95 max-h-[calc(100dvh-2.5rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md sm:p-5",
          "pointer-events-auto",
          closing ? "animate-toast-out" : "animate-toast-in",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="bg-accent/10 text-accent grid h-9 w-9 shrink-0 place-items-center rounded-md">
              <Cookie className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">Your privacy, your choice</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
                We use a handful of cookies to keep your cart, wishlist and preferences working.
                Choose what you are comfortable with.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => decide(acceptEssentialOnly)}
            aria-label="Accept essential cookies only"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring grid h-8 w-8 shrink-0 place-items-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {customizing && (
          <div className="border-border mt-3 space-y-3 border-t pt-3 text-xs">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block font-medium">Preferences</span>
                <span className="text-muted-foreground">Theme, recent searches, sidebar state</span>
              </span>
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={(e) => setPrefs((p) => ({ ...p, preferences: e.target.checked }))}
                className="accent-accent h-4 w-4"
                aria-label="Allow preference cookies"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block font-medium">Marketing</span>
                <span className="text-muted-foreground">Measurement & attribution (Google OAuth ads)</span>
              </span>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                className="accent-accent h-4 w-4"
                aria-label="Allow marketing cookies"
              />
            </label>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!customizing ? (
            <>
              <Button size="sm" onClick={() => decide(acceptAll)}>
                Accept all
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide(acceptEssentialOnly)}>
                Essential only
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCustomizing(true)}
                className="gap-1 text-xs"
                aria-expanded={customizing}
              >
                Customize
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => decide(() => saveCustom(prefs.preferences, prefs.marketing))}
              >
                Save choices
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCustomizing(false)}>
                Back
              </Button>
            </>
          )}
          <Link href="/legal/cookies" className="text-muted-foreground hover:text-foreground ms-auto text-[11px] underline-offset-2 hover:underline">
            Cookie details
          </Link>
        </div>
      </div>
    </div>
  );
}
