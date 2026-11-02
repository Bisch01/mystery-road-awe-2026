// Investigator Workspace (Exercise 5, Demo 1).
//
// Feature-Komponente: holt die Daten und verteilt sie an die drei Bereiche.
//
// BEWUSSTE ZWISCHENSTUFE: Lesezeichen und Notizen werden hier direkt aus dem
// Local Storage gelesen. Für die Lesezeichen heißt das: dieselbe Tatsache
// liegt in EvidencePage und hier getrennt vor. Toggelt man in der Beweisliste
// ein Lesezeichen, sieht der Workspace die Änderung erst nach einem
// Seitenwechsel. Genau das ist "duplicated state" – Demo 5 hebt den Zustand
// zum gemeinsamen Vorfahren hoch und beseitigt die Doppelung.

import { useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { readBookmarks } from "../../shared/data/bookmarksStorage.js";
import { readNotes } from "../../shared/data/notesStorage.js";
import { BookmarksPanel } from "./components/BookmarksPanel.js";
import { NotesPanel } from "./components/NotesPanel.js";
import { HypothesisForm } from "./components/HypothesisForm.js";

export function WorkspacePage() {
  const { status, evidence, people } = useCaseData();

  const [bookmarkIds] = useState(() => readBookmarks());
  const [notes] = useState(() => readNotes());

  if (status === "loading") {
    return <p className="stub-note">Loading case file&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  return (
    <section>
      <h2>Investigator Workspace</h2>

      <div className="workspace-grid">
        <BookmarksPanel evidence={evidence} bookmarkIds={bookmarkIds} />
        <NotesPanel evidence={evidence} notes={notes} />
      </div>

      <HypothesisForm people={people} evidence={evidence} />
    </section>
  );
}
