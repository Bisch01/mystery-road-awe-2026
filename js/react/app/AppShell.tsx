// Anwendungsrahmen der React-Variante: Kopfbereich, Navigation, Fußbereich.
//
// Demo 8 (Exercise 4): AppShell ist Layout-Route und rendert an der Stelle der
// View ein <Outlet />; welche Kindroute dort landet, entscheidet der Router.
//
// Demo 5 und 6 (Exercise 5): AppShell wurde Eigentümer von Lesezeichen UND
// Notizen, weil sie der niedrigste gemeinsame Vorfahre der Seiten ist, die
// beides brauchen.
//
// Demo 8 (Exercise 5): Die LESEZEICHEN sind nach React Context umgezogen
// (shared/data/BookmarkContext.tsx) und werden nicht mehr hier weitergegeben.
// Die NOTIZEN bleiben absichtlich hier und werden weiter per Props gereicht –
// so stehen beide Wege nebeneinander und sind direkt vergleichbar.
//
// Demo 2 (Exercise 6): Hier hängt der eine berechtigte Effect der Anwendung,
// weil AppShell als Einzige über alle Ansichten hinweg montiert bleibt.
//
// Demo 6 (Exercise 6): Hier liegt auch die Schranke für Lade- und
// Fehlerzustand der geteilten Falldaten.

import { Outlet, useLocation, useOutletContext } from "react-router";

import { AppHeader } from "./components/AppHeader.js";
import { AppFooter } from "./components/AppFooter.js";
import { useDocumentTitle } from "./useDocumentTitle.js";
import { titleForPath } from "./routes.js";
import { useCaseDataState } from "../shared/data/useCaseData.js";
import { ErrorState, LoadingState } from "../shared/components/AsyncState.js";
import { useNotesState } from "../shared/data/useNotesState.js";
import type { NotesState } from "../shared/data/useNotesState.js";

/** Was AppShell an ihre Kindrouten weitergibt. */
export type AppOutletContext = NotesState;

/** Typisierter Zugriff für Evidence- und Workspace-Seite. */
export function useAppOutlet(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}

export function AppShell() {
  // Genau EIN Aufruf im ganzen Baum.
  const notesState = useNotesState();

  // Exercise 6, Demo 2: der eine berechtigte Effect dieser Anwendung.
  // titleForPath() ist eine reine Berechnung und läuft im Render; die
  // Zuweisung an document.title ist der Seiteneffekt und liegt im Effect.
  const { pathname } = useLocation();
  useDocumentTitle(titleForPath(pathname));

  // Exercise 6, Demo 6: die Schranke für die geteilten Falldaten.
  //
  // Alle fünf Ansichten lesen dieselben Daten aus demselben Provider, also
  // gehören Ladeanzeige und Fehlermeldung genau einmal hierher und nicht
  // fünfmal in die Seiten. Kopf- und Fußbereich bleiben währenddessen
  // stehen, die Navigation ist also auch im Fehlerfall bedienbar.
  //
  // Unterhalb dieser Schranke gilt: die Daten SIND da. Deshalb darf
  // useCaseData() in den Seiten werfen statt null zurückzugeben.
  const caseData = useCaseDataState();

  return (
    <>
      <AppHeader />
      <main className="app-main">
        {caseData.status === "loading" && <LoadingState label="Fallakte wird geladen …" />}

        {caseData.status === "error" && (
          <ErrorState
            title="Die Fallakte konnte nicht geladen werden."
            message={caseData.message}
            onRetry={caseData.reload}
          />
        )}

        {caseData.status === "ready" && <Outlet context={notesState} />}
      </main>
      <AppFooter />
    </>
  );
}
