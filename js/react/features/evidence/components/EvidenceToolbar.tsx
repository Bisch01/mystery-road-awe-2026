// Werkzeugleiste der Beweisliste (Exercise 5, Demo 1 bis 9).
//
// Demo 7: alle sieben Bedienelemente sind verdrahtet. Die Leiste bekommt den
// kompletten Filterzustand als EIN Objekt und meldet Änderungen über drei
// Callbacks zurück – einen pro Vorgang des Reducers.
//
// Vorher brauchte sie dafür vier Props (searchTerm, onSearchChange, sortOrder,
// onSortChange) und hätte für die fünf restlichen Felder zehn weitere
// gebraucht. Jetzt sind es vier, unabhängig von der Anzahl der Filter.
//
// Demo 9: drei Props weniger - die Daten für die Auswahllisten kommen direkt
// aus dem CaseData-Context statt über EvidencePage.
//
// Die ids tragen ein ev-Präfix, damit sie nicht mit den gleichnamigen
// Elementen der Vanilla-Variante in index.html kollidieren.

import { SORT_LABELS, SORT_ORDERS } from "../evidenceSort.js";
import { useCaseData } from "../../../shared/data/useCaseData.js";
import type { EvidenceFilterState, FilterField } from "../evidenceFilters.js";

interface EvidenceToolbarProps {
  filters: EvidenceFilterState;
  activeCount: number;
  onFilterChange: (field: FilterField, value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export function EvidenceToolbar({
  filters,
  activeCount,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: EvidenceToolbarProps) {
  // Demo 9: die Daten für die Auswahllisten kommen direkt aus dem
  // CaseData-Context. Vorher wurden evidence, people und locations von
  // EvidencePage hierher gereicht, obwohl sie dort nur durchgegeben wurden.
  const { evidence, people, locations } = useCaseData();

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
          value={filters.search}
          onChange={(event) => {
            onFilterChange("search", event.target.value);
          }}
        />

        <label htmlFor="evType" className="visually-hidden">
          Filter by type
        </label>
        <select
          id="evType"
          value={filters.type}
          onChange={(event) => {
            onFilterChange("type", event.target.value);
          }}
        >
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
        <select
          id="evPerson"
          value={filters.personId}
          onChange={(event) => {
            onFilterChange("personId", event.target.value);
          }}
        >
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
        <select
          id="evLocation"
          value={filters.locationId}
          onChange={(event) => {
            onFilterChange("locationId", event.target.value);
          }}
        >
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
        <select
          id="evStatus"
          value={filters.status}
          onChange={(event) => {
            onFilterChange("status", event.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="evRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select
          id="evRelevance"
          value={filters.relevance}
          onChange={(event) => {
            onFilterChange("relevance", event.target.value);
          }}
        >
          <option value="">All relevance</option>
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>

        <label htmlFor="evSort" className="visually-hidden">
          Sort evidence
        </label>
        {/* Eigener Vorgang (SET_SORT), weil die Sortierung kein Filter ist:
            CLEAR_FILTERS lässt sie absichtlich stehen. */}
        <select
          id="evSort"
          value={filters.sortOrder}
          onChange={(event) => {
            onSortChange(event.target.value);
          }}
        >
          {SORT_ORDERS.map((order) => (
            <option key={order} value={order}>
              {SORT_LABELS[order]}
            </option>
          ))}
        </select>

        {/* Ein Klick, ein Vorgang, sechs Werte zurückgesetzt. Vanilla brauchte
            dafür sechs Zuweisungen an DOM-Elemente. */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={activeCount === 0}
          onClick={onClearFilters}
        >
          Clear filters{activeCount > 0 ? ` (${String(activeCount)})` : ""}
        </button>
      </div>
    </div>
  );
}
