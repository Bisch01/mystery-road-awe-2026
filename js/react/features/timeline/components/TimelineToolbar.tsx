// Filter-Leiste der Timeline (Exercise 4, Demo 10).
//
// Die Bedienelemente sind ABSICHTLICH disabled. Exercise 4 verlangt, den
// Anfangszustand aus der Adresse zu lesen – nicht, Interaktion zu verdrahten.
// Sie zeigen damit genau den Zustand, den die URL beschreibt, und niemand
// kann eine Auswahl treffen, die wirkungslos bleibt. Die Verdrahtung folgt in
// Exercise 5.
//
// Die ids tragen ein tl-Präfix, damit sie nicht mit den gleichnamigen
// Elementen der Vanilla-Variante in index.html kollidieren.

import type { Location, Person } from "../../../../types.js";

interface TimelineToolbarProps {
  people: Person[];
  locations: Location[];
  eventTypes: string[];
  /** Leerer String = kein Personenfilter aktiv. */
  selectedPersonId: string;
}

export function TimelineToolbar({
  people,
  locations,
  eventTypes,
  selectedPersonId,
}: TimelineToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="tlOrder" className="visually-hidden">
          Order
        </label>
        <select id="tlOrder" value="asc" disabled>
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>

        <label htmlFor="tlPerson" className="visually-hidden">
          Filter by person
        </label>
        <select id="tlPerson" value={selectedPersonId} disabled>
          <option value="">All people</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <label htmlFor="tlLocation" className="visually-hidden">
          Filter by location
        </label>
        <select id="tlLocation" value="" disabled>
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.id} - {location.name}
            </option>
          ))}
        </select>

        <label htmlFor="tlType" className="visually-hidden">
          Filter by event type
        </label>
        <select id="tlType" value="" disabled>
          <option value="">All event types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
