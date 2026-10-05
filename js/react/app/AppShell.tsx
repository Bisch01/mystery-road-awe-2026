// Anwendungsrahmen der React-Variante: Kopfbereich, Navigation, Fußbereich
// und die Stelle, an der die aktive View gerendert wird.

import type { JSX } from "react";

import { AppHeader } from "./components/AppHeader.js";
import { AppFooter } from "./components/AppFooter.js";
import { useHashRoute } from "./useHashRoute.js";
import type { RouteId } from "./routes.js";

import { DashboardPage } from "../features/dashboard/DashboardPage.js";
import { EvidencePage } from "../features/evidence/EvidencePage.js";
import { PeoplePage } from "../features/people/PeoplePage.js";
import { TimelinePage } from "../features/timeline/TimelinePage.js";
import { WorkspacePage } from "../features/workspace/WorkspacePage.js";

// Routen-Tabelle statt if/else-Kette: eine Route, eine Komponente.
const PAGES: Record<RouteId, () => JSX.Element> = {
  dashboard: DashboardPage,
  evidence: EvidencePage,
  people: PeoplePage,
  timeline: TimelinePage,
  workspace: WorkspacePage,
};

export function AppShell() {
  const currentRoute = useHashRoute();
  const ActivePage = PAGES[currentRoute];

  return (
    <>
      <AppHeader currentRoute={currentRoute} />
      <main className="app-main">
        <ActivePage />
      </main>
      <AppFooter />
    </>
  );
}
