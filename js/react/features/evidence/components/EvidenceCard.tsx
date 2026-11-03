// Eine Beweiskarte (Exercise 5, Demo 1, 6 und 8).
//
// Ersetzt renderEvidenceCardHTML() aus js/views/evidence.ts: dort wurden
// 20 Zeilen String zusammengesetzt, inklusive der aria-label-Beschriftung
// mitten in der Konkatenation.
//
// Demo 8: die beiden Lesezeichen-Props sind weg. Die Karte weiß nichts mehr
// über Lesezeichen – BookmarkButton holt sich alles selbst aus dem Context.
// Übrig bleibt onSelect, weil das Aufklappen Zustand DIESER Ansicht ist und
// nicht featureübergreifend.

import { Card } from "../../../shared/components/Card.js";
import { Badge, toneForRelevance, toneForStatus } from "../../../shared/components/Badge.js";
import { BookmarkButton } from "./BookmarkButton.js";
import { formatDate } from "../../../../utils.js";
import type { Evidence } from "../../../../types.js";

interface EvidenceCardProps {
  evidence: Evidence;
  onSelect: () => void;
}

export function EvidenceCard({ evidence, onSelect }: EvidenceCardProps) {
  return (
    <Card className="evidence-card">
      <BookmarkButton evidenceId={evidence.id} evidenceTitle={evidence.title} />

      {/* Demo 6: der Titel öffnet die Detailansicht. Kein Container-Listener
          und kein data-id wie in der Vanilla-Variante – der Handler kennt
          sein Beweisstück, weil er im .map()-Durchlauf entstanden ist. */}
      <h3>
        <button type="button" className="link-button" onClick={onSelect}>
          {evidence.title}
        </button>
      </h3>

      <div className="evidence-meta">
        {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
      </div>

      <div className="evidence-summary">{evidence.summary}</div>

      {/* Nur wenn der Tag vorhanden ist – kein zweiter Zweig nötig. */}
      {evidence.tags.includes("critical") && <Badge label="Critical" tone="critical" />}
      <Badge label={evidence.status} tone={toneForStatus(evidence.status)} />
      <Badge label={evidence.relevance} tone={toneForRelevance(evidence.relevance)} />

      <div>
        {evidence.tags.map((tag) => (
          <span className="tag-chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}
