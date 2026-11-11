// Die Endpunkte der Fallakte (Exercise 6, Demo 9).
//
// Eine Funktion je Ressource. Hier steht, welche Endpunkte es gibt und
// welchen Typ ihre Antwort hat - die Ablauflogik (Laden, Fehler, Abbruch)
// liegt eine Schicht höher in useAsyncResource.
//
// Alle Funktionen stehen auf Modulebene. Das ist wichtig: useAsyncResource
// nimmt die Funktion als Abhängigkeit, und eine Funktion auf Modulebene hat
// bei jedem Render dieselbe Identität. Eine im Render erzeugte Pfeilfunktion
// wäre jedes Mal eine neue - derselbe Effekt wie bei objectDep in Demo 2,
// und der Effect liefe bei jedem Render erneut.

import { getJson } from "./client.js";
import type { RequestOptions } from "./client.js";
import type {
  CaseData,
  Evidence,
  EvidenceRelevance,
  EvidenceStatus,
  Location,
  Person,
  TimelineEvent,
} from "../../../types.js";

/** Lebenszeichen des Entwicklungs-Backends. */
export interface Health {
  ok: boolean;
  resources: string[];
}

// evidence.json hält sich bei status und relevance nicht an die Union-Typen
// ("Reviewed" statt "reviewed"). Die Form der Antwort ist Sache dieser
// Schicht, also wird hier normalisiert - niemand darüber sieht RawEvidence.
type RawEvidence = Omit<Evidence, "status" | "relevance"> & {
  status: string;
  relevance: string;
};

const EVIDENCE_STATUSES: readonly EvidenceStatus[] = ["unreviewed", "reviewed", "flagged"];
const EVIDENCE_RELEVANCES: readonly EvidenceRelevance[] = ["unknown", "relevant", "irrelevant"];

function toEvidence(raw: RawEvidence): Evidence {
  const status = raw.status.toLowerCase();
  const relevance = raw.relevance.toLowerCase();
  return {
    ...raw,
    status: EVIDENCE_STATUSES.find((known) => known === status) ?? "unreviewed",
    relevance: EVIDENCE_RELEVANCES.find((known) => known === relevance) ?? "unknown",
  };
}

export function getCase(signal: AbortSignal): Promise<CaseData> {
  return getJson<CaseData>("case", { signal });
}

export function getPeople(signal: AbortSignal): Promise<Person[]> {
  return getJson<Person[]>("people", { signal });
}

export function getLocations(signal: AbortSignal): Promise<Location[]> {
  return getJson<Location[]>("locations", { signal });
}

export async function getEvidence(signal: AbortSignal): Promise<Evidence[]> {
  const raw = await getJson<RawEvidence[]>("evidence", { signal });
  return raw.map(toEvidence);
}

export function getTimeline(signal: AbortSignal): Promise<TimelineEvent[]> {
  return getJson<TimelineEvent[]>("timeline", { signal });
}

export function getHealth(signal: AbortSignal): Promise<Health> {
  return getJson<Health>("health", { signal });
}

/**
 * Nur für die Vorführung in Demo 7: dieselbe Ressource absichtlich
 * langsam. Steht hier, damit auch dieser Aufruf nicht an der Zugriffsschicht
 * vorbeigeht - keine Komponente ruft fetch() selbst auf.
 */
export function getSlowResource(
  resource: "people" | "locations",
  options: RequestOptions
): Promise<unknown[]> {
  return getJson<unknown[]>(resource, options);
}
