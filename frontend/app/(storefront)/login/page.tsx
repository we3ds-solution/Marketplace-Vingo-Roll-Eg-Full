"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(form.email.trim(), form.password);
      toast.success("Welcome back");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section>
      <div className="max-w-md">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-sm border px-4 py-3 text-sm">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Signing you in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-sm">
          New here?{" "}
          <Link href="/register" className="text-accent underline underline-offset-4">
            Create an account
          </Link>{" "}
          — it takes ten seconds.
        </p>
      </div>
    </Section>
  );
}

export default function LoginPage() {
  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Sign in" }]} />
      <PageHeader
        eyebrow="Welcome back"
        title="Sign in"
        description="Track orders, saved designs and swatch requests."
      />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </>
  );
}
