// Liste der mit Lesezeichen markierten Beweisstücke (Exercise 5, Demo 1).
//
// Ersetzt renderBookmarksList() aus js/views/workspace.ts.
//
// Vanilla filterte über ev.bookmarked – ein Feld, das beim Laden auf jedes
// Beweisstück geschrieben wurde (applyStoredBookmarkFlags). Hier wird nichts
// in die Daten geschrieben: die Liste entsteht aus den Ids.
//
// Der "Open"-Knopf der Vanilla-Variante fehlt noch, weil die Detailansicht
// erst in Demo 6 nach React wandert.

import { MiniListItem } from "../../dashboard/components/MiniListItem.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface BookmarksPanelProps {
  evidence: Evidence[];
  bookmarkIds: EvidenceId[];
}

export function BookmarksPanel({ evidence, bookmarkIds }: BookmarksPanelProps) {
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
              &mdash; {item.title}
            </MiniListItem>
          ))
        )}
      </div>
    </div>
  );
}
