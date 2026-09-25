import { createFileRoute } from "@tanstack/react-router";
import { StrokeApp } from "@/components/stroke/stroke-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StrokeApp />;
}
