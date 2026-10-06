import { Phone } from "lucide-react";

const TAP = "transition-transform duration-150 ease-out active:scale-[0.96]";

export function CallBar() {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 pt-3 backdrop-blur-md sm:px-4">
      <div className="mx-auto flex max-w-5xl gap-2">
        <a
          href="tel:108"
          aria-label="Call 108 ambulance"
          className={`call-pulse flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-signal px-3 text-white ${TAP}`}
        >
          <Phone className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-left leading-tight">
            <span className="block text-sm font-semibold sm:text-base">Call 108</span>
            <span className="font-tamil block text-xs font-medium">108 ஆம்புலன்ஸ்</span>
          </span>
        </a>
        <a
          href="tel:112"
          aria-label="Call 112 emergency help"
          className={`flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 text-ink ${TAP}`}
        >
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          <span className="text-left leading-tight">
            <span className="block text-sm font-semibold sm:text-base">Call 112</span>
            <span className="font-tamil block text-xs font-medium">112 அவசர உதவி</span>
          </span>
        </a>
      </div>
    </div>
  );
}
