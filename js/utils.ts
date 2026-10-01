import { allEvidence, allPeople, allLocations } from "./state.js";
import type { Evidence, EvidenceId, Location, LocationId, Person, PersonId } from "./types.js";

// utils.ts importiert nur lesend aus state.ts: keine Funktion hier ändert
// Zustand oder greift auf das DOM zu. Deshalb ist das Modul von überall
// gefahrlos nutzbar, auch bevor die Seite fertig geladen ist.
//alle Funktionen dieses Moduls nehmen Werte entgegen und und geben Werte zurück

// Demo 10: aus der for-Schleife wurde .find() in einer Arrow Function.
// ?? null erhält das alte Verhalten -- .find() liefert undefined, das Original null.
export const findEvidenceById = (id: EvidenceId): Evidence | null =>
  allEvidence.find((ev) => ev.id === id) ?? null;

export const findPersonById = (id: PersonId): Person | null =>
  allPeople.find((person) => person.id === id) ?? null;

export const findLocationById = (id: LocationId): Location | null =>
  allLocations.find((loc) => loc.id === id) ?? null;

export function formatDate(ts: string | undefined): string {
  if (!ts) return "Unknown date"; //kein Zeitstempfel --> Unknown Date
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts; //Zeitstempel aber unlesbar --> gibt Rohtext zurück
  return (
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  ); //Format: 1. Jan 2020 12:00, undefined = Browser default locale
}

export const evidenceMentionsPerson = (ev: Evidence, person: Person): boolean => {
  if (!ev.personIds) return false;
  return ev.personIds.includes(person.id) || ev.personIds.includes(person.name);
};

export const getStatusBadgeClass = (status: string): string => {
  const s = status.toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
};

export const getRelevanceBadgeClass = (relevance: string): string => {
  const r = relevance.toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
};
