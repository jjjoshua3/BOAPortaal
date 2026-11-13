import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/community")({
  beforeLoad: () => {
    throw redirect({ to: "/dienst", search: { werk: "overleg" } });
  },
});
