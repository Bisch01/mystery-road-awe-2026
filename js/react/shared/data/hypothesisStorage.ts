// Lesen und Schreiben des Hypothesen-Entwurfs im Local Storage.
//
// Derselbe Schlüssel wie in js/storage.ts (Vanilla). Die Vanilla-Variante
// liest den Entwurf mit "JSON.parse(raw) as Partial<HypothesisDraft>" – eine
// Behauptung, die nichts prüft. Hier wird jedes Feld einzeln geprüft, damit
// ein von Hand bearbeiteter Local Storage die App nicht umwirft
// (Bug 5.5 aus Exercise 1).

import type { EvidenceId, PersonId } from "../../../types.js";

const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export interface HypothesisDraft {
  suspectId: PersonId;
  nature: string;
  evidenceIds: EvidenceId[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

export const EMPTY_DRAFT: HypothesisDraft = {
  suspectId: "",
  nature: "",
  evidenceIds: [],
  confidence: "50",
  explanation: "",
  alternative: "",
  savedAt: "",
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function readHypothesis(): HypothesisDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
    if (!raw) return EMPTY_DRAFT;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_DRAFT;

    const record = parsed as Record<string, unknown>;
    const ids = record.evidenceIds;

    return {
      suspectId: asString(record.suspectId, ""),
      nature: asString(record.nature, ""),
      evidenceIds: Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [],
      confidence: asString(record.confidence, "50"),
      explanation: asString(record.explanation, ""),
      alternative: asString(record.alternative, ""),
      savedAt: asString(record.savedAt, ""),
    };
  } catch (err) {
    console.warn("Hypothesen-Entwurf konnte nicht gelesen werden", err);
    return EMPTY_DRAFT;
  }
}

export function writeHypothesis(draft: HypothesisDraft): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
    return true;
  } catch (err) {
    console.error("Hypothesen-Entwurf konnte nicht gespeichert werden", err);
    return false;
  }
}
