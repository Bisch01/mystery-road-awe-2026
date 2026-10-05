// Ersetzt sechs Stellen String-Markup in dashboard.ts, evidence.ts und
// timeline.ts sowie die Helfer getStatusBadgeClass/getRelevanceBadgeClass:
// Markup, Zuordnungslogik und Typisierung liegen jetzt in EINER Einheit.

import type { EvidenceStatus } from "../../../types.js";

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
