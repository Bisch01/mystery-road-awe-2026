// Lesen und Schreiben der Bookmarks im Local Storage.
//
// Derselbe Schlüssel wie in js/storage.ts (Vanilla), damit beide Varianten
// dieselben Lesezeichen sehen. Local Storage ist synchron – deshalb kann
// readBookmarks() direkt als Startwert eines useState dienen.

import type { EvidenceId } from "../../../types.js";

const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";

export function readBookmarks(): EvidenceId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeBookmarks(ids: EvidenceId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(ids));
  } catch (err) {
    console.error("Bookmarks konnten nicht gespeichert werden", err);
  }
}
