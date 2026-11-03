// Datenzugriff der React-Variante.
//
// Lädt dieselben fünf JSON-Dateien aus public/data/ wie die Vanilla-App.
// Bewusst ein eigener Lader statt api.ts: dort ist das Laden fest mit den
// render*-Funktionen verdrahtet.
//
// Exercise 5, Demo 4: die Lesezeichen liegen NICHT mehr in diesem Zustand.
// Sie wurden dort einmal beim Laden abgelegt (bookmarks: readBookmarks()) und
// danach nie wieder aktualisiert – also ein Schnappschuss, der veralten kann.
// Geladene Falldaten und lokaler Benutzerzustand sind zwei verschiedene Dinge
// und gehören nicht in dasselbe Zustandsobjekt.
//
// Exercise 5, Demo 9: der Hook wurde vorher in JEDER Seite einzeln aufgerufen
// (Dashboard, Evidence, Timeline, People, Locations, PersonDetail, Workspace).
// Jeder Aufruf war ein eigener useState + eigener useEffect, also fünf
// fetch()-Aufrufe pro Seitenwechsel und sieben Kopien derselben Daten im
// Speicher. Jetzt lädt genau ein Provider die Daten, und useCaseData() liest
// sie nur noch aus dem Context. Die Aufrufstellen in den Seiten bleiben
// unverändert - die Signatur ist dieselbe.
//
// Die Datei heißt jetzt .tsx, weil sie JSX enthält (<CaseDataContext.Provider>).
// Die Importe "./useCaseData.js" in den Seiten bleiben gleich: durch
// moduleResolution "bundler" löst TypeScript "./useCaseData.js" auf
// useCaseData.tsx auf.

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type {
  CaseData,
  Evidence,
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
}

const EMPTY: CaseDataState = {
  status: "loading",
  caseData: null,
  evidence: [],
  people: [],
  locations: [],
  timeline: [],
};

// Der eigentliche Lader. Nicht exportiert: er darf nur noch EINMAL laufen,
// nämlich im Provider. Dass das jetzt erzwungen ist, ist der Kern von Demo 9.
function useCaseDataLoader(): CaseDataState {
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

const CaseDataContext = createContext<CaseDataState | null>(null);

interface CaseDataProviderProps {
  children: ReactNode;
}

export function CaseDataProvider({ children }: CaseDataProviderProps) {
  const value = useCaseDataLoader();
  return <CaseDataContext.Provider value={value}>{children}</CaseDataContext.Provider>;
}

/**
 * Liest die Falldaten aus dem Context. Signatur unverändert gegenüber Demo 8,
 * deshalb musste in den Seiten keine Zeile angepasst werden.
 */
export function useCaseData(): CaseDataState {
  const value = useContext(CaseDataContext);
  if (value === null) {
    throw new Error("useCaseData() muss innerhalb von <CaseDataProvider> benutzt werden");
  }
  return value;
}
