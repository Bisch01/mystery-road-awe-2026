// Wiederverwendbarer Lade-Hook (Exercise 6, Demo 8).
//
// Hier steckt alles, was in den Demos 5 bis 7 von Hand im Lader der
// Falldaten stand:
//   Demo 5  fetch() in einem Effect, Fehler bei allem, was nicht 2xx ist
//   Demo 6  Lade- und Fehlerzustand als unterscheidender Vereinigungstyp,
//           Fehlermeldung im Zustand, reload() als Ausweg
//   Demo 7  AbortController, Abbruch in der Aufräumfunktion, AbortError
//           NICHT als Fehler behandeln
//
// Warum ein Hook und keine normale Hilfsfunktion: die Logik braucht
// useState (Zustand über Renders hinweg) und useEffect (Arbeit nach dem
// Commit, mit Aufräumen). Beides geht nur in einer Komponente oder in
// einem Hook. Eine gewöhnliche Funktion kann keinen Zustand haben, der das
// nächste Rendern überlebt.
//
// Daraus folgen die Regeln, die React erzwingt: ein Hook wird nur auf der
// obersten Ebene einer Komponente oder eines anderen Hooks aufgerufen, nie
// in Bedingungen, Schleifen oder Rückrufen - React ordnet die Hooks
// ausschließlich über die Aufrufreihenfolge zu. Und der Name muss mit
// "use" beginnen, sonst kann das Werkzeug diese Regel nicht prüfen.

import { useEffect, useState } from "react";

/** Was ein Ladevorgang sein kann. Genau einer der drei Zweige gilt. */
export type AsyncResource<T> =
  | { status: "loading"; reload: () => void }
  | { status: "error"; message: string; reload: () => void }
  | { status: "ready"; data: T; reload: () => void };

/** Derselbe Typ ohne reload - das ist der Teil, der im Zustand liegt. */
type FetchState<T> =
  { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

/** Ein abgebrochener Aufruf ist kein Fehler, sondern ein geplantes Ende. */
function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * Lädt eine JSON-Ressource und hält Lade-, Fehler- und Fertigzustand.
 *
 * Die Adresse ist die Abhängigkeit: ändert sie sich, wird die alte
 * Anfrage abgebrochen und eine neue gestartet. Damit kann die Antwort auf
 * eine alte Adresse die auf eine neue nicht mehr überschreiben.
 */
export function useFetch<T>(url: string): AsyncResource<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  function reload(): void {
    setState({ status: "loading" });
    setReloadToken((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function run(): Promise<void> {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`${url}: HTTP ${String(res.status)} ${res.statusText}`);
        }
        const data = (await res.json()) as T;
        setState({ status: "ready", data });
      } catch (err) {
        if (isAbortError(err)) return;
        console.error("Laden fehlgeschlagen:", url, err);
        setState({
          status: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    void run();

    // Die Aufräumfunktion IST der Abbruch (Demo 7).
    return () => {
      controller.abort();
    };
  }, [url, reloadToken]);

  return { ...state, reload };
}
