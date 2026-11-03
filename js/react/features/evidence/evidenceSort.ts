// Sortierung der Beweisliste (Exercise 5, Demo 4).
//
// Die Sortierreihenfolge ist Zustand (der Nutzer wählt sie), die sortierte
// Liste ist ein abgeleiteter Wert (sie folgt aus Liste + Reihenfolge).
// Deshalb steht hier nur die Übersetzung von Reihenfolge zu Vergleichsfunktion,
// kein Zustand.

import type { Evidence } from "../../../types.js";

export type EvidenceSortOrder = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export const SORT_ORDERS: readonly EvidenceSortOrder[] = [
  "date-desc",
  "date-asc",
  "title-asc",
  "title-desc",
];

export const DEFAULT_SORT_ORDER: EvidenceSortOrder = "date-desc";

// Zuordnungs-Tabelle statt if/else-Kette, wie bei den Badge-Tönen.
// Record<EvidenceSortOrder, ...> erzwingt einen Eintrag pro Wert: kommt eine
// fünfte Reihenfolge dazu und man vergisst sie hier, bricht tsc ab.
export const SORT_LABELS: Record<EvidenceSortOrder, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "title-asc": "Title (A\u2013Z)",
  "title-desc": "Title (Z\u2013A)",
};

const COMPARATORS: Record<EvidenceSortOrder, (a: Evidence, b: Evidence) => number> = {
  "date-desc": (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  "date-asc": (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  "title-asc": (a, b) => a.title.localeCompare(b.title),
  "title-desc": (a, b) => b.title.localeCompare(a.title),
};

/** Typwächter: macht aus dem String eines <select> eine EvidenceSortOrder. */
export function isEvidenceSortOrder(value: string): value is EvidenceSortOrder {
  return (SORT_ORDERS as readonly string[]).includes(value);
}

/**
 * Gibt eine NEUE, sortierte Liste zurück.
 *
 * Die Kopie mit [...items] ist bewusst hier und nicht beim Aufrufer: sort()
 * verändert an Ort und Stelle, und diese Funktion darf sich nicht darauf
 * verlassen, dass ihr schon eine Kopie übergeben wurde (Demo 3).
 */
export function sortEvidence(items: Evidence[], order: EvidenceSortOrder): Evidence[] {
  return [...items].sort(COMPARATORS[order]);
}
