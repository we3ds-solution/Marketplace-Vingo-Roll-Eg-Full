import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card — the app's reusable card primitive.
 * Matches the storefront/admin card language exactly:
 * hairline `border-border`, `bg-card` surface, `rounded-sm`, no shadow
 * (shadows are reserved for floating panels like dialogs and sheets).
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-border bg-card rounded-sm border", className)}
      {...props}
    />
  );
}

/**
 * CardIconRow — the shared header for icon feature cards:
 * icon chip and title on a single line, vertically centered.
 */
export function CardIconRow({
  icon: Icon,
  title,
  className,
  iconClassName,
}: {
  icon: LucideIcon;
  title: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "bg-accent/10 text-accent grid h-10 w-10 shrink-0 place-items-center rounded-sm",
          iconClassName,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="font-sans text-sm leading-snug font-medium">{title}</h3>
    </div>
  );
}
