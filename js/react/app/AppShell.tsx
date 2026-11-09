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

import { Outlet, useLocation, useOutletContext } from "react-router";

import { AppHeader } from "./components/AppHeader.js";
import { AppFooter } from "./components/AppFooter.js";
import { useDocumentTitle } from "./useDocumentTitle.js";
import { titleForPath } from "./routes.js";
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

  return (
    <>
      <AppHeader />
      <main className="app-main">
        <Outlet context={notesState} />
      </main>
      <AppFooter />
    </>
  );
}
