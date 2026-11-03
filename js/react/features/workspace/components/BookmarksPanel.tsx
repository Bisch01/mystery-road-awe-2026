// Liste der mit Lesezeichen markierten Beweisstücke (Exercise 5, Demo 1 und 6).
//
// Ersetzt renderBookmarksList() aus js/views/workspace.ts.
//
// Vanilla filterte über ev.bookmarked – ein Feld, das beim Laden auf jedes
// Beweisstück geschrieben wurde (applyStoredBookmarkFlags). Hier wird nichts
// in die Daten geschrieben: die Liste entsteht aus den Ids.
//
// Demo 6: der Entfernen-Knopf ruft denselben Callback wie der Stern in der
// Beweisliste. Das Panel kennt den Zustand nicht und ändert ihn nicht selbst.

import { MiniListItem } from "../../dashboard/components/MiniListItem.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface BookmarksPanelProps {
  evidence: Evidence[];
  bookmarkIds: EvidenceId[];
  onToggleBookmark: (evidenceId: EvidenceId) => void;
}

export function BookmarksPanel({ evidence, bookmarkIds, onToggleBookmark }: BookmarksPanelProps) {
  // Abgeleiteter Wert, kein Zustand.
  const bookmarked = evidence.filter((item) => bookmarkIds.includes(item.id));

  return (
    <div className="workspace-col">
      <h3>Bookmarked Evidence</h3>
      <div className="bookmarks-list">
        {bookmarked.length === 0 ? (
          <p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>
        ) : (
          bookmarked.map((item) => (
            <MiniListItem key={item.id} title={item.id}>
              {" "}
              &mdash; {item.title}{" "}
              {/* Demo 6: dritte Stelle, die dasselbe Umschalten auslöst –
                  in einem anderen Feature als die Beweisliste. */}
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => {
                  onToggleBookmark(item.id);
                }}
              >
                Remove
              </button>
            </MiniListItem>
          ))
        )}
      </div>
    </div>
  );
}
