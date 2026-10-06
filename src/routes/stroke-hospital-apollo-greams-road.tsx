import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead } from "@/lib/seo";
import {
  PILOT_BRANCH,
  PILOT_BRANCH_PATH,
  PILOT_BRANCH_TITLE,
  pilotBranchPageSchema,
} from "@/lib/stroke-schema";

const PAGE_DESCRIPTION =
  "Branch-level directory information for Apollo Hospitals, Greams Road. Listed information does not confirm real-time services, capacity, or acceptance.";

export const Route = createFileRoute("/stroke-hospital-apollo-greams-road")({
  head: () =>
    seoHead({
      title: PILOT_BRANCH_TITLE,
      description: PAGE_DESCRIPTION,
      path: PILOT_BRANCH_PATH,
      schema: pilotBranchPageSchema(),
    }),
  component: ApolloGreamsRoadPage,
});

function ApolloGreamsRoadPage() {
  return (
    <PublicPage
      title={PILOT_BRANCH.name}
      intro="This is a branch-level directory entry for a Chennai hospital location. It is a navigation aid, not a hospital-operated page or a live service-status feed."
    >
      <section>
        <h2 className="font-display text-2xl">Branch address</h2>
        <address className="mt-2 not-italic leading-relaxed text-ink-soft">{PILOT_BRANCH.address}</address>
        <p className="mt-2 leading-relaxed text-ink-soft">Area: {PILOT_BRANCH.area}</p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          A listed capability does not confirm current service, capacity, bed availability, or acceptance. Follow emergency-response guidance; do not delay seeking care.
        </p>
        <p className="mt-4">
          <a
            className="font-semibold text-[#1b4fad] underline"
            href={`https://www.google.com/maps/dir/?api=1&destination=${PILOT_BRANCH.lat},${PILOT_BRANCH.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            Directions to this branch
          </a>
        </p>
      </section>
      <p className="border-t border-line pt-4 text-sm">
        <Link to="/stroke-hospitals-chennai" className="font-semibold text-[#1b4fad] underline">
          Return to the Chennai hospital finder
        </Link>
      </p>
    </PublicPage>
  );
}
