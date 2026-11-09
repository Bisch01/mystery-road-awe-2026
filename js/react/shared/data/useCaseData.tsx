// Datenzugriff der React-Variante.
//
// Lädt dieselben fünf Datensätze wie die Vanilla-App - seit Exercise 6,
// Demo 5 im Entwicklungsmodus aus dem Node-Backend, im Produktionsbuild
// weiterhin aus public/data/. Bewusst ein eigener Lader statt api.ts: dort
// ist das Laden fest mit den render*-Funktionen verdrahtet.
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
// Exercise 6, Demo 5: Die Quelle hat gewechselt. Statt der statischen
// Dateien unter public/data/ fragt der Lader jetzt das Node-Backend aus
// Demo 4. Dass dafür genau EINE Datei anzufassen war, ist das Ergebnis von
// Demo 9 aus Exercise 5 - vorher hätte dieselbe Änderung in fünf Seiten
// gleichzeitig passieren müssen.
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

// Exercise 6, Demo 5: die Falldaten kommen jetzt aus dem Node-Backend
// (server/server.js), nicht mehr aus den statischen Dateien.
//
// Zwei Quellen, weil das Backend absichtlich nur lokal läuft:
//   Entwicklung  ->  /api/evidence            (Vite leitet an Port 3001 weiter)
//   Produktion   ->  <base>/data/evidence.json  (GitHub Pages, kein Backend)
//
// import.meta.env.DEV entscheidet; Vite ersetzt den Wert beim Bauen fest,
// der jeweils andere Zweig fällt aus dem Bundle heraus.
const API_BASE = "/api";
const FILE_BASE = `${import.meta.env.BASE_URL}data`;

/** Ressourcenname -> Adresse. "evidence" wird zu /api/evidence bzw. .../data/evidence.json. */
function resourceUrl(resource: string): string {
  return import.meta.env.DEV ? `${API_BASE}/${resource}` : `${FILE_BASE}/${resource}.json`;
}

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

/**
 * Holt eine Ressource und wirft bei allem, was nicht 2xx ist.
 *
 * Der Wurf ist neu wichtig: fetch() lehnt NUR bei Netzwerkfehlern ab. Ein
 * 500 vom Server ist aus Sicht von fetch() eine erfolgreiche Antwort, und
 * res.json() würde den Fehlertext zu parsen versuchen. Ohne diese Prüfung
 * landet ein Serverfehler also still als kaputte Daten in der Oberfläche,
 * statt im Fehlerzustand.
 */
async function fetchJson<T>(resource: string): Promise<T> {
  const url = resourceUrl(resource);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${String(res.status)} ${res.statusText}`);
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
          fetchJson<CaseData>("case"),
          fetchJson<Person[]>("people"),
          fetchJson<Location[]>("locations"),
          fetchJson<RawEvidence[]>("evidence"),
          fetchJson<TimelineEvent[]>("timeline"),
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
