"use client";

import { create } from "zustand";
import { getCookie, setCookie } from "@/lib/cookies";

/**
 * Cookie-consent state. The banner stores a single decision cookie (`vingo_consent`)
 * with a year-long lifetime. Categories:
 *   - essential: always on (session, cart, preferences)
 *   - preferences: UI/UX memory (theme, recent searches, sidebar state)
 *   - marketing: attribution & remarketing
 */
export type ConsentChoice = "all" | "essential" | "custom";

export type ConsentPayload = {
  v: 1;
  choice: ConsentChoice;
  preferences: boolean;
  marketing: boolean;
  /** Epoch ms the decision was recorded */
  decidedAt: number;
};

const CONSENT_COOKIE = "vingo_consent";

function serialize(payload: ConsentPayload): string {
  return JSON.stringify(payload);
}

function parse(raw: string | null): ConsentPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPayload>;
    if (parsed && parsed.v === 1 && typeof parsed.decidedAt === "number") {
      return {
        v: 1,
        choice: (parsed.choice as ConsentChoice) ?? "custom",
        preferences: Boolean(parsed.preferences),
        marketing: Boolean(parsed.marketing),
        decidedAt: parsed.decidedAt,
      };
    }
    return null;
  } catch {
    return null;
  }
}

type ConsentState = {
  /** null until the client has read the cookie */
  consent: ConsentPayload | null;
  hydrated: boolean;
  /** Forces the banner open (e.g. from “Cookie preferences” in the footer) */
  preferencesVisible: boolean;
  hydrateFromCookie: () => void;
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  saveCustom: (preferences: boolean, marketing: boolean) => void;
  reopenPreferences: () => void;
  closePreferences: () => void;
};

export const useConsentStore = create<ConsentState>()((set, get) => ({
  consent: null,
  hydrated: false,
  preferencesVisible: false,

  hydrateFromCookie: () => {
    set({ consent: parse(getCookie(CONSENT_COOKIE)), hydrated: true });
  },

  acceptAll: () => {
    const payload: ConsentPayload = { v: 1, choice: "all", preferences: true, marketing: true, decidedAt: Date.now() };
    setCookie(CONSENT_COOKIE, serialize(payload), { days: 365, sameSite: "lax" });
    set({ consent: payload, preferencesVisible: false });
  },

  acceptEssentialOnly: () => {
    const payload: ConsentPayload = { v: 1, choice: "essential", preferences: false, marketing: false, decidedAt: Date.now() };
    setCookie(CONSENT_COOKIE, serialize(payload), { days: 365, sameSite: "lax" });
    set({ consent: payload, preferencesVisible: false });
  },

  saveCustom: (preferences, marketing) => {
    const payload: ConsentPayload = { v: 1, choice: "custom", preferences, marketing, decidedAt: Date.now() };
    setCookie(CONSENT_COOKIE, serialize(payload), { days: 365, sameSite: "lax" });
    set({ consent: payload, preferencesVisible: false });
  },

  reopenPreferences: () => set({ preferencesVisible: true }),
  closePreferences: () => set({ preferencesVisible: false }),
}));
