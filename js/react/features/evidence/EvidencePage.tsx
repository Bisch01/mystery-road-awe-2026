// Evidence Catalogue (Exercise 5, Demo 1 bis 7).
//
// Feature-Komponente: besitzt den Zustand DIESER Ansicht und leitet die
// sichtbare Liste daraus ab.
//
// Demo 7: die sieben Filterwerte liegen nicht mehr als einzelne useState hier,
// sondern in einem useReducer. Der Reducer selbst steht in evidenceFilters.ts,
// diese Komponente schickt nur Vorgänge hin.
//
// Demo 5: Die Lesezeichen besitzt sie NICHT mehr. Sie kommen samt der
// Umschaltfunktion aus dem Outlet-Context von AppShell, dem niedrigsten
// gemeinsamen Vorfahren von Dashboard, Evidence und Workspace.
//
// Demo 6: Die Notizen gehören ebenfalls AppShell. Diese Seite reicht nur
// saveNote an die Detailansicht weiter.
//
// Zwei der drei migrierten Handler (Demo 1) liegen hier:
//   - onChange am Suchfeld  (handleFilterChange)
//   - onClick am Stern      (toggleBookmark aus dem Context)
// Der dritte (onSubmit) liegt in features/workspace/components/HypothesisForm.

import { useReducer, useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { EvidenceToolbar } from "./components/EvidenceToolbar.js";
import { EvidenceList } from "./components/EvidenceList.js";
import { BookmarkStateProbe } from "./components/BookmarkStateProbe.js";
import { EvidenceDetail } from "./components/EvidenceDetail.js";
import { isEvidenceSortOrder, sortEvidence } from "./evidenceSort.js";
import {
  INITIAL_FILTERS,
  activeFilterCount,
  evidenceFilterReducer,
  filterEvidence,
} from "./evidenceFilters.js";
import type { FilterField } from "./evidenceFilters.js";
import type { EvidenceId } from "../../../types.js";

export function EvidencePage() {
  const { status, evidence, people, locations } = useCaseData();

  // Aus dem Outlet-Context: der Zustand gehört AppShell, nicht dieser Seite.
  const {
    bookmarkIds,
    previousBookmarkIds,
    toggleBookmark,
    mutatingToggleBookmark,
    notes,
    saveNote,
  } = useAppOutlet();

  // ZUSTAND DIESER ANSICHT (Demo 4: Werte, die der Nutzer setzt und die sich
  // aus nichts berechnen lassen). Sie bleiben hier, weil sie nur hier
  // gebraucht werden – nicht alles muss nach oben wandern.
  //
  // Demo 7: ein useReducer für die sieben Filterwerte statt sieben useState.
  const [filters, dispatch] = useReducer(evidenceFilterReducer, INITIAL_FILTERS);
  // Demo 6: welches Beweisstück aufgeklappt ist. Bleibt lokal – kein anderes
  // Feature braucht diese Information.
  const [selectedId, setSelectedId] = useState<EvidenceId | null>(null);

  function handleFilterChange(field: FilterField, value: string): void {
    dispatch({ type: "SET_FILTER", field, value });
  }

  function handleSortChange(value: string): void {
    // Ein <select> liefert immer einen String. Der Typwächter macht daraus
    // einen EvidenceSortOrder – oder verwirft den Wert.
    if (isEvidenceSortOrder(value)) dispatch({ type: "SET_SORT", order: value });
  }

  function handleClearFilters(): void {
    dispatch({ type: "CLEAR_FILTERS" });
  }

  function handleSelect(evidenceId: EvidenceId): void {
    // Nochmal derselbe Eintrag: zuklappen.
    setSelectedId((current) => (current === evidenceId ? null : evidenceId));
  }

  if (status === "loading") {
    return <p className="stub-note">Loading evidence&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // ABGELEITETE WERTE (Demo 4): die sichtbare Liste ist KEIN Zustand. Sie
  // entsteht bei jedem Rendern neu aus evidence + filters.
  //
  // KOPIEREN VOR DEM SORTIEREN (Demo 3): filterEvidence() gibt ein NEUES
  // Array zurück, und sortEvidence() kopiert zusätzlich selbst. Ein .sort()
  // direkt auf evidence wäre der Sortier-Bug aus Exercise 1, Demo 2.
  const filtered = filterEvidence(evidence, filters, people);
  const visibleEvidence = sortEvidence(filtered, filters.sortOrder);
  const activeCount = activeFilterCount(filters);

  const firstEvidence = evidence[0];
  // Abgeleitet, kein Zustand: aus der Id das Beweisstück suchen.
  const selectedEvidence = evidence.find((item) => item.id === selectedId);

  return (
    <section>
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        filters={filters}
        activeCount={activeCount}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        evidence={evidence}
        people={people}
        locations={locations}
      />

      <p className="filter-note">
        {visibleEvidence.length} von {evidence.length} Beweisstücken &middot; {bookmarkIds.length}{" "}
        mit Lesezeichen &middot; {activeCount} von 6 Filtern aktiv
      </p>

      {import.meta.env.DEV && firstEvidence && (
        <BookmarkStateProbe
          previous={previousBookmarkIds}
          current={bookmarkIds}
          onMutatingToggle={() => {
            mutatingToggleBookmark(firstEvidence.id);
          }}
        />
      )}

      {selectedEvidence && (
        // key: wechselt man auf ein anderes Beweisstück, soll der lokale
        // Notiz-Entwurf in EvidenceDetail neu beginnen und nicht den alten
        // Text behalten (Skript Kap. 16.2: key = Identität).
        <EvidenceDetail
          key={selectedEvidence.id}
          evidence={selectedEvidence}
          people={people}
          locations={locations}
          note={notes[selectedEvidence.id] ?? ""}
          isBookmarked={bookmarkIds.includes(selectedEvidence.id)}
          onSaveNote={saveNote}
          onToggleBookmark={toggleBookmark}
          onClose={() => {
            setSelectedId(null);
          }}
        />
      )}

      <EvidenceList
        items={visibleEvidence}
        bookmarkIds={bookmarkIds}
        onToggleBookmark={toggleBookmark}
        onSelect={handleSelect}
      />
    </section>
  );
}
