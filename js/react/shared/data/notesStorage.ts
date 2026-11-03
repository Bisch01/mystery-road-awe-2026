// Lesen und Schreiben der Notizen im Local Storage.
//
// Derselbe Schlüssel wie in js/storage.ts (Vanilla), damit beide Varianten
// dieselben Notizen sehen.

import type { EvidenceId } from "../../../types.js";

const STORAGE_KEY_NOTES = "remotion_notes";

export type NotesMap = Record<EvidenceId, string>;

export function readNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: NotesMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function writeNotes(notes: NotesMap): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error("Notizen konnten nicht gespeichert werden", err);
  }
}
