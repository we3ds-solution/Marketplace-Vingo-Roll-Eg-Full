"use client";

import { create } from "zustand";

export type AuthModalMode = "login" | "register";

type UIState = {
  searchOpen: boolean;
  wishlistOpen: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  /** Where to send the user after a successful sign-in/register. */
  authModalNext: string | null;

  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  openWishlist: () => void;
  closeWishlist: () => void;

  openAuthModal: (mode?: AuthModalMode, next?: string | null) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
};

export const useUIStore = create<UIState>()((set, get) => ({
  searchOpen: false,
  wishlistOpen: false,
  authModalOpen: false,
  authModalMode: "login",
  authModalNext: null,

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set({ searchOpen: !get().searchOpen }),

  openWishlist: () => set({ wishlistOpen: true }),
  closeWishlist: () => set({ wishlistOpen: false }),

  openAuthModal: (mode = "login", next = null) =>
    set({ authModalOpen: true, authModalMode: mode, authModalNext: next }),
  closeAuthModal: () => set({ authModalOpen: false, authModalNext: null }),
  setAuthModalMode: (mode) => set({ authModalMode: mode }),
}));
