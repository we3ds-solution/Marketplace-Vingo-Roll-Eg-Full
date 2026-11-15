"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!form.displayName.trim()) next.displayName = "Tell us your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    else if (!/[0-9]/.test(form.password)) next.password = "Add at least one number";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signUp(form.displayName.trim(), form.email.trim(), form.password);
      toast.success("Welcome to Vingo Roll");
      router.push("/account");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create your account.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Create account" }]} />
      <PageHeader
        eyebrow="Account"
        title="Create your account"
        description="One account for orders, wishlists and swatch requests."
      />
      <Section>
        <div className="max-w-md">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <Label htmlFor="displayName">Full name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className={`mt-2 ${errors.displayName ? "border-destructive" : ""}`}
                autoComplete="name"
                autoFocus
              />
              {errors.displayName && <p className="text-destructive mt-1 text-xs">{errors.displayName}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`mt-2 ${errors.email ? "border-destructive" : ""}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`mt-2 ${errors.password ? "border-destructive" : ""}`}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-destructive mt-1 text-xs">{errors.password}</p>}
              <p className="text-muted-foreground mt-1 text-xs">Minimum 8 characters with at least one number.</p>
            </div>
            {errors.form && (
              <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-sm border px-4 py-3 text-sm">
                {errors.form}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Creating your account…" : "Create account"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-6 text-sm">
            Already registered?{" "}
            <Link href="/login" className="text-accent underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
