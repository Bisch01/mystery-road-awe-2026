// Investigation Timeline (Exercise 4, Demo 10).
//
// Feature-Komponente: holt die Daten, liest den Query-Parameter ?person aus
// der Adresse, filtert und sortiert, und reicht fertige Arrays an die
// Darstellung weiter.
//
// Kein useState für den Filter: der Zustand steht in der URL. Die Komponente
// liest ihn bei jedem Rendern neu, es gibt also keine zweite Kopie, die
// auseinanderlaufen könnte.

import { Link, useSearchParams } from "react-router";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { TimelineList } from "./components/TimelineList.js";
import { TimelineToolbar } from "./components/TimelineToolbar.js";
import { PARAM_PERSON, ROUTE_PATHS } from "../../app/routes.js";

export function TimelinePage() {
  // useSearchParams() liefert eine URLSearchParams-Instanz. get() gibt
  // string | null zurück: null, wenn der Parameter fehlt.
  const [searchParams] = useSearchParams();
  const personParam = searchParams.get(PARAM_PERSON) ?? "";

  const { status, timeline, locations, people } = useCaseData();

  if (status === "loading") {
    return <p className="stub-note">Loading case file&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // Unbekannte Kennung: der Filter wird verworfen statt eine leere Liste zu
  // zeigen. Anders als bei /team/people/:personId ist ?person keine Identität,
  // sondern eine Einstellung – eine unbrauchbare Einstellung wird ignoriert.
  const filterPerson = people.find((person) => person.id === personParam);
  const paramIsUnknown = personParam !== "" && filterPerson === undefined;

  const visibleEvents = filterPerson
    ? timeline.filter((event) => event.personIds.includes(filterPerson.id))
    : timeline;

  // Kopie vor dem Sortieren: sort() verändert das Array an Ort und Stelle
  // (Skript Kap. 17.4).
  const eventsByTime = [...visibleEvents].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  // Abgeleitete Werte, keine zusätzlichen Zustände (Skript Kap. 17.5).
  const eventTypes = [...new Set(timeline.map((event) => event.type))].sort();

  return (
    <section>
      <h2>Investigation Timeline</h2>

      <TimelineToolbar
        people={people}
        locations={locations}
        eventTypes={eventTypes}
        selectedPersonId={filterPerson ? filterPerson.id : ""}
      />

      {paramIsUnknown && (
        <p className="filter-note">
          Unbekannte Personenkennung <code>{personParam}</code> in der Adresse &ndash; Filter
          ignoriert.
        </p>
      )}

      {filterPerson && (
        <p className="filter-note">
          Gefiltert nach <strong>{filterPerson.name}</strong>: {eventsByTime.length} von{" "}
          {timeline.length} Ereignissen. <Link to={ROUTE_PATHS.timeline}>Filter entfernen</Link>
        </p>
      )}

      <TimelineList events={eventsByTime} locations={locations} people={people} />
    </section>
  );
}
