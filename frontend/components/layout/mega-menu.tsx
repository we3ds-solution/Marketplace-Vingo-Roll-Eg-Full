import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MegaMenuLink {
  readonly label: string;
  readonly to: string;
  readonly slug?: string;
}

interface MegaMenuColumn {
  readonly title: string;
  readonly links: readonly MegaMenuLink[];
}

interface MegaMenuProps {
  label: string;
  columns: readonly MegaMenuColumn[];
  image?: string;
  imageAlt?: string;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function linkHref(link: MegaMenuLink) {
  return "slug" in link && link.slug ? `/shop/${link.slug}` : link.to;
}

function MenuLink({ link }: { link: MegaMenuLink }) {
  return (
    <Link
      href={linkHref(link)}
      className="text-muted-foreground hover:text-foreground transition-all duration-200 ease-out hover:translate-x-1 text-sm"
    >
      {link.label}
    </Link>
  );
}

function LinkColumn({ column }: { column: MegaMenuColumn }) {
  return (
    <div>
      <h3 className="eyebrow text-xs font-semibold uppercase tracking-wider">{column.title}</h3>
      <ul className="mt-4 space-y-3">
        {column.links.map((link) => (
          <li key={link.label}>
            <MenuLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuImage({ src, alt }: { src: string; alt: string }) {
  // The image column is CSS-hidden below xl — but `<img>` bytes would still download.
  // Render only at xl+; the column keeps its footprint so nothing shifts when bytes arrive.
  const isXl = useMediaQuery("(min-width: 1280px)");

  return (
    <div className="group relative h-full min-h-64 w-full overflow-hidden rounded-xl shadow-lg" aria-hidden={!isXl}>
      {isXl && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1536px) 288px, 256px"
          quality={75}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
    </div>
  );
}

export function MegaMenu({
  label,
  columns,
  image,
  imageAlt,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: MegaMenuProps) {
  return (
    // `static` so the panel anchors to the full-width container-page in the header,
    // not to this narrow trigger — that keeps the panel centered at every screen size.
    <div className="static" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 px-2 py-2 text-[12px] tracking-[0.1em] uppercase transition-colors xl:px-3 xl:text-[13px] xl:tracking-[0.12em]",
          "hover:text-accent",
          isOpen && "text-accent",
        )}
      >
        {label}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label={`${label} menu`}
          className={cn(
            // Viewport-clamped width — never wider than 94vw, centered on the page container.
            "absolute top-full left-1/2 z-50 -translate-x-1/2",
            "w-[min(880px,94vw)] xl:w-[min(1180px,94vw)]",
            "max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain",
            "bg-card border border-border/50 rounded-2xl p-6 shadow-lg",
            "dark:bg-card/90 dark:border-border backdrop-blur-md",
            "animate-fade-in transition-all duration-200 ease-out",
          )}
        >
          <div className="flex items-stretch gap-8 xl:gap-12">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-8 gap-y-6">
              {columns.map((column) => (
                <LinkColumn key={column.title} column={column} />
              ))}
            </div>
            {image && (
              <div className="hidden w-64 flex-shrink-0 xl:block 2xl:w-72">
                <MenuImage src={image} alt={imageAlt || label} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
