// Ersetzt sechs Stellen String-Markup in dashboard.ts, evidence.ts und
// timeline.ts sowie die Helfer getStatusBadgeClass/getRelevanceBadgeClass:
// Markup, Zuordnungslogik und Typisierung liegen jetzt in EINER Einheit.

import type { Certainty, EvidenceStatus } from "../../../types.js";

export type BadgeTone = "unreviewed" | "reviewed" | "flagged" | "relevant" | "critical";

interface BadgeProps {
  label: string;
  tone: BadgeTone;
}

export function Badge({ label, tone }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function toneForStatus(status: EvidenceStatus): BadgeTone {
  if (status === "reviewed") return "reviewed";
  if (status === "flagged") return "flagged";
  return "unreviewed";
}

// Zuordnungs-Tabelle statt if/else-Kette: ersetzt certaintyBadgeClass()
// aus js/views/timeline.ts.
const CERTAINTY_TONES: Record<Certainty, BadgeTone> = {
  confirmed: "reviewed",
  reported: "flagged",
  contradictory: "critical",
};

export function toneForCertainty(certainty: Certainty): BadgeTone {
  return CERTAINTY_TONES[certainty];
}
