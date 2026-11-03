// Beweis-Panel für unveränderliche Updates (Exercise 5, Demo 3).
//
// NUR im Entwicklungsmodus sichtbar: EvidencePage rendert diese Komponente
// hinter import.meta.env.DEV, sie landet also nicht im Produktions-Bundle.
//
// Sie zeigt drei Dinge gleichzeitig:
//   1. das Array VOR dem letzten Umschalten
//   2. das Array danach
//   3. ob beide dasselbe Objekt sind (Object.is)
//
// Bei einem unveränderlichen Update ist die Antwort auf 3 immer "nein" und
// das alte Array behält seinen Inhalt. Bei einer Mutation wäre es dasselbe
// Objekt und beide Zeilen wären identisch – genau daran erkennt man den
// Unterschied, den man auf dem Bildschirm sonst nicht sieht.

import type { EvidenceId } from "../../../../types.js";

interface BookmarkStateProbeProps {
  previous: EvidenceId[];
  current: EvidenceId[];
  /** Absichtlich mutierende Variante – nur zum Vorführen. */
  onMutatingToggle: () => void;
}

function show(ids: EvidenceId[]): string {
  return ids.length === 0 ? "[]" : `[${ids.join(", ")}]`;
}

export function BookmarkStateProbe({
  previous,
  current,
  onMutatingToggle,
}: BookmarkStateProbeProps) {
  // Object.is ist genau der Vergleich, den React selbst anstellt, um zu
  // entscheiden, ob sich der Zustand geändert hat.
  const sameObject = Object.is(previous, current);

  return (
    <div className="state-probe">
      <strong>Demo 3 &mdash; Zustandssonde (nur Entwicklungsmodus)</strong>
      <div>
        vorher: <code>{show(previous)}</code> &middot; Länge {previous.length}
      </div>
      <div>
        jetzt: <code>{show(current)}</code> &middot; Länge {current.length}
      </div>
      <div>
        <code>Object.is(vorher, jetzt)</code> ={" "}
        <strong className={sameObject ? "probe-bad" : "probe-good"}>
          {sameObject ? "true \u2014 MUTIERT" : "false \u2014 neues Array"}
        </strong>
      </div>
      <button type="button" className="btn btn-secondary btn-small" onClick={onMutatingToggle}>
        Mutierend umschalten (kaputte Variante)
      </button>
    </div>
  );
}
