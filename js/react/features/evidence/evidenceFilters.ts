// Filterzustand der Beweisliste (Exercise 5, Demo 7).
//
// Sieben zusammengehörige Werte, die gemeinsam entscheiden, was die Liste
// zeigt. Vorher lagen Suchbegriff und Sortierreihenfolge als zwei einzelne
// useState in EvidencePage, die fünf Auswahlfelder waren noch gar nicht
// verdrahtet. Jetzt liegt alles in EINEM Zustandsobjekt, das über drei
// benannte Vorgänge verändert wird.
//
// Warum ein Reducer und nicht ein useState mit Objekt (wie beim
// Hypothesen-Formular in Demo 2): dort gibt es nur eine Art von Änderung
// ("Feld X hat jetzt Wert Y"). Hier gibt es drei verschiedene Vorgänge, und
// einer davon – CLEAR_FILTERS – betrifft sechs Werte gleichzeitig und muss
// einen davon ausdrücklich NICHT anfassen.

import { DEFAULT_SORT_ORDER } from "./evidenceSort.js";
import { evidenceMentionsPerson } from "../../../utils.js";
import type { EvidenceSortOrder } from "./evidenceSort.js";
import type { Evidence, Person } from "../../../types.js";

/** Die Felder, die über SET_FILTER gesetzt werden. Leerer String = inaktiv. */
export type FilterField = "search" | "type" | "personId" | "locationId" | "status" | "relevance";

export interface EvidenceFilterState {
  search: string;
  type: string;
  personId: string;
  locationId: string;
  status: string;
  relevance: string;
  sortOrder: EvidenceSortOrder;
}

export const INITIAL_FILTERS: EvidenceFilterState = {
  search: "",
  type: "",
  personId: "",
  locationId: "",
  status: "",
  relevance: "",
  sortOrder: DEFAULT_SORT_ORDER,
};

// Drei Vorgänge, als Union typisiert. Der Compiler erzwingt, dass zu jedem
// Vorgang genau die passenden Zusatzangaben mitkommen: SET_FILTER braucht
// field und value, SET_SORT braucht order, CLEAR_FILTERS braucht nichts.
export type EvidenceFilterAction =
  | { type: "SET_FILTER"; field: FilterField; value: string }
  | { type: "SET_SORT"; order: EvidenceSortOrder }
  | { type: "CLEAR_FILTERS" };

export function evidenceFilterReducer(
  state: EvidenceFilterState,
  action: EvidenceFilterAction
): EvidenceFilterState {
  switch (action.type) {
    case "SET_FILTER":
      // Unveränderliches Update (Demo 3): neues Objekt, ein Feld überschrieben.
      return { ...state, [action.field]: action.value };

    case "SET_SORT":
      return { ...state, sortOrder: action.order };

    case "CLEAR_FILTERS":
      // Alle sechs Filter zurück auf den Ausgangswert, die Sortierreihenfolge
      // aber ABSICHTLICH behalten – sie ist kein Filter, sondern eine
      // Darstellungsentscheidung. Genauso verhält sich clearFilters() in
      // js/views/evidence.ts, nur musste man das dort aus sechs einzelnen
      // Zuweisungen herauslesen.
      return { ...INITIAL_FILTERS, sortOrder: state.sortOrder };
  }
}

/** Wie viele der sechs Filter gerade gesetzt sind. Abgeleitet, kein Zustand. */
export function activeFilterCount(state: EvidenceFilterState): number {
  const values = [
    state.search.trim(),
    state.type,
    state.personId,
    state.locationId,
    state.status,
    state.relevance,
  ];
  return values.filter((value) => value !== "").length;
}

/**
 * Wendet alle sechs Filter auf die Liste an und gibt ein NEUES Array zurück.
 *
 * Ersetzt getFilteredEvidence() aus js/views/evidence.ts. Dort wurden die
 * sechs Werte am Anfang der Funktion einzeln mit getInput()/getSelect() aus
 * dem DOM gelesen; hier kommen sie als ein Argument herein.
 */
export function filterEvidence(
  items: Evidence[],
  filters: EvidenceFilterState,
  people: Person[]
): Evidence[] {
  const term = filters.search.toLowerCase().trim();
  // Einmal vor der Schleife suchen statt pro Beweisstück.
  const filterPerson = people.find((person) => person.id === filters.personId);

  return items.filter((item) => {
    if (term !== "") {
      const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (filters.type !== "" && item.type.toLowerCase() !== filters.type) return false;
    if (filters.personId !== "") {
      // evidenceMentionsPerson prüft Id UND Name, weil evidence.json beides
      // enthält. Ist die Kennung unbekannt, bleibt der Vergleich auf die Id.
      const mentions = filterPerson
        ? evidenceMentionsPerson(item, filterPerson)
        : item.personIds.includes(filters.personId);
      if (!mentions) return false;
    }
    if (filters.locationId !== "" && !item.locationIds.includes(filters.locationId)) return false;
    if (filters.status !== "" && item.status !== filters.status) return false;
    if (filters.relevance !== "" && item.relevance !== filters.relevance) return false;
    return true;
  });
}
