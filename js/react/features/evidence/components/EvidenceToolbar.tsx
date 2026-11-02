// Werkzeugleiste der Beweisliste (Exercise 5, Demo 1 und 2).
//
// Das Suchfeld ist kontrolliert: value + onChange, der Zustand liegt in
// EvidencePage. Der Knopf "Clear search" ändert nur diesen Zustand – das
// Eingabefeld folgt, weil sein value daraus kommt (Demo 2).
//
// Die sechs Auswahlfelder sind noch disabled: sie werden in Demo 7 gemeinsam
// über einen useReducer verdrahtet, weil sie zusammen einen Zustand bilden.
// Ein disabled Feld zeigt den Zustand an, ohne eine Auswahl anzubieten, die
// wirkungslos bliebe.
//
// Die ids tragen ein ev-Präfix, damit sie nicht mit den gleichnamigen
// Elementen der Vanilla-Variante in index.html kollidieren.

import type { Evidence, Location, Person } from "../../../../types.js";

interface EvidenceToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
}

export function EvidenceToolbar({
  searchTerm,
  onSearchChange,
  evidence,
  people,
  locations,
}: EvidenceToolbarProps) {
  // Abgeleiteter Wert, kein Zustand: die Typliste steht in den Daten.
  // Ersetzt populateEvidenceDropdowns(), das die <option> per innerHTML baute.
  const types = [...new Set(evidence.map((item) => item.type.toLowerCase()))].sort();

  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="evSearch" className="visually-hidden">
          Search evidence
        </label>
        <input
          type="text"
          id="evSearch"
          placeholder="Search evidence by title, summary, or tag&hellip;"
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
        />
        {/* Beweis dafür, dass das Feld kontrolliert ist: dieser Knopf steht
            außerhalb des Eingabefelds und leert es, indem er nur den Zustand
            ändert. Das DOM wird nicht angefasst (Demo 2). */}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          disabled={searchTerm === ""}
          onClick={() => {
            onSearchChange("");
          }}
        >
          Clear search
        </button>

        <label htmlFor="evType" className="visually-hidden">
          Filter by type
        </label>
        <select id="evType" value="" disabled>
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label htmlFor="evPerson" className="visually-hidden">
          Filter by person
        </label>
        <select id="evPerson" value="" disabled>
          <option value="">All people</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <label htmlFor="evLocation" className="visually-hidden">
          Filter by location
        </label>
        <select id="evLocation" value="" disabled>
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.id} - {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-row">
        <label htmlFor="evStatus" className="visually-hidden">
          Filter by status
        </label>
        <select id="evStatus" value="" disabled>
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="evRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select id="evRelevance" value="" disabled>
          <option value="">All relevance</option>
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>

        <label htmlFor="evSort" className="visually-hidden">
          Sort evidence
        </label>
        <select id="evSort" value="date-desc" disabled>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="title-asc">Title (A&ndash;Z)</option>
          <option value="title-desc">Title (Z&ndash;A)</option>
        </select>

        <button type="button" className="btn btn-secondary" disabled>
          Clear filters
        </button>
      </div>
    </div>
  );
}
