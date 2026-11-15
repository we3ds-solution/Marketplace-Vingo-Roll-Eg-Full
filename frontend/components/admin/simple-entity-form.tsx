"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export type FieldDef =
  | { kind: "text" | "slug" | "textarea" | "number" | "url"; name: string; label: string; required?: boolean; rows?: number; placeholder?: string; mono?: boolean }
  | { kind: "checkbox"; name: string; label: string }
  | { kind: "select"; name: string; label: string; options: Array<{ value: string; label: string }> }
  | { kind: "list"; name: string; label: string; placeholder?: string };

type SimpleEntityFormProps = {
  title: string;
  description?: string;
  listEndpoint: string;
  fields: FieldDef[];
  /** Map of field name for slug auto-fill, if any. */
  slugFrom?: string;
};

export function SimpleEntityForm({ title, description, listEndpoint, fields, slugFrom }: SimpleEntityFormProps) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { authedFetch } = useAuth();
  const isEdit = Boolean(params?.id);

  const detail = useQuery({
    queryKey: ["admin", "detail", listEndpoint, params?.id],
    queryFn: () => authedFetch<Record<string, unknown>>(`${listEndpoint}/${params!.id}`),
    enabled: isEdit,
  });

  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    for (const field of fields) {
      if (field.kind === "checkbox") initial[field.name] = true;
      else initial[field.name] = "";
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!detail.data) return;
    const next: Record<string, string | boolean> = {};
    for (const field of fields) {
      const raw = detail.data[field.name];
      if (field.kind === "checkbox") {
        next[field.name] = Boolean(raw);
      } else if (field.kind === "list") {
        next[field.name] = Array.isArray(raw) ? (raw as string[]).join(", ") : "";
      } else {
        next[field.name] = raw == null ? "" : String(raw);
      }
    }
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data]);

  const set = (name: string, value: string | boolean) =>
    setValues((v) => ({ ...v, [name]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    const body: Record<string, unknown> = {};

    for (const field of fields) {
      const raw = values[field.name];

      if (field.kind === "checkbox") {
        body[field.name] = Boolean(raw);
        continue;
      }

      if (field.kind === "list") {
        body[field.name] = String(raw)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        continue;
      }

      if (field.kind === "number") {
        const num = Number(raw);
        if (field.required && !(num >= 0)) {
          nextErrors[field.name] = "Enter a number ≥ 0";
          continue;
        }
        body[field.name] = Number.isFinite(num) ? num : 0;
        continue;
      }

      if (field.kind === "select") {
        body[field.name] = String(raw) === "" ? null : String(raw);
        continue;
      }

      const text = String(raw).trim();
      if (field.required && !text) {
        nextErrors[field.name] = "This field is required";
        continue;
      }
      if (field.kind === "slug" && text && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
        nextErrors[field.name] = "Use lowercase letters, numbers and hyphens";
        continue;
      }
      body[field.name] = text === "" ? null : text;
    }

    // Auto slug from the source field if slug is empty
    if (slugFrom && !String(body.slug ?? "").trim()) {
      const source = String(body[slugFrom] ?? "").trim().toLowerCase();
      body.slug = source
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authedFetch(isEdit ? `${listEndpoint}/${params!.id}` : listEndpoint, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      toast.success(isEdit ? "Saved" : "Created");
      router.push(listEndpoint.replace("/api/v1/admin", "/admin"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && detail.isLoading) {
    return <div className="bg-muted h-96 animate-pulse rounded-sm" />;
  }

  if (isEdit && detail.error) {
    return <p role="alert" className="text-destructive text-sm">Could not load this record.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? `Edit ${title}` : title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>

      {fields.map((field) => {
        const value = values[field.name];
        const error = errors[field.name];
        const key = field.name;

        if (field.kind === "checkbox") {
          return (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={Boolean(value)} onCheckedChange={(v) => set(key, Boolean(v))} />
              {field.label}
            </label>
          );
        }

        if (field.kind === "select") {
          return (
            <div key={key}>
              <Label htmlFor={key}>{field.label}</Label>
              <Select value={String(value)} onValueChange={(v) => set(key, v)}>
                <SelectTrigger id={key} className="mt-1.5">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.kind === "textarea") {
          return (
            <div key={key}>
              <Label htmlFor={key}>{field.label}</Label>
              <Textarea
                id={key}
                rows={field.rows ?? 3}
                value={String(value)}
                onChange={(e) => set(key, e.target.value)}
                placeholder={field.placeholder}
                className={`mt-1.5 ${error ? "border-destructive" : ""}`}
              />
              {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
            </div>
          );
        }

        if (field.kind === "list") {
          return (
            <div key={key}>
              <Label htmlFor={key}>{field.label}</Label>
              <Input
                id={key}
                value={String(value)}
                onChange={(e) => set(key, e.target.value)}
                placeholder={field.placeholder ?? "one, two, three"}
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-muted-foreground mt-1 text-xs">Comma-separated</p>
            </div>
          );
        }

        return (
          <div key={key}>
            <Label htmlFor={key}>{field.label}</Label>
            <Input
              id={key}
              type={field.kind === "number" ? "number" : "text"}
              min={field.kind === "number" ? 0 : undefined}
              step={field.kind === "number" ? "0.01" : undefined}
              value={String(value)}
              onChange={(e) => set(key, e.target.value)}
              placeholder={field.placeholder}
              className={`mt-1.5 ${field.mono ? "font-mono text-xs" : ""} ${error ? "border-destructive" : ""}`}
            />
            {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
          </div>
        );
      })}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
