import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const COUNTED = "stroke-visit-counted";
// The private stats page must not count its owner as a visitor.
const NOT_COUNTED_PATHS = new Set(["/", "/stats"]);

let total: Promise<number | null> | null = null;

function counted() {
  try {
    return sessionStorage.getItem(COUNTED) === "1";
  } catch {
    return false;
  }
}

function markCounted() {
  try {
    sessionStorage.setItem(COUNTED, "1");
  } catch {
    // Private mode: worst case a reload counts as another visit.
  }
}

/**
 * Counts a visit — once per browser session — when someone goes beyond the
 * home page: another page, or starting the check or hospital finder from the
 * home screen. Landing on the home page alone is not a visit. Automated
 * browsers are not counted.
 */
export function countVisitOnce() {
  if (typeof window === "undefined" || counted() || navigator.webdriver) return;
  markCounted();
  void fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => undefined);
}

async function loadTotal(): Promise<number | null> {
  try {
    const response = await fetch("/api/visit", { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = (await response.json()) as { total?: number | null };
    return typeof data.total === "number" ? data.total : null;
  } catch {
    return null;
  }
}

/** The public visit total, for the footer. Reading it never counts a visit. */
export function useVisitCount() {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    total ??= loadTotal();
    void total.then((next) => {
      if (live) setValue(next);
    });
    return () => {
      live = false;
    };
  }, []);
  return value;
}

/** Mounted once in the root layout: counts a visit on any page except home and stats. */
export function VisitPing() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    if (!NOT_COUNTED_PATHS.has(pathname)) countVisitOnce();
  }, [pathname]);
  return null;
}

/**
 * Records a Call or Directions tap. A beacon is used because the tap
 * immediately hands off to the phone dialler or Maps, which can end the page
 * before an ordinary request finishes.
 */
export function trackClick(input: {
  kind: "call" | "directions";
  hospital: string;
  window?: string;
  to108?: boolean;
}) {
  const body = JSON.stringify({ window: "unset", to108: false, ...input });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/click", blob)) return;
  } catch {
    // Fall through to fetch.
  }
  void fetch("/api/click", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
