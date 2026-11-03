// Investigator Workspace (Exercise 5, Demo 1 bis 5).
//
// Feature-Komponente: holt die Daten und verteilt sie an die drei Bereiche.
//
// Demo 5: die Lesezeichen kommen aus dem Outlet-Context von AppShell. Vorher
// las diese Seite sie selbst aus dem Local Storage – eine von drei Kopien
// derselben Tatsache. Jetzt gibt es nur noch eine Quelle.

import { useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { readNotes } from "../../shared/data/notesStorage.js";
import { BookmarksPanel } from "./components/BookmarksPanel.js";
import { NotesPanel } from "./components/NotesPanel.js";
import { HypothesisForm } from "./components/HypothesisForm.js";

export function WorkspacePage() {
  const { status, evidence, people } = useCaseData();

  // Demo 5: Lesezeichen aus dem Outlet-Context von AppShell, keine eigene
  // Kopie mehr. Die Notizen bleiben lokal – sie werden nur hier gelesen,
  // es gibt also nichts zu teilen.
  const { bookmarkIds } = useAppOutlet();
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
