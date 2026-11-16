"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { useUIStore, type AuthModalMode } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { ShoppingBag, Store, Eye, EyeOff, CheckCircle2, Clock3 } from "lucide-react";

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function AuthModal() {
  const open = useUIStore((s) => s.authModalOpen);
  const mode = useUIStore((s) => s.authModalMode);
  const setMode = useUIStore((s) => s.setAuthModalMode);
  const next = useUIStore((s) => s.authModalNext);
  const closeModal = useUIStore((s) => s.closeAuthModal);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ displayName: "", email: "", password: "", companyName: "", message: "" });
  const [accountType, setAccountType] = useState<"client" | "vendor">("client");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  // Reset form whenever the modal is opened fresh
  useEffect(() => {
    if (open) {
      setForm({ displayName: "", email: "", password: "", companyName: "", message: "" });
      setAccountType("client");
      setErrors({});
      setSubmitting(false);
      setShowPassword(false);
      setVendorSubmitted(false);
    }
  }, [open, mode]);

  const finish = () => {
    closeModal();
    if (next) {
      router.push(next);
      router.refresh();
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (mode === "register") {
      if (!form.displayName.trim()) nextErrors.displayName = "Tell us your name";
      if (accountType === "vendor" && !form.companyName.trim()) {
        nextErrors.companyName = "Every vendor application needs a company name";
      }
    }
    if (!emailRe.test(form.email)) nextErrors.email = "Enter a valid email address";
    if (mode === "register") {
      if (form.password.length < 8) nextErrors.password = "Use at least 8 characters";
      else if (!/[0-9]/.test(form.password)) nextErrors.password = "Add at least one number";
    } else if (!form.password) {
      nextErrors.password = "Enter your password";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(form.email.trim(), form.password);
        toast.success("Welcome back");
        finish();
      } else {
        await signUp(
          form.displayName.trim(),
          form.email.trim(),
          form.password,
          accountType,
          accountType === "vendor"
            ? { companyName: form.companyName.trim(), message: form.message.trim() }
            : undefined,
        );
        if (accountType === "vendor") {
          setVendorSubmitted(true);
        } else {
          toast.success("Welcome to Vingo Roll");
          finish();
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (value: AuthModalMode) => {
    setMode(value);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : closeModal())}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-md">
        {vendorSubmitted ? (
          <div className="py-4 text-center">
            <span className="mb-4 inline-grid h-16 w-16 place-items-center rounded-full bg-amber-500/10">
              <Clock3 className="h-8 w-8 text-amber-500" aria-hidden="true" />
            </span>
            <DialogTitle className="font-display text-2xl">Application received</DialogTitle>
            <DialogDescription className="mt-3 text-sm leading-relaxed">
              We have your vendor application for <span className="text-foreground font-semibold">{form.companyName}</span>.
              Our trade desk reviews every application — usually within 1–2 business days.
            </DialogDescription>
            <div className="bg-muted/60 mt-5 rounded-sm border border-border p-4 text-start text-xs leading-relaxed">
              <p className="text-muted-foreground">
                You can keep shopping as a <span className="text-foreground font-medium">client</span> right now. Once
                approved, your account becomes a <span className="text-foreground font-medium">vendor account</span> and
                we&apos;ll send you a message in your notifications.
              </p>
            </div>
            <Button className="mt-6 w-full" onClick={closeModal}>
              Done — keep browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/favicon.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
                aria-hidden="true"
              />
              <div>
                <DialogTitle className="font-display text-xl leading-tight">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {mode === "login"
                    ? "Track orders, swatches and saved designs."
                    : "One account for orders, wishlist and the design concierge."}
                </DialogDescription>
              </div>
            </div>

            {/* Mode toggle */}
            <div role="tablist" aria-label="Authentication mode" className="bg-muted mb-5 flex rounded-sm p-1">
              <TabButton active={mode === "login"} onClick={() => switchMode("login")}>
                Sign in
              </TabButton>
              <TabButton active={mode === "register"} onClick={() => switchMode("register")}>
                Create account
              </TabButton>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="displayName">Full name</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className={cn("mt-1.5", errors.displayName && "border-destructive")}
                    autoComplete="name"
                    placeholder="Alexandra Moreau"
                  />
                  {errors.displayName && <p className="text-destructive mt-1 text-xs">{errors.displayName}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={cn("mt-1.5", errors.email && "border-destructive")}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={cn("pe-10", errors.password && "border-destructive")}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder={mode === "login" ? "Your password" : "8+ characters, add a number"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive mt-1 text-xs">{errors.password}</p>}
              </div>

              {/* Account type — register only */}
              {mode === "register" && (
                <fieldset>
                  <legend className="text-sm font-medium">How will you use Vingo Roll?</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: "client", label: "Client", note: "Shop & save designs", icon: ShoppingBag },
                        { value: "vendor", label: "Vendor", note: "Trade / pro program", icon: Store },
                      ] as const
                    ).map(({ value, label, note, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAccountType(value)}
                        aria-pressed={accountType === value}
                        className={cn(
                          "rounded-sm border p-3 text-start transition-all",
                          accountType === value
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/60",
                        )}
                      >
                        <Icon className="text-accent mb-1.5 h-5 w-5" aria-hidden="true" />
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="text-muted-foreground mt-0.5 block text-[11px] leading-snug">{note}</span>
                      </button>
                    ))}
                  </div>

                  {accountType === "vendor" && (
                    <div className="mt-3 space-y-3">
                      <div className="border-accent/30 bg-accent/5 rounded-sm border px-3 py-2 text-[11px] leading-snug">
                        Vendor accounts are reviewed by our trade desk. You shop as a client meanwhile —
                        we flip the account to Vendor once approved.
                      </div>
                      <div>
                        <Label htmlFor="companyName">Company name</Label>
                        <Input
                          id="companyName"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          className={cn("mt-1.5", errors.companyName && "border-destructive")}
                          placeholder="Moreau Interiors LLC"
                        />
                        {errors.companyName && <p className="text-destructive mt-1 text-xs">{errors.companyName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="vendorMessage">Anything we should know? (optional)</Label>
                        <textarea
                          id="vendorMessage"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          rows={2}
                          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring mt-1.5 flex w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Trade license, project volume, showroom…"
                        />
                      </div>
                    </div>
                  )}
                </fieldset>
              )}

              {errors.form && (
                <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-sm border px-3 py-2 text-xs">
                  {errors.form}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting
                  ? mode === "login"
                    ? "Signing you in…"
                    : "Creating your account…"
                  : mode === "login"
                    ? "Sign in"
                    : accountType === "vendor"
                      ? "Apply as vendor"
                      : "Create account"}
              </Button>
            </form>

            <p className="text-muted-foreground mt-4 text-center text-[11px]">
              {mode === "login" ? "New to Vingo Roll?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="text-accent hover:underline">
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
