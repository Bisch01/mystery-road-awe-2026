// Sonde für Render-Reinheit (Exercise 6, Demo 1).
//
// NUR im Entwicklungsmodus sichtbar: EvidencePage rendert diese Komponente
// hinter import.meta.env.DEV, sie landet also nicht im Produktions-Bundle.
//
// Diese Komponente ist ABSICHTLICH unrein. Sie enthält zwei Seiteneffekte,
// die direkt im Render-Rumpf stehen – genau die zwei Fälle, die Demo 1
// verlangt:
//
//   1. renderCount += 1          verändert eine Variable AUSSERHALB der
//                                Komponente (Modul-Gültigkeitsbereich)
//   2. localStorage.getItem(...) liest bei jedem Render am React-Zustand
//                                vorbei aus der Außenwelt
//
// Beides "funktioniert scheinbar": die Zahlen stehen auf dem Bildschirm und
// sehen plausibel aus. Falsch sind sie trotzdem, und die Sonde macht das
// messbar. Zum Vergleich steht daneben ein abgeleiteter Wert, der ebenfalls
// bei jedem Render neu berechnet wird – aber kein Seiteneffekt ist, weil er
// nur aus den Props entsteht und nichts außerhalb verändert.

import { useState } from "react";

// Modul-Gültigkeitsbereich: diese beiden Variablen gehören NICHT zu einer
// Komponenteninstanz. Sie entstehen einmal beim Laden des Moduls und leben,
// bis die Seite neu geladen wird. React weiß nichts von ihnen.
let renderCount = 0;
let storageReads = 0;

interface RenderPurityProbeProps {
  visibleCount: number;
  totalCount: number;
}

export function RenderPurityProbe({ visibleCount, totalCount }: RenderPurityProbeProps) {
  // SEITENEFFEKT 1: Zuweisung an eine Variable außerhalb der Komponente.
  // Render soll eine reine Funktion sein - gleiche Props, gleiches Ergebnis,
  // keine Spuren. Diese Zeile hinterlässt eine Spur.
  renderCount += 1;

  // SEITENEFFEKT 2: Lesezugriff auf die Außenwelt mitten im Render.
  // Richtig wäre der Lazy-Initialisierer, so wie useBookmarkState es macht:
  //   useState<EvidenceId[]>(() => readBookmarks())
  // Dort läuft der Lesezugriff genau einmal, beim ersten Rendern.
  const raw = localStorage.getItem("remotion_bookmarks");
  storageReads += 1;

  const bookmarkedInStorage = raw === null ? 0 : (JSON.parse(raw) as string[]).length;

  // KEIN Seiteneffekt: ein abgeleiteter Wert. Wird ebenfalls bei jedem
  // Render neu berechnet, entsteht aber ausschließlich aus den Props und
  // verändert nichts außerhalb. Zweimaliges Rendern ändert daran nichts.
  const hiddenCount = totalCount - visibleCount;

  // Nur ein Auslöser, damit man das Neu-Rendern im Vortrag selbst
  // herbeiführen kann. Der Wert selbst wird nicht gebraucht.
  const [, setTick] = useState(0);

  return (
    <div className="purity-probe">
      <strong>Demo 1 &mdash; Render-Sonde (nur Entwicklungsmodus)</strong>

      <div>
        Renderzähler (Modulvariable, im Render hochgezählt):{" "}
        <code className="probe-bad">{renderCount}</code>
      </div>
      <div className="probe-hint">
        StrictMode ruft die Render-Funktion im Entwicklungsmodus doppelt auf &rarr; die tatsächliche
        Zahl ist die Hälfte. Beim ersten Laden steht hier 2, nicht 1.
      </div>

      <div>
        Local-Storage-Lesevorgänge im Render: <code className="probe-bad">{storageReads}</code>
        &nbsp;für <code>{bookmarkedInStorage}</code> Lesezeichen
      </div>
      <div className="probe-hint">
        Dieselbe Information wird bei jedem Render neu aus der Außenwelt geholt, obwohl sie sich
        nicht geändert hat.
      </div>

      <div>
        Abgeleiteter Wert (kein Seiteneffekt):{" "}
        <code className="probe-good">
          {hiddenCount} von {totalCount}
        </code>{" "}
        ausgeblendet
      </div>
      <div className="probe-hint">
        Wird auch bei jedem Render neu berechnet &mdash; aber nur aus den Props, ohne Wirkung nach
        außen. Deshalb ist er kein Seiteneffekt.
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => {
          setTick((tick) => tick + 1);
        }}
      >
        Neu rendern erzwingen
      </button>
    </div>
  );
}
