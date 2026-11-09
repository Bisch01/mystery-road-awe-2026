// Sonde für Abhängigkeitslisten (Exercise 6, Demo 2).
//
// NUR im Entwicklungsmodus sichtbar: EvidencePage rendert sie hinter
// import.meta.env.DEV.
//
// Vier Effects nebeneinander, die sonst nichts tun als mitzählen und in die
// Konsole schreiben. Zwei Knöpfe treiben sie an:
//   "tick"  loest nur ein Neu-Rendern aus, aendert keine Abhaengigkeit
//   "lever" aendert eine echte Abhaengigkeit
//
// Der vierte Effect ist die Falle: objectDep ist eine Abhängigkeitsliste mit
// einem Objekt darin, und dieses Objekt entsteht bei JEDEM Render neu.
// React vergleicht mit Object.is, also mit der Identität - ein neues Objekt
// ist immer "anders". Der Effect läuft deshalb trotz Liste jedes Mal, genau
// wie der ganz ohne Liste.

import { useEffect, useState } from "react";

// Modulvariablen statt useState: ein Zähler, der im Effect hochgezählt und
// per setState angezeigt würde, löst beim Effect ohne Abhängigkeitsliste
// eine Endlosschleife aus (setState -> Render -> Commit -> Effect -> ...).
let runsNoArray = 0;
let runsEmpty = 0;
let runsLever = 0;
let runsObject = 0;

export function EffectDepsProbe() {
  const [tick, setTick] = useState(0);
  const [lever, setLever] = useState(0);

  // Bei jedem Render ein NEUES Objekt - auch wenn lever gleich bleibt.
  const objectDep = { lever };

  // 1) ohne Array: nach jedem Commit dieser Komponente.
  useEffect(() => {
    runsNoArray += 1;
    console.log("[Demo 2] ohne Array  ->", runsNoArray);
  });

  // 2) leeres Array: einmal pro Mount. Im Entwicklungsmodus zweimal,
  //    weil StrictMode mountet, aufräumt und erneut mountet.
  useEffect(() => {
    runsEmpty += 1;
    console.log("[Demo 2] []          ->", runsEmpty);
  }, []);

  // 3) echte Abhängigkeit: nur wenn sich lever gegenüber dem letzten
  //    Render unterscheidet.
  useEffect(() => {
    runsLever += 1;
    console.log("[Demo 2] [lever]     ->", runsLever);
  }, [lever]);

  // 4) Abhängigkeitsliste mit einem bei jedem Render neu erzeugten Objekt.
  useEffect(() => {
    runsObject += 1;
    console.log("[Demo 2] [objectDep] ->", runsObject);
  }, [objectDep]);

  return (
    <div className="deps-probe">
      <strong>Demo 2 &mdash; Abhängigkeitslisten (nur Entwicklungsmodus)</strong>
      <table className="deps-table">
        <thead>
          <tr>
            <th>Effect</th>
            <th>läuft</th>
            <th>bisher</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>useEffect(fn)</code>
            </td>
            <td>nach jedem Commit</td>
            <td>
              <code className="probe-bad">{runsNoArray}</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>useEffect(fn, [])</code>
            </td>
            <td>nur beim Mounten</td>
            <td>
              <code className="probe-good">{runsEmpty}</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>useEffect(fn, [lever])</code>
            </td>
            <td>wenn sich lever ändert</td>
            <td>
              <code className="probe-good">{runsLever}</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>useEffect(fn, [objectDep])</code>
            </td>
            <td>trotz Liste: jedes Mal</td>
            <td>
              <code className="probe-bad">{runsObject}</code>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="probe-hint">
        tick = {tick} &middot; lever = {lever}
      </div>
      <div className="probe-hint">
        Die Tabelle zeigt den Stand <em>vor</em> diesem Render &mdash; ein Effect läuft nach dem
        Rendern und kann sich deshalb im selben Render nicht selbst anzeigen. Lückenlos beobachtbar
        ist das in der Konsole, Filter <code>[Demo 2]</code>.
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => {
          setTick((t) => t + 1);
        }}
      >
        Neu rendern (tick)
      </button>{" "}
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => {
          setLever((l) => l + 1);
        }}
      >
        Abhängigkeit ändern (lever)
      </button>
    </div>
  );
}
