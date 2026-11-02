// Liste der Notizen (Exercise 5, Demo 1).
//
// Ersetzt renderNotesList() aus js/views/workspace.ts. Zwei Unterschiede:
//
// 1. Vanilla schrieb den Notiztext per innerHTML in ein <div> – ein Text aus
//    dem Local Storage landete also ungeprüft als Markup auf der Seite.
//    Hier ist der Text ein JSX-Kind und wird escaped.
// 2. Vanilla gab jedem Eintrag die id "noteText-<index>", also den
//    Array-Index als Bezeichner. Ein Beleg dafür, wie oft Position mit
//    Identität verwechselt wird; der Schlüssel ist hier die Evidence-Id.

import { MiniListItem } from "../../dashboard/components/MiniListItem.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface NotesPanelProps {
  evidence: Evidence[];
  notes: Record<EvidenceId, string>;
}

export function NotesPanel({ evidence, notes }: NotesPanelProps) {
  // Abgeleiteter Wert: nur Beweisstücke, zu denen eine Notiz existiert.
  const entries = evidence
    .map((item) => ({ item, text: notes[item.id] ?? "" }))
    .filter((entry) => entry.text !== "");

  return (
    <div className="workspace-col">
      <h3>Personal Notes</h3>
      <p className="hint-text">
        Notes are attached to whichever evidence item is currently open in the Evidence view.
      </p>
      <div className="notes-list">
        {entries.length === 0 ? (
          <p>No notes yet. Add one from an evidence item&rsquo;s detail view.</p>
        ) : (
          entries.map((entry) => (
            <MiniListItem key={entry.item.id} title={entry.item.id}>
              {" "}
              &mdash; {entry.item.title}
              <div>{entry.text}</div>
            </MiniListItem>
          ))
        )}
      </div>
    </div>
  );
}
