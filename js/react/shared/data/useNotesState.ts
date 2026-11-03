// Notiz-Zustand (Exercise 5, Demo 6).
//
// Dieselbe Bauart wie useBookmarkState: der Hook fasst die Logik zusammen und
// wird genau EINMAL aufgerufen, nämlich in AppShell. Dort liegt er, weil zwei
// Features ihn brauchen – die Detailansicht in Evidence schreibt, die
// Notizliste im Workspace liest.

import { useState } from "react";

import { readNotes, writeNotes } from "./notesStorage.js";
import type { NotesMap } from "./notesStorage.js";
import type { EvidenceId } from "../../../types.js";

export interface NotesState {
  notes: NotesMap;
  saveNote: (evidenceId: EvidenceId, text: string) => void;
}

export function useNotesState(): NotesState {
  const [notes, setNotes] = useState<NotesMap>(() => readNotes());

  function saveNote(evidenceId: EvidenceId, text: string): void {
    // Unveränderliches Update eines Objekts (Demo 3): neues Objekt mit
    // überschriebenem Schlüssel, statt notes[evidenceId] = text.
    //
    // Vanilla-Gegenstück in js/storage.ts, saveNoteForEvidence():
    //   notesStore[evidenceId] = text;   // mutiert den gemeinsamen Store
    const next: NotesMap = { ...notes, [evidenceId]: text };

    setNotes(next);
    writeNotes(next);
  }

  return { notes, saveNote };
}
