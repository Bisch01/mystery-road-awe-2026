// Investigator Workspace (Exercise 5, Demo 1 bis 6).
//
// Feature-Komponente: holt die Daten und verteilt sie an die drei Bereiche.
//
// Demo 5 und 6: Lesezeichen und Notizen kommen aus dem Outlet-Context von
// AppShell. Vorher las diese Seite beides selbst aus dem Local Storage. Die
// Notizen mussten in Demo 6 mitwandern, weil die Detailansicht in Evidence
// sie jetzt schreibt – zwei Features, ein Zustand, ein Eigentümer.

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { BookmarksPanel } from "./components/BookmarksPanel.js";
import { NotesPanel } from "./components/NotesPanel.js";
import { HypothesisForm } from "./components/HypothesisForm.js";

export function WorkspacePage() {
  const { status, evidence, people } = useCaseData();

  // Demo 5 und 6: Lesezeichen UND Notizen kommen aus dem Outlet-Context von
  // AppShell. Keine eigenen Kopien mehr – die Notizen mussten mitwandern,
  // weil die Detailansicht in Evidence sie jetzt schreibt.
  const { bookmarkIds, toggleBookmark, notes } = useAppOutlet();

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
        <BookmarksPanel
          evidence={evidence}
          bookmarkIds={bookmarkIds}
          onToggleBookmark={toggleBookmark}
        />
        <NotesPanel evidence={evidence} notes={notes} />
      </div>

      <HypothesisForm people={people} evidence={evidence} />
    </section>
  );
}
