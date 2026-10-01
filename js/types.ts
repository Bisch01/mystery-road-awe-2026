// DOMÄNENMODELL
// Beschreibt die Form der Dateien in public/data/. Eine Datei, damit jedes
// Modul dieselbe Definition benutzt und Änderungen an genau einer Stelle passieren.

/** Bezeichner eines Beweisstücks, z. B. "E01". */
export type EvidenceId = string;
/** Bezeichner einer Person, z. B. "nova-byte" -- NICHT der Anzeigename. */
export type PersonId = string;
/** Bezeichner eines Orts, z. B. "L01". */
export type LocationId = string;
/** Bezeichner eines Zeitstrahl-Eintrags, z. B. "T01". */
export type TimelineEventId = string;

/** Vollständiger Zeitstempel in UTC, z. B. "2026-10-16T06:49:00Z". */
export type IsoTimestamp = string;
/** Reines Datum ohne Uhrzeit, z. B. "2026-10-16". */
export type IsoDate = string;

export type EvidenceStatus = "unreviewed" | "reviewed" | "flagged";
export type EvidenceRelevance = "unknown" | "relevant" | "irrelevant";
export type Certainty = "confirmed" | "reported" | "contradictory";

export interface Person {
  id: PersonId;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  /** Freitext-Beschriftungen wie "Operator workstation" -- KEINE Ids. */
  contains: string[];
}

export interface Evidence {
  id: EvidenceId;
  type: string;
  title: string;
  timestamp: IsoTimestamp;
  summary: string;
  content: string;
  personIds: PersonId[];
  locationIds: LocationId[];
  tags: string[];
  status: EvidenceStatus;
  relevance: EvidenceRelevance;
  /** Nicht in der JSON-Datei: wird beim Laden aus dem Local Storage gesetzt. */
  bookmarked?: boolean;
}

export interface TimelineEvent {
  id: TimelineEventId;
  time: IsoTimestamp;
  title: string;
  description: string;
  type: string;
  certainty: Certainty;
  personIds: PersonId[];
  locationIds: LocationId[];
  evidenceIds: EvidenceId[];
}

export interface CaseData {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: IsoDate;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}