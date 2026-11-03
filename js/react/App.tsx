// Wurzelkomponente der React-Variante.
//
// Exercise 4, Demo 8: react-router ersetzt den handgeschriebenen Hash-Router
// aus Exercise 3 (js/react/app/useHashRoute.ts, in diesem Commit entfernt).
//
// HashRouter, nicht BrowserRouter: GitHub Pages ist statisches Hosting ohne
// Rewrite-Regeln. Ein Aufruf von /mystery-road-awe-2026/dashboard würde dort
// mit 404 enden, weil keine Datei dieses Namens existiert. Beim HashRouter
// steht der Pfad hinter #, der Server sieht immer nur index.html
// (Skript Kap. 16.5).

import { HashRouter, Navigate, Route, Routes } from "react-router";

import { AppShell } from "./app/AppShell.js";
import { BookmarkProvider } from "./shared/data/BookmarkContext.js";
import { CaseDataProvider } from "./shared/data/useCaseData.js";
import { DEFAULT_PATH } from "./app/routes.js";

import { DashboardPage } from "./features/dashboard/DashboardPage.js";
import { EvidencePage } from "./features/evidence/EvidencePage.js";
import { TeamLayout } from "./features/people-locations/TeamLayout.js";
import { PeoplePage } from "./features/people-locations/PeoplePage.js";
import { PersonDetailPage } from "./features/people-locations/PersonDetailPage.js";
import { LocationsPage } from "./features/people-locations/LocationsPage.js";
import { TimelinePage } from "./features/timeline/TimelinePage.js";
import { WorkspacePage } from "./features/workspace/WorkspacePage.js";

export function App() {
  return (
    // Exercise 5, Demo 8: der Provider liegt AUSSERHALB des Routers. Context
    // ist nicht an die Routenstruktur gebunden - jeder Nachfahre kommt an den
    // Wert, unabhängig davon, ob er Kindroute von AppShell ist.
    <BookmarkProvider>
      {/* Demo 9: ein Ladevorgang für die ganze App statt einer pro Seite. */}
      <CaseDataProvider>
        <HashRouter>
          <Routes>
            {/* Layout-Route ohne eigenen Pfad: AppShell rendert Rahmen + <Outlet />. */}
            <Route element={<AppShell />}>
              <Route index element={<Navigate to={DEFAULT_PATH} replace />} />

              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="evidence" element={<EvidencePage />} />

              {/* Verschachtelte Routen: TeamLayout lädt die Daten und zeichnet die
              Tab-Leiste, die Kindroute entscheidet, welches Gitter erscheint. */}
              <Route path="team" element={<TeamLayout />}>
                <Route index element={<Navigate to="people" replace />} />
                <Route path="people" element={<PeoplePage />} />
                <Route path="people/:personId" element={<PersonDetailPage />} />
                <Route path="locations" element={<LocationsPage />} />
              </Route>

              <Route path="timeline" element={<TimelinePage />} />
              <Route path="workspace" element={<WorkspacePage />} />

              {/* Auffangroute für alles Unbekannte. replace, damit der falsche
              Pfad keinen History-Eintrag hinterlässt. */}
              <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </CaseDataProvider>
    </BookmarkProvider>
  );
}
