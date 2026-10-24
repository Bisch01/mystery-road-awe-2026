// WEGWERF-BEISPIEL für Exercise 4, Demo 4.
// Zeigt den Unterschied zwischen key={index} und key={person.id}.
// Diese Datei wird NICHT committet – sie ist das einzige Stück Code in
// dieser Übung, das useState benutzt.

import { useState } from "react";

interface DemoPerson {
  id: string;
  name: string;
}

const PEOPLE: DemoPerson[] = [
  { id: "nova-byte", name: "Nova Byte" },
  { id: "patch-vector", name: "Patch Vector" },
  { id: "kernel-colt", name: "Kernel Colt" },
  { id: "refactor-rex", name: "Refactor Rex" },
];

function DemoRow({ person }: { person: DemoPerson }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "8px 0" }}>
      <span style={{ width: 130, fontSize: "0.9rem" }}>{person.name}</span>
      <input placeholder="Notiz hier eintippen" style={{ flex: 1, padding: "6px 8px" }} />
    </div>
  );
}

export function KeyDemo() {
  const [people, setPeople] = useState(PEOPLE);

  return (
    <div style={{ border: "2px dashed #b3261e", padding: 16, margin: "24px 0" }}>
      <h3>
        Wegwerf-Demo: key={"{index}"} vs. key={"{person.id}"}
      </h3>
      <p>
        In beide <strong>obersten</strong> Zeilen etwas eintippen, dann den Knopf drücken.
      </p>

      <button
        type="button"
        onClick={() => {
          setPeople((current) => [...current].reverse());
        }}
      >
        Reihenfolge umkehren
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
        <div>
          <h4 style={{ color: "#b3261e" }}>key={"{index}"} &ndash; falsch</h4>
          {people.map((person, index) => (
            <DemoRow key={index} person={person} />
          ))}
        </div>

        <div>
          <h4 style={{ color: "#1b7f4b" }}>key={"{person.id}"} &ndash; richtig</h4>
          {people.map((person) => (
            <DemoRow key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
}
