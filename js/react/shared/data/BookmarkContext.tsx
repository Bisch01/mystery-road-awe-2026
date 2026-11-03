// Lesezeichen über React Context (Exercise 5, Demo 8).
//
// Ersetzt die Weitergabe per Props. Der Zustand selbst bleibt unverändert –
// es ist derselbe useBookmarkState()-Hook aus Demo 5, nur der Transportweg zu
// den Verbrauchern ist ein anderer.
//
// Context ist KEINE Zustandsverwaltung. Er ist ein Transportweg: ein Wert
// steht allen Nachfahren eines Providers zur Verfügung, ohne durch jede Ebene
// als Prop gereicht zu werden. Woher der Wert kommt, wie er sich ändert und
// wer ihn besitzt, bleibt genau wie vorher.
//
// Zum Vergleich liegen die NOTIZEN weiter im Outlet-Context von AppShell und
// werden per Props weitergegeben. Beide Wege stehen damit nebeneinander im
// selben Projekt – siehe Fragen 2 und 3.

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useBookmarkState } from "./useBookmarkState.js";
import type { BookmarkState } from "./useBookmarkState.js";

// Startwert null, nicht ein leerer Zustand: so lässt sich unterscheiden
// zwischen "kein Provider vorhanden" und "Provider mit leeren Lesezeichen".
// Context kennt keine Pflicht-Provider, das muss man selbst erzwingen.
const BookmarkContext = createContext<BookmarkState | null>(null);

interface BookmarkProviderProps {
  children: ReactNode;
}

export function BookmarkProvider({ children }: BookmarkProviderProps) {
  // Genau EIN Aufruf des Hooks, wie vorher in AppShell. Der Provider ist der
  // neue Eigentümer, der Zustand selbst ist unverändert.
  const value = useBookmarkState();

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks(): BookmarkState {
  const value = useContext(BookmarkContext);

  // Ohne diese Prüfung wäre ein vergessener Provider ein Laufzeitfehler weit
  // entfernt von der Ursache ("cannot read property of null"). So scheitert
  // es sofort und mit lesbarer Meldung.
  if (value === null) {
    throw new Error("useBookmarks() muss innerhalb von <BookmarkProvider> benutzt werden");
  }

  return value;
}
