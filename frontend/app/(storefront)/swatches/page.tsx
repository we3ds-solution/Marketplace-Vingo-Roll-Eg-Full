"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, CheckCircle2, GitCompare, Plus, X } from "lucide-react";
import { Crumbs, PageHeader, Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { swatches, SWATCH_LIMIT } from "@/lib/data/swatches";
import { useSwatchStore } from "@/stores/swatch-store";
import { apiCreateLead, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SwatchesPage() {
  const { ids, compareIds, toggle, remove, clear, toggleCompare } = useSwatchStore();

  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selected = useMemo(() => swatches.filter((s) => ids.includes(s.id)), [ids]);
  const compareItems = useMemo(
    () => swatches.filter((s) => compareIds.includes(s.id)),
    [compareIds],
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Valid email required";
    if (form.phone && !/^[+()\-.\s\d]{7,20}$/.test(form.phone)) next.phone = "Check the phone number";
    if (selected.length === 0) next.selection = "Pick at least one swatch";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateLead({
        leadType: "swatches",
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: [
          `Swatches requested (${selected.length}/${SWATCH_LIMIT}):`,
          ...selected.map((s) => `- ${s.name} (${s.hex})`),
          form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        source: "swatches-page",
      });
      setDone(true);
      clear();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not send your request — try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Free Swatches" }]} />
        <PageHeader
          eyebrow="Materials"
          title="Swatches on the way"
          description="We've logged your request."
        />
        <Section>
          <div className="max-w-xl text-center mx-auto space-y-6 py-12">
            <CheckCircle2 className="text-emerald-600 mx-auto h-12 w-12" aria-hidden="true" />
            <h2 className="text-2xl">Thank you — we&apos;ll get these in the post</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your swatches ship within 2–3 business days. When they arrive, lay them against your
              actual light at different times of day — that&apos;s the only honest test.
            </p>
            <Button asChild>
              <a href="/shop">Browse treatments</a>
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Free Swatches" }]} />
      <PageHeader
        eyebrow="Materials"
        title="Order free swatches"
        description={`Up to ${SWATCH_LIMIT} generous fabric samples delivered to your door — no strings, no card required.`}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          {/* Catalog */}
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {swatches.map((swatch) => {
                const selectedCount = ids.includes(swatch.id);
                const limitReached = ids.length >= SWATCH_LIMIT && !selectedCount;
                return (
                  <div
                    key={swatch.id}
                    className={cn(
                      "border-border flex flex-col rounded-sm border p-4 transition-colors",
                      selectedCount && "border-accent bg-accent/5",
                    )}
                  >
                    <div
                      className="h-20 w-full rounded-sm border border-black/10"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-semibold leading-tight">{swatch.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {swatch.material} · {swatch.colorFamily}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[11px] uppercase tracking-wide">
                      {swatch.lightControl}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedCount ? "default" : "outline"}
                        className="flex-1 gap-1"
                        disabled={limitReached}
                        onClick={() => toggle(swatch.id)}
                        aria-pressed={selectedCount}
                      >
                        {selectedCount ? (
                          <>
                            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Selected
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
                          </>
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(swatch.id)}
                        aria-pressed={compareIds.includes(swatch.id)}
                        title="Add to compare"
                        className={cn(
                          "border-border grid h-8 w-8 place-items-center rounded-sm border transition-colors",
                          compareIds.includes(swatch.id)
                            ? "border-accent text-accent"
                            : "text-muted-foreground hover:border-accent",
                        )}
                      >
                        <GitCompare className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection + form */}
          <aside className="space-y-6">
            <div className="bg-card border-border rounded-sm border p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Your selection ({selected.length}/{SWATCH_LIMIT})
                </h3>
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-muted-foreground hover:text-destructive text-xs underline underline-offset-4"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {selected.length === 0 ? (
                <p className="text-muted-foreground mt-4 text-sm">
                  Add swatches from the catalog — most clients order 3–5.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {selected.map((s) => (
                    <li
                      key={s.id}
                      className="border-border flex items-center gap-3 rounded-sm border p-2 text-sm"
                    >
                      <span
                        className="h-8 w-8 shrink-0 rounded-sm border border-black/10"
                        style={{ backgroundColor: s.hex }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">{s.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        aria-label={`Remove ${s.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.selection && (
                <p className="text-destructive mt-2 text-xs">{errors.selection}</p>
              )}
            </div>

            {/* Compare tray */}
            {compareItems.length >= 2 && (
              <div className="bg-card border-border rounded-sm border p-6">
                <h3 className="text-sm font-semibold">Side by side</h3>
                <div
                  className="mt-3 h-16 w-full rounded-sm border border-black/10"
                  style={{
                    background: `linear-gradient(to right, ${compareItems
                      .map((s) => `${s.hex} 0 ${100 / compareItems.length}%`)
                      .join(", ")})`,
                  }}
                  aria-hidden="true"
                />
                <ul className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {compareItems.map((s) => (
                    <li key={s.id}>
                      {s.name} · {s.lightControl}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Order form */}
            <form onSubmit={onSubmit} className="bg-card border-border rounded-sm border p-6" noValidate>
              <h3 className="text-sm font-semibold">Where do they go?</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={errors.name ? "border-destructive" : ""}
                    autoComplete="name"
                  />
                  {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={errors.email ? "border-destructive" : ""}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className={errors.phone ? "border-destructive" : ""}
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="text-destructive mt-1 text-xs">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="notes">Room notes (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    placeholder="e.g. Bedroom, west-facing, wall is 2.8m"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Sending request…" : "Request my swatches"}
                </Button>
                <p className="text-muted-foreground text-xs">
                  No payment required — samples are free and ship in 2–3 days.
                </p>
              </div>
            </form>
          </aside>
        </div>
      </Section>
    </>
  );
}
