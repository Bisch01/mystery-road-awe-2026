// Lesezeichen-Zustand (Exercise 5, Demo 5).
//
// Hier liegt die gesamte Logik rund um die Lesezeichen: der Zustand, das
// unveränderliche Update und das Schreiben in den Local Storage.
//
// WICHTIG: Ein eigener Hook teilt für sich genommen KEINEN Zustand. Jeder
// Aufruf erzeugt eine eigene useState-Instanz. Der Hook ist nur die
// Zusammenfassung der Logik – geteilt wird der Zustand ausschließlich
// dadurch, dass er genau EINMAL aufgerufen wird, nämlich in AppShell.
// Würde ihn jede Seite selbst aufrufen, hätte jede wieder ihre eigene Kopie
// und wir wären beim Zustand von Demo 4 zurück.

import { useState } from "react";

import { readBookmarks, writeBookmarks } from "./bookmarksStorage.js";
import type { EvidenceId } from "../../../types.js";

export interface BookmarkState {
  bookmarkIds: EvidenceId[];
  /** Referenz vor dem letzten Umschalten – nur für die Sonde aus Demo 3. */
  previousBookmarkIds: EvidenceId[];
  toggleBookmark: (evidenceId: EvidenceId) => void;
  /** Absichtlich mutierende Variante – nur zum Vorführen (Demo 3). */
  mutatingToggleBookmark: (evidenceId: EvidenceId) => void;
}

export function useBookmarkState(): BookmarkState {
  // Local Storage ist synchron, deshalb taugt readBookmarks() als Startwert.
  // Die Lazy-Form ruft die Funktion nur beim ersten Rendern auf.
  const [bookmarkIds, setBookmarkIds] = useState<EvidenceId[]>(() => readBookmarks());
  const [previousBookmarkIds, setPreviousBookmarkIds] = useState<EvidenceId[]>([]);

  function toggleBookmark(evidenceId: EvidenceId): void {
    // UNVERÄNDERLICHES UPDATE (Demo 3): filter() und [...spread] erzeugen ein
    // NEUES Array, bookmarkIds selbst bleibt unangetastet.
    //
    // Vanilla-Gegenstück in js/views/evidence.ts, handleBookmarkClick():
    //   bookmarks.push(evidenceId);   // mutiert das Array an Ort und Stelle
    //   ev.bookmarked = true;         // mutiert zusätzlich das Datenobjekt
    const next = bookmarkIds.includes(evidenceId)
      ? bookmarkIds.filter((id) => id !== evidenceId)
      : [...bookmarkIds, evidenceId];

    // Zusicherung aus Demo 3, Task 2. Im Produktionsbuild entfernt Vite sie.
    if (import.meta.env.DEV && Object.is(next, bookmarkIds)) {
      throw new Error("Bookmark-Update hat dasselbe Array zurückgegeben - Mutation!");
    }

    setPreviousBookmarkIds(bookmarkIds);
    setBookmarkIds(next);
    writeBookmarks(next);
  }

  // NUR ZUM VORFÜHREN (Demo 3): dieselbe Aufgabe, mutierend gelöst.
  function mutatingToggleBookmark(evidenceId: EvidenceId): void {
    if (bookmarkIds.includes(evidenceId)) {
      bookmarkIds.splice(bookmarkIds.indexOf(evidenceId), 1);
    } else {
      bookmarkIds.push(evidenceId);
    }

    setPreviousBookmarkIds(bookmarkIds);
    setBookmarkIds(bookmarkIds); // dieselbe Referenz wie vorher
    writeBookmarks(bookmarkIds);
  }

  return { bookmarkIds, previousBookmarkIds, toggleBookmark, mutatingToggleBookmark };
}
