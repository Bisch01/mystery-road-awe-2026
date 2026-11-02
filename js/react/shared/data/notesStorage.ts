// Lesen der Notizen aus dem Local Storage.
//
// Derselbe Schlüssel wie in js/storage.ts (Vanilla). Das Schreiben folgt in
// Demo 6, wenn die Detailansicht eine Notiz speichern kann.

import type { EvidenceId } from "../../../types.js";

const STORAGE_KEY_NOTES = "remotion_notes";

export function readNotes(): Record<EvidenceId, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<EvidenceId, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}
