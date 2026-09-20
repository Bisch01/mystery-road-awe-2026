import { allEvidence, allPeople, allLocations } from './state.js';

// utils.js importiert nur lesend aus state.js: keine Funktion hier ändert
// Zustand oder greift auf das DOM zu. Deshalb ist das Modul von überall
// gefahrlos nutzbar, auch bevor die Seite fertig geladen ist.
//alle Funktionen dieses Moduls nehmen Werte entgegen und und geben Werte zurück

// reine Übersetzung:
//ID --> Objekt
//Objekt + Person --> ja/nein
//Zeitstempel --> lesbares Datum
//Statuswert --> CSS-Klasse

// Demo 10: aus der for-Schleife wurde .find() in einer Arrow Function.
// || null erhält das alte Verhalten -- .find() liefert undefined, das Original null.
export const findEvidenceById = (id) => allEvidence.find((ev) => ev.id === id) || null;

export const findPersonById = (id) => allPeople.find((person) => person.id === id) || null;

export const findLocationById = (id) => allLocations.find((loc) => loc.id === id) || null;

export function formatDate(ts) {
    if (!ts) return "Unknown date"; //kein Zeitstempfel --> Unknown Date
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts; //Zeitstempel aber unlesbar --> gibt Rohtext zurück
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); //Format: 1. Jan 2020 12:00, undefined = Browser default locale
}

export const evidenceMentionsPerson = (ev, person) => {
  if (!ev.personIds) return false;
  return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
};

export const getStatusBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
};

export const getRelevanceBadgeClass = (relevance) => {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
};


