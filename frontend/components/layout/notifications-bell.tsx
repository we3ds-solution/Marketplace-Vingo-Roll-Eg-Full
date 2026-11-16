"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsBell() {
  const { status, authedFetch } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => authedFetch<NotificationsResponse>("/api/v1/notifications"),
    enabled: status === "authenticated",
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => authedFetch(`/api/v1/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => authedFetch("/api/v1/notifications/read-all", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status !== "authenticated") return null;

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="hover:text-accent focus-visible:ring-ring relative grid h-10 w-10 place-items-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="bg-accent text-accent-foreground absolute -top-0.5 -end-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none font-semibold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="animate-menu-in border-border bg-card absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-muted-foreground hover:text-accent inline-flex items-center gap-1 text-[11px] transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-96 divide-border divide-y overflow-y-auto">
            {items.length === 0 ? (
              <li className="flex flex-col items-center px-6 py-10 text-center">
                <Inbox className="text-muted-foreground mb-3 h-8 w-8 opacity-40" aria-hidden="true" />
                <p className="text-muted-foreground text-sm">You&apos;re all caught up.</p>
              </li>
            ) : (
              items.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => markRead.mutate(item.id)}
                    className={cn(
                      "hover:bg-muted/60 flex w-full items-start gap-3 px-4 py-3 text-start transition-colors",
                      !item.isRead && "bg-accent/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.isRead ? "bg-transparent" : "bg-accent",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cn("truncate text-xs font-semibold", item.isRead && "text-muted-foreground")}>
                          {item.title}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[10px]">{relativeTime(item.createdAt)}</span>
                      </span>
                      <span className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] leading-snug">
                        {item.body}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
