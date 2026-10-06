import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
