"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Simple accessible table for admin lists. */
export function AdminTable({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="border-border overflow-hidden overflow-x-auto rounded-sm border">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function AdminTHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-muted/60 text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-2.5 text-xs font-semibold uppercase tracking-wide", className)}>{children}</th>;
}

export function AdminTd({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function AdminTr({ children, className }: { children?: ReactNode; className?: string }) {
  return <tr className={cn("border-t border-border", className)}>{children}</tr>;
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function AdminEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-border rounded-sm border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
