// Routen-Definition der React-Variante.
//
// Entspricht bewusst dem validViews-Array aus js/router.ts, damit beide
// Varianten dieselben URLs verstehen und direkt vergleichbar bleiben.

export const ROUTES = ["dashboard", "evidence", "people", "timeline", "workspace"] as const;

export type RouteId = (typeof ROUTES)[number];

export const DEFAULT_ROUTE: RouteId = "dashboard";

export const ROUTE_LABELS: Record<RouteId, string> = {
  dashboard: "Dashboard",
  evidence: "Evidence",
  people: "People & Locations",
  timeline: "Timeline",
  workspace: "Workspace",
};

// Typwächter: macht aus einem beliebigen String eine RouteId, falls er eine ist.
export function isRouteId(value: string): value is RouteId {
  return (ROUTES as readonly string[]).includes(value);
}
