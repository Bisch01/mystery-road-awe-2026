// Routen-Definition der React-Variante (Exercise 4, Demo 8).
//
// Die Pfade stehen hier zentral, damit Router, Navigation und Weiterleitungen
// dieselbe Quelle benutzen.

export const ROUTE_PATHS = {
  dashboard: "/dashboard",
  evidence: "/evidence",
  team: "/team",
  people: "/team/people",
  personDetail: "/team/people/:personId",
  locations: "/team/locations",
  timeline: "/timeline",
  workspace: "/workspace",
} as const;

export const DEFAULT_PATH = ROUTE_PATHS.dashboard;

export interface NavItem {
  path: string;
  label: string;
}

// Hauptnavigation im Kopfbereich.
export const MAIN_NAV: NavItem[] = [
  { path: ROUTE_PATHS.dashboard, label: "Dashboard" },
  { path: ROUTE_PATHS.evidence, label: "Evidence" },
  { path: ROUTE_PATHS.team, label: "People & Locations" },
  { path: ROUTE_PATHS.timeline, label: "Timeline" },
  { path: ROUTE_PATHS.workspace, label: "Workspace" },
];

// Zweite Navigationsebene innerhalb von /team.
export const TEAM_TABS: NavItem[] = [
  { path: ROUTE_PATHS.people, label: "People" },
  { path: ROUTE_PATHS.locations, label: "Locations" },
];

/** Baut die konkrete Adresse einer Personenseite, z. B. "/team/people/nova-byte". */
export function personPath(personId: string): string {
  return `${ROUTE_PATHS.people}/${personId}`;
}
