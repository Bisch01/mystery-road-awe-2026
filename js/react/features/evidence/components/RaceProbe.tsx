// Sonde für Anfragen-Wettläufe (Exercise 6, Demo 7).
//
// NUR im Entwicklungsmodus sichtbar: EvidencePage rendert sie hinter
// import.meta.env.DEV.
//
// Zwei Ressourcen mit sehr unterschiedlicher Antwortzeit, beide über den
// ?delay-Schalter aus Demo 4:
//   people     3000 ms  (langsam)
//   locations   300 ms  (schnell)
//
// "Wettlauf auslösen" startet die langsame und 150 ms später die schnelle
// Anfrage. Beide laufen gleichzeitig. Ohne Abbruch kommt die schnelle
// zuerst an und wird angezeigt - und knapp drei Sekunden später überschreibt
// die LANGSAME, längst überholte Antwort sie wieder. Genau das ist der
// Wettlauf: nicht wer zuerst gestartet wurde gewinnt, sondern wer zuletzt
// antwortet.
//
// Mit dem Schalter "AbortController benutzen" bricht die Aufräumfunktion des
// Effects die alte Anfrage ab, sobald eine neue startet. Dann kann die
// veraltete Antwort gar nicht mehr ankommen.
//
// Exercise 6, Demo 9: der Aufruf geht nicht mehr direkt an fetch(), sondern
// durch die Zugriffsschicht. Dadurch gibt es in der gesamten React-Variante
// nur noch eine einzige Stelle mit fetch().

import { useEffect, useState } from "react";

import { getSlowResource } from "../../../shared/api/caseApi.js";
import { isAbortError } from "../../../shared/api/client.js";

type RaceResource = "people" | "locations";

const DELAYS: Record<RaceResource, number> = {
  people: 3000,
  locations: 300,
};

interface Shown {
  resource: RaceResource;
  count: number;
}

export function RaceProbe() {
  const [resource, setResource] = useState<RaceResource>("people");
  const [useAbort, setUseAbort] = useState(false);
  const [shown, setShown] = useState<Shown | null>(null);
  const [pending, setPending] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  // Zähler, damit derselbe Knopf zweimal hintereinander auch zweimal eine
  // Anfrage auslöst - sonst würde React beim gleichen Wert gar nicht neu
  // rendern und der Effect liefe nicht.
  const [runToken, setRunToken] = useState(0);

  function request(next: RaceResource): void {
    setResource(next);
    setRunToken((current) => current + 1);
  }

  /** Löst den Wettlauf zuverlässig aus: langsam starten, kurz darauf schnell. */
  function startRace(): void {
    request("people");
    window.setTimeout(() => {
      request("locations");
    }, 150);
  }

  function note(line: string): void {
    console.log("[Demo 7]", line);
    setLog((current) => [line, ...current].slice(0, 6));
  }

  useEffect(() => {
    const controller = new AbortController();
    const delay = DELAYS[resource];

    setPending((current) => current + 1);
    note(`start    ${resource} (${String(delay)} ms)`);

    // Demo 9: auch diese Sonde ruft kein fetch() mehr selbst auf. Der
    // Aufruf geht durch die Zugriffsschicht, die auch den ?delay-Schalter
    // des Backends kennt.
    getSlowResource(resource, {
      delayMs: delay,
      signal: useAbort ? controller.signal : undefined,
    })
      .then((data) => {
        setPending((current) => current - 1);
        note(`fertig   ${resource} -> ${String(data.length)} Einträge, wird angezeigt`);
        setShown({ resource, count: data.length });
      })
      .catch((err: unknown) => {
        setPending((current) => current - 1);
        if (isAbortError(err)) {
          note(`abgebrochen ${resource}`);
          return;
        }
        note(`Fehler   ${resource}: ${String(err)}`);
      });

    return () => {
      if (useAbort) controller.abort();
    };
  }, [resource, useAbort, runToken]);

  const stale = shown !== null && shown.resource !== resource;

  return (
    <div className="race-probe">
      <strong>Demo 7 &mdash; Wettlauf zweier Anfragen (nur Entwicklungsmodus)</strong>

      <div>
        Angefordert: <code>{resource}</code> ({DELAYS[resource]} ms) &middot; offene Anfragen:{" "}
        <code>{pending}</code>
      </div>
      <div>
        Angezeigt:{" "}
        {shown === null ? (
          <code>noch nichts</code>
        ) : (
          <code className={stale ? "probe-bad" : "probe-good"}>
            {shown.resource} ({shown.count} Einträge)
          </code>
        )}
        {stale && <strong className="probe-bad"> &larr; VERALTET</strong>}
      </div>

      <div className="probe-hint">
        &bdquo;Wettlauf auslösen&ldquo; startet die langsame Anfrage und 150 ms später die schnelle.
        Ohne Abbruch gewinnt am Ende die ALTE, langsame Antwort und überschreibt die neue.
      </div>

      <label className="cleanup-switch">
        <input
          type="checkbox"
          checked={useAbort}
          onChange={(event) => {
            setUseAbort(event.target.checked);
          }}
        />{" "}
        AbortController benutzen
      </label>

      <div>
        <button type="button" className="btn btn-primary btn-small" onClick={startRace}>
          Wettlauf auslösen
        </button>{" "}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => {
            request("people");
          }}
        >
          langsam: people (3000 ms)
        </button>{" "}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => {
            request("locations");
          }}
        >
          schnell: locations (300 ms)
        </button>
      </div>

      <ol className="race-log">
        {log.map((line, index) => (
          <li key={`${String(index)}-${line}`}>
            <code>{line}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}
