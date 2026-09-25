import { Phone } from "lucide-react";

const TAP = "transition-transform duration-150 ease-out active:scale-[0.96]";

export function CallBar() {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur-md">
      <a
        href="tel:108"
        className={`call-pulse mx-auto flex h-14 max-w-5xl items-center justify-center gap-3 rounded-full bg-signal text-ink ${TAP}`}
      >
        <Phone className="size-5" aria-hidden="true" />
        <span className="text-left leading-tight">
          <span className="block text-base font-semibold">Call 108</span>
          <span className="block text-xs font-medium">108-ஐ அழைக்கவும்</span>
        </span>
      </a>
    </div>
  );
}
