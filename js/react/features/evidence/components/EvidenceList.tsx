// Liste der Beweiskarten (Exercise 5, Demo 1 und 6).
//
// Kein Container-Listener, keine Event Delegation: jede Karte bringt ihren
// eigenen onClick mit. Siehe Frage 2 zu Demo 1.
//
// Demo 6: reicht zwei Callbacks durch und bindet in beiden die Id der Karte
// ein, die im .map()-Durchlauf gerade bearbeitet wird.

import { EvidenceCard } from "./EvidenceCard.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface EvidenceListProps {
  items: Evidence[];
  bookmarkIds: EvidenceId[];
  onToggleBookmark: (evidenceId: EvidenceId) => void;
  onSelect: (evidenceId: EvidenceId) => void;
}

export function EvidenceList({
  items,
  bookmarkIds,
  onToggleBookmark,
  onSelect,
}: EvidenceListProps) {
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((item) => (
        <EvidenceCard
          key={item.id}
          evidence={item}
          isBookmarked={bookmarkIds.includes(item.id)}
          onToggleBookmark={() => {
            onToggleBookmark(item.id);
          }}
          onSelect={() => {
            onSelect(item.id);
          }}
        />
      ))}
    </div>
  );
}
