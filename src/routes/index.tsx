import { createFileRoute } from "@tanstack/react-router";
import { StrokeApp } from "@/components/stroke/stroke-app";
import { seoHead, SITE_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const metadata = seoHead({
      title: "Stroke Symptoms & Hospitals in Chennai | Stroke Chennai",
      description:
        "Start a quick stroke-warning-sign check or find Chennai hospital branches. Listings do not confirm current acceptance.",
      path: "/",
      schema: SITE_SCHEMA,
    });
    return {
      ...metadata,
      meta: [
        ...metadata.meta,
        {
          name: "google-site-verification",
          content: "UDbzBBL9ieVG7g_qbGEmgRgDf7ftEPVuMkP1gevv9Hs",
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  return <StrokeApp />;
}
