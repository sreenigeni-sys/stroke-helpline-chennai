import { Link } from "@tanstack/react-router";

export function PublisherContactCue({ showContactLink = true }: { showContactLink?: boolean } = {}) {
  return (
    <section aria-label="About this service" className="mt-8 border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
      <p>
        <strong className="text-ink">About this service.</strong> Stroke Helpline Chennai is an initiative of Arunai Neuro Foundation. It provides general stroke-warning and hospital-navigation information for Chennai.
      </p>
      <p className="mt-2">
        Clinical review applies only to the scope stated on each page. Hospital service and stroke-readiness claims are based on hospital-published or other public sources, are not independently verified by the clinical review, and are not a live confirmation of staffing, capacity, beds, or acceptance.
      </p>
      {showContactLink ? (
        <p className="mt-2">
          <Link to="/contact" className="font-semibold text-[#1b4fad] underline">
            Contact us about a correction or hospital listing
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}
