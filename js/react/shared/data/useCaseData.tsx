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
// sie nur noch aus dem Context.
//
// Exercise 6, Demo 5: Die Quelle hat gewechselt. Statt der statischen
// Dateien unter public/data/ fragt der Lader jetzt das Node-Backend aus
// Demo 4. Dass dafür genau EINE Datei anzufassen war, ist das Ergebnis von
// Demo 9 aus Exercise 5 - vorher hätte dieselbe Änderung in fünf Seiten
// gleichzeitig passieren müssen.
//
// Exercise 6, Demo 6: Der Zustand ist ein unterscheidender Vereinigungstyp
// geworden, die Fehlermeldung steht darin, und es gibt einen Ausweg
// (reload). Siehe Kommentar bei CaseDataState.
//
// Exercise 6, Demo 7: Die Aufräumfunktion bricht die Anfragen wirklich ab,
// statt ihr Ergebnis nur zu ignorieren.
//
// Exercise 6, Demo 8: Der handgeschriebene Effect ist komplett entfallen.
// Was von ihm übrig ist, steht in shared/hooks/useFetch und wird hier
// fünfmal aufgerufen.
//
// Die Datei heißt .tsx, weil sie JSX enthält (<CaseDataContext.Provider>).
// Die Importe "./useCaseData.js" in den Seiten bleiben gleich: durch
// moduleResolution "bundler" löst TypeScript "./useCaseData.js" auf
// useCaseData.tsx auf.

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useFetch } from "../hooks/useFetch.js";

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

/** Die geladenen Falldaten. Existiert nur im Zustand "ready". */
export interface CaseDataPayload {
  caseData: CaseData;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
}

/**
 * Exercise 6, Demo 6: ein unterscheidender Vereinigungstyp statt eines
 * Objekts mit Status UND immer vorhandenen Feldern.
 *
 * Vorher stand hier status: "loading" | "ready" | "error" NEBEN
 * evidence: Evidence[]. Beim Laden war evidence also ein leeres Array -
 * ununterscheidbar von "geladen, aber nichts drin". Genau diese zwei Fälle
 * soll Demo 6 trennen.
 *
 * Jetzt gibt es die Daten nur im Zweig "ready". Eine Komponente, die
 * evidence lesen will, MUSS vorher den Status geprüft haben, sonst
 * übersetzt TypeScript nicht. Der Unterschied zu drei Booleans
 * (isLoading, error, data) ist, dass sich zwei Zweige hier nicht
 * widersprechen können - es ist immer genau einer.
 */
export type CaseDataState =
  | { status: "loading" }
  | { status: "error"; message: string; reload: () => void }
  | { status: "ready"; data: CaseDataPayload };

// Exercise 6, Demo 8: Der handgeschriebene Effect ist weg. Fünfmal
// derselbe Hook, einmal je Ressource - Laden, Fehlerbehandlung und Abbruch
// stehen jetzt genau einmal in shared/hooks/useFetch.
//
// Das ist die eine der beiden Stellen, die den Hook benutzen. Die zweite ist
// app/components/BackendStatus.
//
// Was hier NICHT in den Hook wandern konnte und bewusst hier bleibt:
//   - das Zusammenführen der fünf Ergebnisse zu einem Zustand
//   - toEvidence(), die Normalisierung der Evidence-Daten
// Beides kennt die Fachlichkeit dieser Anwendung. useFetch kennt nur JSON.
function useCaseDataLoader(): CaseDataState {
  const caseFile = useFetch<CaseData>(resourceUrl("case"));
  const people = useFetch<Person[]>(resourceUrl("people"));
  const locations = useFetch<Location[]>(resourceUrl("locations"));
  const rawEvidence = useFetch<RawEvidence[]>(resourceUrl("evidence"));
  const timeline = useFetch<TimelineEvent[]>(resourceUrl("timeline"));

  const parts = [caseFile, people, locations, rawEvidence, timeline];

  /** Ein Knopfdruck startet alle fünf Anfragen neu. */
  function reloadAll(): void {
    for (const part of parts) part.reload();
  }

  // Ein Fehler reicht: ohne vollständige Falldaten ist die Ansicht nicht
  // sinnvoll zu zeigen. Die erste Fehlermeldung ist die, die angezeigt wird.
  for (const part of parts) {
    if (part.status === "error") {
      return { status: "error", message: part.message, reload: reloadAll };
    }
  }

  if (
    caseFile.status !== "ready" ||
    people.status !== "ready" ||
    locations.status !== "ready" ||
    rawEvidence.status !== "ready" ||
    timeline.status !== "ready"
  ) {
    return { status: "loading" };
  }

  return {
    status: "ready",
    data: {
      caseData: caseFile.data,
      people: people.data,
      locations: locations.data,
      evidence: rawEvidence.data.map(toEvidence),
      timeline: timeline.data,
    },
  };
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
 * Der rohe Zustand mit allen drei Zweigen. Genau EINE Stelle benutzt ihn:
 * AppShell, die daraus Ladeanzeige, Fehlermeldung oder die Ansicht macht.
 */
export function useCaseDataState(): CaseDataState {
  const value = useContext(CaseDataContext);
  if (value === null) {
    throw new Error("useCaseDataState() muss innerhalb von <CaseDataProvider> benutzt werden");
  }
  return value;
}

/**
 * Die Falldaten für alles unterhalb der Schranke in AppShell.
 *
 * Wirft, wenn noch nicht geladen. Das ist kein Notbehelf, sondern die
 * Zusicherung: AppShell rendert das <Outlet /> erst im Zustand "ready",
 * also KANN hier nichts Halbfertiges ankommen. Die Seiten brauchen deshalb
 * keine eigene Statusabfrage mehr und bekommen die Daten ohne null-Prüfung.
 */
export function useCaseData(): CaseDataPayload {
  const state = useCaseDataState();
  if (state.status !== "ready") {
    throw new Error(
      `useCaseData() wurde im Zustand "${state.status}" aufgerufen - erwartet wird "ready". ` +
        "Die Komponente hängt außerhalb der Schranke in AppShell."
    );
  }
  return state.data;
}
