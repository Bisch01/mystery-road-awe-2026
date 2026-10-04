// Erste React-Komponente der App. Noch ohne State und ohne Props –
// sie beweist nur, dass JSX durch Vite kompiliert und gerendert wird.
// Ab Demo 9 wächst hier die migrierte Shell heraus.

const sampleEvidence = {
  id: "E14",
  title: "Production calibration-service checksum",
  type: "system-log",
};

export function App() {
  return (
    <div className="react-shell">
      <h1>Project ReMotion – React</h1>
      <p>
        Diese Ansicht wird von React gerendert. Die Vanilla-App läuft unverändert weiter – einfach{" "}
        <code>?react=1</code> aus der URL entfernen.
      </p>

      <article className="evidence-card">
        <h3>
          {sampleEvidence.id}: {sampleEvidence.title}
        </h3>
        <p className="evidence-meta">Typ: {sampleEvidence.type}</p>
      </article>
    </div>
  );
}
