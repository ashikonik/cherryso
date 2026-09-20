import { type ReactNode } from "react";

/**
 * Shared layout for the four legal/contact pages (Privacy, Terms, Refund,
 * Contact). Renders a hero header with the page title and a prose body
 * container with consistent typography.
 *
 * Use the `lastUpdated` prop to display the "Last updated" date in the
 * header. Use the `children` slot for the actual policy text.
 *
 * Pages render as static (no DB, no client interactivity) so they
 * prerender at build time and are SEO-friendly.
 */
export function LegalPage({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description?: string;
  lastUpdated: string; // ISO date e.g. "2026-09-20"
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg mb-3">{description}</p>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Last updated: {formatDate(lastUpdated)}
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  // Best-effort pretty-printer. Falls back to the raw string if the input
  // doesn't parse — never throw from a static page render.
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
