import { PenSquare } from "lucide-react";

import type { UnderDevelopmentContent } from "@/features/under-development/types/underDevelopment.types";
import { cn } from "@/shared/lib/cn";

const content: UnderDevelopmentContent = {
  label: "Journal",
  brand: "Beauty Professionals Magazine",
  headline: "The site is currently under development",
  description:
    "Please come back later. We are preparing a new journal experience for beauty professionals.",
  footer: "\u00a9 2026 Beauty Professionals Magazine",
};

export function UnderDevelopmentPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
      <section
        className={cn(
          "w-full max-w-6xl border border-[color:var(--border)] bg-white/80",
          "shadow-[0_24px_80px_rgba(17,17,17,0.05)] backdrop-blur-sm",
        )}
      >
        <div className="grid min-h-[min(720px,100vh-5rem)] grid-rows-[auto_1fr_auto]">
          <header className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-5 sm:px-8 lg:px-10">
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-[color:var(--muted)]">
              {content.label}
            </p>
            <PenSquare
              aria-hidden="true"
              className="h-4 w-4 text-[color:var(--muted)]"
              strokeWidth={1.5}
            />
          </header>

          <div className="grid gap-10 px-6 py-14 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center lg:px-10 lg:py-20">
            <div className="max-w-4xl space-y-8">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  {content.brand}
                </p>
                <h1 className="max-w-3xl font-[family-name:var(--font-editorial)] text-5xl leading-none tracking-[-0.04em] text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
                  {content.headline}
                </h1>
              </div>

              <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                {content.description}
              </p>
            </div>

            <div className="overflow-hidden border border-[color:var(--border)] bg-[#f1ede6] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
              <video
                className="h-full min-h-[360px] w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              >
                <source src="/Plate-.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <footer className="border-t border-[color:var(--border)] px-6 py-5 sm:px-8 lg:px-10">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
              {content.footer}
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
