import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function PublicPage({
  title,
  tamilTitle,
  intro,
  children,
}: {
  title: string;
  tamilTitle?: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper px-4 pb-10 pt-4 text-ink">
      <header className="mx-auto flex max-w-4xl items-center gap-3">
        <Link to="/" aria-label="Stroke Helpline Chennai home" className="flex min-w-0 items-center gap-2">
          <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[7.5rem] object-contain" />
          <span className="truncate text-sm font-semibold">Stroke Helpline Chennai</span>
        </Link>
      </header>

      <article className="mx-auto mt-8 max-w-3xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
        {tamilTitle ? <p lang="ta" className="font-tamil mt-2 text-xl leading-snug text-[#1b4fad]">{tamilTitle}</p> : null}
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{intro}</p>

        <nav aria-label="Immediate action" className="mt-5">
          <Link
            to="/"
            className={cn("flex min-h-14 items-center justify-center rounded-full bg-[#1b4fad] px-4 text-center text-sm font-bold text-white")}
          >
            Find stroke-care hospitals
          </Link>
        </nav>

        <div className="mt-8 space-y-6">{children}</div>

        <p className="mt-8 border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
          Stroke Helpline Chennai is a navigation aid, not a diagnosis or treatment recommendation. Hospital capability information is not a live acceptance or bed-availability check. Follow emergency-response guidance.
        </p>
      </article>
    </main>
  );
}
