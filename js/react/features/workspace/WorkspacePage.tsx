// Investigator Workspace (Exercise 5, Demo 1 bis 8).
//
// Feature-Komponente: holt die Daten und verteilt sie an die drei Bereiche.
//
// Demo 5 und 6: Lesezeichen und Notizen wanderten nach AppShell, weil zwei
// Features sie brauchen.
//
// Demo 8: die Lesezeichen kommen jetzt aus dem Bookmark-Context, die Notizen
// weiter aus dem Outlet-Context von AppShell. Beide Wege nebeneinander.
//
// Exercise 6, Demo 6: Lade- und Fehlerzustand liegen jetzt in AppShell.

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { BookmarksPanel } from "./components/BookmarksPanel.js";
import { NotesPanel } from "./components/NotesPanel.js";
import { HypothesisForm } from "./components/HypothesisForm.js";

export function WorkspacePage() {
  const { evidence, people } = useCaseData();

  // Demo 8: Diese Seite braucht die Lesezeichen gar nicht mehr. BookmarksPanel
  // holt sie sich selbst aus dem Context – zwei Props weniger, und die
  // Zwischenebene weiß nichts mehr davon.
  const { notes } = useAppOutlet();

  return (
    <section>
      <h2>Investigator Workspace</h2>

      <div className="workspace-grid">
        <BookmarksPanel evidence={evidence} />
        <NotesPanel evidence={evidence} notes={notes} />
      </div>

      <HypothesisForm people={people} evidence={evidence} />
    </section>
  );
}
