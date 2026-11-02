// Stern-Knopf einer Beweiskarte (Exercise 5, Demo 1).
//
// Darstellende Komponente: sie kennt den Zustand nicht und ändert ihn nicht.
// Sie bekommt beides über Props – den Wert und die Funktion, die ihn ändert.
// Vanilla-Gegenstück: ein <button data-action="bookmark"> im HTML-String,
// dessen Klick über Event Delegation am Container eingefangen wurde.

interface BookmarkButtonProps {
  isBookmarked: boolean;
  /** Titel des Beweisstücks, nur für das aria-label. */
  evidenceTitle: string;
  onToggle: () => void;
}

export function BookmarkButton({ isBookmarked, evidenceTitle, onToggle }: BookmarkButtonProps) {
  return (
    <button
      type="button"
      className={isBookmarked ? "bookmark-btn active" : "bookmark-btn"}
      aria-label={`Toggle bookmark for ${evidenceTitle}`}
      aria-pressed={isBookmarked}
      onClick={onToggle}
    >
      <span className="bookmark-icon">{isBookmarked ? "\u2605" : "\u2606"}</span>
    </button>
  );
}
