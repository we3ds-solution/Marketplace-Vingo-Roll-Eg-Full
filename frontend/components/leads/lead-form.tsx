"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiCreateLead, ApiError } from "@/lib/api/client";

type LeadFormProps = {
  leadType: "quote" | "swatches" | "consultation" | "contact";
  /** Where the lead came from, e.g. "quote-page" — useful for follow-up. */
  source: string;
  submitLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
};

/**
 * Shared lead-capture form — every enquiry path on the demo site
 * (quote, contact, consultation, trade, measuring) lands in the leads inbox.
 */
export function LeadForm({
  leadType,
  source,
  submitLabel = "Send message",
  messageLabel = "How can we help?",
  messagePlaceholder,
}: LeadFormProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ||
      form.message.trim().length < 10
    ) {
      setError("Please add your name, a valid email and a message of at least 10 characters.");
      return;
    }

    setError("");
    setSending(true);

    try {
      await apiCreateLead({
        leadType,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        source,
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send your message — please try again.",
      );
      toast.error("Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="border-border max-w-xl rounded-sm border p-8" role="status">
        <h2 className="text-2xl">Message received</h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Thank you, {form.name.trim()}. Our studio will get back to you within one business day.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => {
          setSent(false);
          setForm({ name: "", email: "", phone: "", message: "" });
        }}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lead-name">Name</Label>
          <Input
            id="lead-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2"
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="lead-phone">Phone (optional)</Label>
          <Input
            id="lead-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2"
            autoComplete="tel"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="lead-email">Email</Label>
        <Input
          id="lead-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-2"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="lead-message">{messageLabel}</Label>
        <Textarea
          id="lead-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2"
          placeholder={messagePlaceholder}
        />
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={sending}>
        {sending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
