import { createFileRoute } from "@tanstack/react-router";
import { StrokeApp } from "@/components/stroke/stroke-app";
import { seoHead, SITE_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Find Stroke-Care Hospitals in Chennai | Stroke Chennai",
      description:
        "Find Chennai hospital branches with stroke-care listings, contacts and directions. Call 108 for ambulance help. Current acceptance is not live.",
      path: "/",
      schema: SITE_SCHEMA,
    }),
  component: Home,
});

function Home() {
  return <StrokeApp />;
}
