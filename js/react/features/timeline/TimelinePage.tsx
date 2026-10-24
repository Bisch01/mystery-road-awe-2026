// Investigation Timeline (Exercise 4).
//
// Feature-Komponente: holt die Daten, sortiert sie und reicht fertige
// Arrays an die Darstellung weiter.
//
// Die Filter-Leiste folgt in Demo 10 – dort wird der Anfangszustand aus
// einem Query-Parameter gelesen. Bis dahin zeigt die View alle Ereignisse.

import { useCaseData } from "../../data/useCaseData.js";
import { TimelineList } from "./components/TimelineList.js";

export function TimelinePage() {
  const { status, timeline, locations, people } = useCaseData();

  if (status === "loading") {
    return <p className="stub-note">Loading case file&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // Kopie vor dem Sortieren: sort() verändert das Array an Ort und Stelle
  // (Skript Kap. 17.4).
  const eventsByTime = [...timeline].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  return (
    <section>
      <h2>Investigation Timeline</h2>
      <TimelineList events={eventsByTime} locations={locations} people={people} />
    </section>
  );
}
