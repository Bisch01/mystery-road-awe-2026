// Eine Beweiskarte (Exercise 5, Demo 1).
//
// Ersetzt renderEvidenceCardHTML() aus js/views/evidence.ts: dort wurden
// 20 Zeilen String zusammengesetzt, inklusive der aria-label-Beschriftung
// mitten in der Konkatenation.

import { Card } from "../../../shared/components/Card.js";
import { Badge, toneForRelevance, toneForStatus } from "../../../shared/components/Badge.js";
import { BookmarkButton } from "./BookmarkButton.js";
import { formatDate } from "../../../../utils.js";
import type { Evidence } from "../../../../types.js";

interface EvidenceCardProps {
  evidence: Evidence;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export function EvidenceCard({ evidence, isBookmarked, onToggleBookmark }: EvidenceCardProps) {
  return (
    <Card className="evidence-card">
      <BookmarkButton
        isBookmarked={isBookmarked}
        evidenceTitle={evidence.title}
        onToggle={onToggleBookmark}
      />

      <h3>{evidence.title}</h3>

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
