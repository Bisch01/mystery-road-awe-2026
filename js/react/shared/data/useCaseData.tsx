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
// Exercise 6, Demo 7: Die Aufräumfunktion bricht die Anfragen jetzt wirklich
// ab, statt ihr Ergebnis nur zu ignorieren. Siehe Kommentar im Effect.
//
// Die Datei heißt .tsx, weil sie JSX enthält (<CaseDataContext.Provider>).
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
 *
 * Demo 7: das Signal wird an fetch() durchgereicht. Ohne diesen Parameter
 * hätte ein AbortController keine Wirkung - der Abbruch muss die EINZELNE
 * Anfrage erreichen, nicht nur die Stelle, die auf sie wartet.
 */
async function fetchJson<T>(resource: string, signal: AbortSignal): Promise<T> {
  const url = resourceUrl(resource);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${url}: HTTP ${String(res.status)} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Ein abgebrochener Aufruf ist kein Fehler, sondern ein geplantes Ende. */
function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
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

// Der eigentliche Lader. Nicht exportiert: er darf nur EINMAL laufen,
// nämlich im Provider.
function useCaseDataLoader(): CaseDataState {
  const [state, setState] = useState<CaseDataState>({ status: "loading" });
  // Demo 6: ein Zähler als Abhängigkeit. Erhöhen bedeutet "Effect neu
  // ausführen" - damit bekommt der Fehlerzustand einen Ausweg.
  const [reloadToken, setReloadToken] = useState(0);

  function reload(): void {
    setState({ status: "loading" });
    setReloadToken((current) => current + 1);
  }

  useEffect(() => {
    // Exercise 6, Demo 7: ein AbortController statt eines cancelled-Flags.
    //
    // Vorher stand hier "let cancelled = false", und die Aufräumfunktion
    // setzte es auf true. Das hat nur das ERGEBNIS verworfen - die fünf
    // Anfragen liefen trotzdem bis zum Ende. Im Entwicklungsmodus waren das
    // wegen StrictMode zehn statt fünf, und bei langsamen Antworten dauerte
    // das Laden doppelt so lange, weil der Browser pro Host nur sechs
    // Verbindungen gleichzeitig offen hält.
    //
    // Jetzt bricht die Aufräumfunktion die Anfragen tatsächlich ab.
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const [caseData, people, locations, rawEvidence, timeline] = await Promise.all([
          fetchJson<CaseData>("case", controller.signal),
          fetchJson<Person[]>("people", controller.signal),
          fetchJson<Location[]>("locations", controller.signal),
          fetchJson<RawEvidence[]>("evidence", controller.signal),
          fetchJson<TimelineEvent[]>("timeline", controller.signal),
        ]);

        setState({
          status: "ready",
          data: {
            caseData,
            people,
            locations,
            evidence: rawEvidence.map(toEvidence),
            timeline,
          },
        });
      } catch (err) {
        // Demo 7: ein Abbruch ist KEIN Fehlerzustand. Er bedeutet, dass
        // jemand dieses Ergebnis absichtlich nicht mehr wollte. Wer das
        // nicht abfängt, zeigt beim Seitenwechsel eine rote Fehlermeldung
        // für eine Anfrage, die er selbst gestoppt hat.
        if (isAbortError(err)) return;

        console.error("Falldaten konnten nicht geladen werden", err);

        // Demo 6: die Meldung des Fehlers wandert IN den Zustand. Vorher
        // stand sie nur in der Konsole, und die Oberfläche zeigte einen
        // Satz, der zu jedem Fehler gleich gut und gleich wenig passte.
        setState({
          status: "error",
          message: err instanceof Error ? err.message : String(err),
          reload,
        });
      }
    }

    void load();

    // Demo 7: Die Aufräumfunktion IST der Abbruch. Es gibt keine zweite
    // Stelle, die abbricht - React ruft sie beim Aushängen und vor jedem
    // erneuten Lauf des Effects auf, und genau dort gehört abort() hin.
    return () => {
      controller.abort();
    };
    // reloadToken ist die einzige Abhängigkeit: erhöhen heißt neu laden.
  }, [reloadToken]);

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
