// Sonde für Aufräumfunktionen (Exercise 6, Demo 3).
//
// NUR im Entwicklungsmodus sichtbar: EvidencePage rendert sie hinter
// import.meta.env.DEV.
//
// Ein setInterval, das sich mit einem Schalter WAHLWEISE aufräumt oder
// nicht. Damit lässt sich derselbe Effect in beiden Zuständen vorführen,
// ohne Code umzuschreiben.
//
// Beobachtbar sind drei Dinge:
//   - beim Mounten im Entwicklungsmodus: setup, cleanup, setup
//     (StrictMode mountet, räumt auf und mountet erneut - genau um zu
//     zeigen, ob die Aufräumfunktion ihre Arbeit tut)
//   - bei jeder Änderung der Abhängigkeiten: erst cleanup, dann setup
//   - ohne Aufräumfunktion: kein cleanup, die alten Timer laufen weiter
//     und die Zahl "aktive Timer" steigt
//
// activeIntervals und tickTotal stehen als Modulvariablen da, weil sie das
// Aushängen der Komponente überleben müssen - genau das ist ja der Punkt:
// die Timer laufen weiter, auch wenn die Ansicht längst weg ist.

import { useEffect, useState } from "react";

let activeIntervals = 0;
let tickTotal = 0;

export function CleanupProbe() {
  const [withCleanup, setWithCleanup] = useState(true);
  const [speed, setSpeed] = useState(1000);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    activeIntervals += 1;

    const id = window.setInterval(() => {
      tickTotal += 1;
      setTicks((current) => current + 1);
      console.log("[Demo 3] tick", tickTotal, "- aktive Timer:", activeIntervals);
    }, speed);

    console.log("[Demo 3] setup   - aktive Timer:", activeIntervals, "| Intervall:", speed, "ms");

    if (!withCleanup) {
      console.warn("[Demo 3] OHNE Aufräumfunktion - dieser Timer wird nie gestoppt");
      return;
    }

    return () => {
      window.clearInterval(id);
      activeIntervals -= 1;
      console.log("[Demo 3] cleanup - aktive Timer:", activeIntervals);
    };
  }, [withCleanup, speed]);

  const leaked = activeIntervals - 1;

  return (
    <div className="cleanup-probe">
      <strong>Demo 3 &mdash; Aufräumfunktion (nur Entwicklungsmodus)</strong>
      <div>
        Aktive Timer:{" "}
        <code className={leaked > 0 ? "probe-bad" : "probe-good"}>{activeIntervals}</code> &middot;
        Ticks seit dem Laden: <code>{ticks}</code> &middot; Intervall: <code>{speed} ms</code>
      </div>
      <div className="probe-hint">
        Soll 1 sein. Jede Zahl darüber ist ein Timer, den niemand mehr stoppen kann - nur ein
        Neuladen der Seite beendet ihn.
      </div>
      <label className="cleanup-switch">
        <input
          type="checkbox"
          checked={withCleanup}
          onChange={(event) => {
            setWithCleanup(event.target.checked);
          }}
        />{" "}
        Aufräumfunktion zurückgeben
      </label>
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => {
            setSpeed((current) => (current === 1000 ? 500 : 1000));
          }}
        >
          Abhängigkeit ändern (Intervall {speed === 1000 ? "500" : "1000"} ms)
        </button>
      </div>
    </div>
  );
}
