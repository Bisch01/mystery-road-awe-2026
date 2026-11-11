// Ablauflogik für asynchrone Daten (Exercise 6, Demo 8, umgebaut in Demo 9).
//
// Demo 8 hat diese Logik aus dem Lader der Falldaten herausgelöst: Lade-,
// Fehler- und Fertigzustand, Abbruch, erneuter Versuch - genau einmal
// geschrieben, an mehreren Stellen benutzt.
//
// Demo 9 hat ihr das Wissen über das Backend weggenommen. Der Hook hieß
// vorher useFetch und baute selbst Adressen; jetzt bekommt er eine fertige
// Ladefunktion und weiß weder, welche Adresse dahintersteckt, noch dass es
// überhaupt HTTP ist. Er ist damit die mittlere der drei Schichten:
//
//   Komponenten                  nur Darstellung
//   useAsyncResource             Ablauf: lädt / Fehler / fertig, Abbruch
//   shared/api/*                 Adressen, fetch, Form der Antwort
//
// WICHTIG für Aufrufer: load muss eine stabile Funktion sein, also auf
// Modulebene stehen (siehe shared/api/caseApi). Eine im Render erzeugte
// Pfeilfunktion wäre bei jedem Render eine neue Identität, und der Effect
// liefe jedes Mal erneut - derselbe Mechanismus wie bei objectDep in Demo 2.

import { useEffect, useState } from "react";

import { isAbortError } from "../api/client.js";

/** Was ein Ladevorgang sein kann. Genau einer der drei Zweige gilt. */
export type AsyncResource<T> =
  | { status: "loading"; reload: () => void }
  | { status: "error"; message: string; reload: () => void }
  | { status: "ready"; data: T; reload: () => void };

/** Derselbe Typ ohne reload - das ist der Teil, der im Zustand liegt. */
type ResourceState<T> =
  { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

export function useAsyncResource<T>(load: (signal: AbortSignal) => Promise<T>): AsyncResource<T> {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  function reload(): void {
    setState({ status: "loading" });
    setReloadToken((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function run(): Promise<void> {
      try {
        const data = await load(controller.signal);
        setState({ status: "ready", data });
      } catch (err) {
        // Demo 7: ein Abbruch ist KEIN Fehlerzustand.
        if (isAbortError(err)) return;
        console.error("Laden fehlgeschlagen:", err);
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
  }, [load, reloadToken]);

  return { ...state, reload };
}
