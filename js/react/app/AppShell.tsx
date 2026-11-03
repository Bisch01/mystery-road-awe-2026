// Anwendungsrahmen der React-Variante: Kopfbereich, Navigation, Fußbereich.
//
// Demo 8 (Exercise 4): AppShell ist Layout-Route und rendert an der Stelle der
// View ein <Outlet />; welche Kindroute dort landet, entscheidet der Router.
//
// Demo 5 (Exercise 5): AppShell ist der EIGENTÜMER des Lesezeichen-Zustands.
// Sie ist der niedrigste gemeinsame Vorfahre der drei Stellen, die ihn
// brauchen – DashboardPage, EvidencePage und WorkspacePage sind alle
// Kindrouten von ihr.
//
// Demo 6: dasselbe für die Notizen. Geschrieben werden sie in der
// Detailansicht von Evidence, gelesen in der Notizliste des Workspace – also
// wieder zwei Features, also wieder AppShell.
//
// Weitergegeben wird über den Outlet-Context des Routers, also dieselbe
// Technik, die TeamLayout für /team schon benutzt. React Context ist
// absichtlich noch nicht im Spiel – das ist Demo 8.

import { Outlet, useOutletContext } from "react-router";

import { AppHeader } from "./components/AppHeader.js";
import { AppFooter } from "./components/AppFooter.js";
import { useBookmarkState } from "../shared/data/useBookmarkState.js";
import { useNotesState } from "../shared/data/useNotesState.js";
import type { BookmarkState } from "../shared/data/useBookmarkState.js";
import type { NotesState } from "../shared/data/useNotesState.js";

/** Was AppShell an ihre Kindrouten weitergibt. */
export type AppOutletContext = BookmarkState & NotesState;

/** Typisierter Zugriff für Dashboard-, Evidence- und Workspace-Seite. */
export function useAppOutlet(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}

export function AppShell() {
  // Genau EIN Aufruf pro Hook im ganzen Baum. Das ist die eigentliche Aussage
  // von "lifting state up": nicht der Hook teilt den Zustand, sondern die
  // Tatsache, dass es nur eine Instanz gibt.
  const bookmarkState = useBookmarkState();
  const notesState = useNotesState();

  const context: AppOutletContext = { ...bookmarkState, ...notesState };

  return (
    <>
      <AppHeader />
      <main className="app-main">
        <Outlet context={context} />
      </main>
      <AppFooter />
    </>
  );
}
