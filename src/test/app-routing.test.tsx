import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / (Dashboard)", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/")).toBe(true);
  });

  it("matches a page for /entities (Entity Management)", () => {
    const matches = router.matchRoutes("/entities");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/entities")).toBe(true);
  });

  it("matches a page for /activity (Activity Logs)", () => {
    const matches = router.matchRoutes("/activity");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/activity")).toBe(true);
  });
});
