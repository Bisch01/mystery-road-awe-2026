// Zugriffsschicht auf das Backend (Exercise 6, Demo 9).
//
// Die EINZIGE Datei der Anwendung, in der fetch() vorkommt. Sie kennt die
// Adressen und die Form der Antworten - und sonst nichts: keinen React-
// Zustand, keine Komponente, keine Ladeanzeige.
//
// Darüber liegen zwei weitere Schichten:
//   shared/hooks/useAsyncResource   Ablauflogik: Lade-, Fehlerzustand,
//                                   Abbruch, erneuter Versuch
//   Komponenten                     nur Darstellung
//
// Der Nutzen zeigt sich an der Frage "was müsste ich anfassen, wenn das
// Backend morgen andere Adressen hat": genau diese Datei. Keine Komponente,
// kein Hook.

const API_BASE = "/api";
const FILE_BASE = `${import.meta.env.BASE_URL}data`;

/** Welche Schalter des Entwicklungs-Backends ein Aufruf benutzen darf. */
export interface RequestOptions {
  signal?: AbortSignal;
  /** Künstliche Verzögerung in Millisekunden (?delay=). */
  delayMs?: number;
  /** Erzwingt eine 500er-Antwort (?fail=1). */
  fail?: boolean;
  /** Erzwingt eine leere Liste (?empty=1). */
  empty?: boolean;
}

/** Ein Fehler mit HTTP-Status - mehr Information als eine bloße Meldung. */
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`${url}: HTTP ${String(status)} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

/** Ein abgebrochener Aufruf ist kein Fehler, sondern ein geplantes Ende. */
export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * Baut die Adresse einer Ressource.
 *
 * Entwicklung  ->  /api/evidence              (Vite leitet an Port 3001)
 * Produktion   ->  <base>/data/evidence.json  (GitHub Pages, kein Backend)
 *
 * Die Schalter delay/fail/empty gibt es nur im Entwicklungs-Backend; im
 * Produktionsbuild wird der ganze Zweig von Vite entfernt.
 */
function resourceUrl(path: string, options: RequestOptions): string {
  if (!import.meta.env.DEV) return `${FILE_BASE}/${path}.json`;

  const query = new URLSearchParams();
  if (options.delayMs !== undefined && options.delayMs > 0) {
    query.set("delay", String(options.delayMs));
  }
  if (options.fail === true) query.set("fail", "1");
  if (options.empty === true) query.set("empty", "1");

  const suffix = query.size === 0 ? "" : `?${query.toString()}`;
  return `${API_BASE}/${path}${suffix}`;
}

/**
 * Holt eine JSON-Ressource. Wirft bei allem, was nicht 2xx ist.
 *
 * Der Wurf ist nötig, weil fetch() NUR bei Netzwerkfehlern ablehnt. Ein
 * 500 vom Server ist aus Sicht von fetch() eine erfolgreiche Antwort - ohne
 * diese Prüfung landet der Fehlertext als kaputte Daten in der Oberfläche.
 */
export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = resourceUrl(path, options);
  const res = await fetch(url, { signal: options.signal });
  if (!res.ok) throw new HttpError(res.status, res.statusText, url);
  return (await res.json()) as T;
}
