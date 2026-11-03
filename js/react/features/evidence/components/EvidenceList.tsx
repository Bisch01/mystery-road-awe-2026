// Liste der Beweiskarten (Exercise 5, Demo 1, 6 und 8).
//
// Kein Container-Listener, keine Event Delegation: jede Karte bringt ihren
// eigenen onClick mit. Siehe Frage 2 zu Demo 1.
//
// Demo 8: bookmarkIds und onToggleBookmark sind weg. Diese Komponente hat die
// beiden nur durchgereicht, ohne sie selbst zu benutzen – genau der Fall, für
// den Context gemacht ist.

import { EvidenceCard } from "./EvidenceCard.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface EvidenceListProps {
  items: Evidence[];
  onSelect: (evidenceId: EvidenceId) => void;
}

export function EvidenceList({ items, onSelect }: EvidenceListProps) {
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((item) => (
        <EvidenceCard
          key={item.id}
          evidence={item}
          onSelect={() => {
            onSelect(item.id);
          }}
        />
      ))}
    </div>
  );
}
