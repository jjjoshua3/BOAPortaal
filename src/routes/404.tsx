import { createFileRoute } from "@tanstack/react-router";
import { NotFoundView } from "@/components/not-found";

export const Route = createFileRoute("/404")({
  component: NotFoundView,
});
