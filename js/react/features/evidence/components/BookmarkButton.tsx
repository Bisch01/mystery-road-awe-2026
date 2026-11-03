// Stern-Knopf einer Beweiskarte (Exercise 5, Demo 1, 6 und 8).
//
// Demo 8: holt sich Zustand und Umschaltfunktion selbst aus dem Context.
// Vorher bekam er isBookmarked und onToggle als Props, die EvidenceList und
// EvidenceCard nur durchgereicht haben. Diese zwei Durchreicher-Ebenen sind
// damit weg – das ist der konkrete Gewinn von Context in diesem Projekt.
//
// Er braucht jetzt nur noch, was ihn wirklich unterscheidet: um welches
// Beweisstück es geht.
//
// Vanilla-Gegenstück: ein <button data-action="bookmark"> im HTML-String,
// dessen Klick über Event Delegation am Container eingefangen wurde.

import { useBookmarks } from "../../../shared/data/BookmarkContext.js";
import type { EvidenceId } from "../../../../types.js";

interface BookmarkButtonProps {
  evidenceId: EvidenceId;
  /** Titel des Beweisstücks, nur für das aria-label. */
  evidenceTitle: string;
}

export function BookmarkButton({ evidenceId, evidenceTitle }: BookmarkButtonProps) {
  const { bookmarkIds, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarkIds.includes(evidenceId);

  return (
    <button
      type="button"
      className={isBookmarked ? "bookmark-btn active" : "bookmark-btn"}
      aria-label={`Toggle bookmark for ${evidenceTitle}`}
      aria-pressed={isBookmarked}
      onClick={() => {
        toggleBookmark(evidenceId);
      }}
    >
      <span className="bookmark-icon">{isBookmarked ? "\u2605" : "\u2606"}</span>
    </button>
  );
}
