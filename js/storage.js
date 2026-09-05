
//Es gibt 2 Speicher:
        //localStorage (Festplatte) Überlebt den Reload, nur Text, langsam
        //notesStore (Arbeitsspeicher) Weg beim Reload, Echtes Objekt und sofort zugreifbar
//Trick:
        //localStorage wird nicht ständig gelesen, beim Start einmal alles rüberkopieren
        //danach arbeitet die App nur noch im notesStore, und speichert nur bei Änderungen in localStorage

//imports aus state.js
import {
  bookmarks,
  notesStore,
  setBookmarks,
  setNotesStore
} from "./state.js";

const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

// --- Bookmarks ---

// Speichert die aktuellen Bookmarks im Local Storage
export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
}

// Lädt die Bookmarks aus dem Local Storage und setzt sie in den State
export function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed = raw ? JSON.parse(raw) : [];
    setBookmarks(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    setBookmarks([]);
  }
}

// --- Notizen ---

// Speichert eine Notiz für ein bestimmtes Beweisstück im notesStore (Arbeitsspeicher) und im Local Storage
export function saveNoteForEvidence(evidenceId, text) {
  notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesStore));
}

// Lädt eine Notiz für ein bestimmtes Beweisstück aus dem notesStore (Arbeitsspeicher)
export function loadNoteForEvidence(evidenceId) {
  return notesStore[evidenceId] || "";
}

// Lädt alle Notizen aus dem Local Storage und setzt sie in den notesStore (Arbeitsspeicher)
export function loadNotesFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    setNotesStore({});
    return;
  }

  setNotesStore(JSON.parse(raw));
}

// Lädt eine Notiz für ein bestimmtes Beweisstück asynchron aus dem notesStore (Arbeitsspeicher)
export function loadNoteAsync(evidenceId) {
  return new Promise(function (resolve) {
    resolve(notesStore[evidenceId] || "");
  });
}