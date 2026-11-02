// Datenzugriff der React-Variante.
//
// Lädt dieselben fünf JSON-Dateien aus public/data/ wie die Vanilla-App und
// liest denselben Local-Storage-Schlüssel. Bewusst ein eigener Lader statt
// api.ts: dort ist das Laden fest mit den render*-Funktionen verdrahtet.
//
// PLATZHALTER: In Exercise 4 wandert dieser Zustand nach oben (Context oder
// Store), damit sich alle Views dieselben Daten teilen. Heute hält ihn die
// Dashboard-Seite allein.

import { useEffect, useState } from "react";

// Exercise 5, Demo 1: der Leser liegt jetzt im gemeinsamen Modul, weil auch
// EvidencePage und WorkspacePage ihn brauchen.
import { readBookmarks } from "./bookmarksStorage.js";

import type {
  CaseData,
  Evidence,
  EvidenceId,
  EvidenceRelevance,
  EvidenceStatus,
  Location,
  Person,
  TimelineEvent,
} from "../../../types.js";

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

// evidence.json hält sich bei status und relevance nicht an die Union-Typen
// ("Reviewed" statt "reviewed"). Dieselbe Normalisierung wie in api.ts.
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

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(DATA_BASE + file);
  if (!res.ok) throw new Error(`${file}: HTTP ${String(res.status)}`);
  return (await res.json()) as T;
}

export interface CaseDataState {
  status: "loading" | "ready" | "error";
  caseData: CaseData | null;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: EvidenceId[];
}

const EMPTY: CaseDataState = {
  status: "loading",
  caseData: null,
  evidence: [],
  people: [],
  locations: [],
  timeline: [],
  bookmarks: [],
};

export function useCaseData(): CaseDataState {
  const [state, setState] = useState<CaseDataState>(EMPTY);

  useEffect(() => {
    // StrictMode ruft Effects im Entwicklungsmodus doppelt auf. Das Flag
    // verhindert, dass ein abgebrochener Durchlauf noch Zustand setzt.
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const [caseData, people, locations, rawEvidence, timeline] = await Promise.all([
          fetchJson<CaseData>("case.json"),
          fetchJson<Person[]>("people.json"),
          fetchJson<Location[]>("locations.json"),
          fetchJson<RawEvidence[]>("evidence.json"),
          fetchJson<TimelineEvent[]>("timeline.json"),
        ]);

        if (cancelled) return;

        setState({
          status: "ready",
          caseData,
          people,
          locations,
          evidence: rawEvidence.map(toEvidence),
          timeline,
          bookmarks: readBookmarks(),
        });
      } catch (err) {
        console.error("Falldaten konnten nicht geladen werden", err);
        if (!cancelled) setState((current) => ({ ...current, status: "error" }));
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
