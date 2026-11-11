// Evidence Catalogue (Exercise 5, Demo 1 bis 9; Exercise 6, Demo 1 bis 3 und 6).
//
// Feature-Komponente: besitzt den Zustand DIESER Ansicht und leitet die
// sichtbare Liste daraus ab.
//
// Demo 7: die sieben Filterwerte liegen nicht mehr als einzelne useState hier,
// sondern in einem useReducer. Der Reducer selbst steht in evidenceFilters.ts,
// diese Komponente schickt nur Vorgänge hin.
//
// Demo 5: Die Lesezeichen besitzt sie NICHT mehr – der Zustand wanderte zum
// niedrigsten gemeinsamen Vorfahren.
//
// Demo 6: Die Notizen gehören AppShell. Diese Seite reicht nur saveNote an
// die Detailansicht weiter.
//
// Demo 8: Die Lesezeichen kommen jetzt aus dem Bookmark-Context. Sie werden
// hier nur noch für die Hinweiszeile und die Zustandssonde gebraucht – die
// Liste und die Karten holen sie sich selbst.
//
// Exercise 6: drei Sonden, alle nur im Entwicklungsmodus. RenderPurityProbe
// (Demo 1) führt Seiteneffekte im Render vor, EffectDepsProbe (Demo 2) die
// Formen der Abhängigkeitsliste, CleanupProbe (Demo 3) einen Effect mit und
// ohne Aufräumfunktion.
//
// Exercise 6, Demo 6: Lade- und Fehlerzustand liegen in AppShell, hier
// bleiben die beiden Leerzustände - siehe hasNoData / hasNoMatches.
//
// Zwei der drei migrierten Handler (Demo 1) liegen hier:
//   - onChange am Suchfeld  (handleFilterChange)
//   - onClick am Stern      (liegt seit Demo 8 in BookmarkButton selbst)
// Der dritte (onSubmit) liegt in features/workspace/components/HypothesisForm.

import { useReducer, useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { useBookmarks } from "../../shared/data/BookmarkContext.js";
import { EvidenceToolbar } from "./components/EvidenceToolbar.js";
import { EvidenceList } from "./components/EvidenceList.js";
import { BookmarkStateProbe } from "./components/BookmarkStateProbe.js";
import { RenderPurityProbe } from "./components/RenderPurityProbe.js";
import { EffectDepsProbe } from "./components/EffectDepsProbe.js";
import { CleanupProbe } from "./components/CleanupProbe.js";
import { EvidenceDetail } from "./components/EvidenceDetail.js";
import { EmptyState } from "../../shared/components/AsyncState.js";
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
  const { evidence, people } = useCaseData();

  // Zwei Transportwege nebeneinander: Lesezeichen über Context,
  // Notizen über den Outlet-Context von AppShell (Demo 8).
  const { bookmarkIds, previousBookmarkIds, mutatingToggleBookmark } = useBookmarks();
  const { notes, saveNote } = useAppOutlet();

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

  // ABGELEITETE WERTE (Demo 4): die sichtbare Liste ist KEIN Zustand. Sie
  // entsteht bei jedem Rendern neu aus evidence + filters.
  //
  // KOPIEREN VOR DEM SORTIEREN (Demo 3): filterEvidence() gibt ein NEUES
  // Array zurück, und sortEvidence() kopiert zusätzlich selbst. Ein .sort()
  // direkt auf evidence wäre der Sortier-Bug aus Exercise 1, Demo 2.
  const filtered = filterEvidence(evidence, filters, people);
  const visibleEvidence = sortEvidence(filtered, filters.sortOrder);
  const activeCount = activeFilterCount(filters);

  // Exercise 6, Demo 6: ZWEI verschiedene Arten von "leer", die bisher beide
  // dazu geführt hätten, dass einfach nichts dasteht.
  //
  //   hasNoData       Der Server hat geantwortet, aber die Fallakte enthält
  //                   gar keine Beweisstücke (?empty=1 im Backend).
  //   hasNoMatches    Es gibt Beweisstücke, aber kein einziges passt zu den
  //                   gesetzten Filtern.
  //
  // Der Unterschied ist für den Benutzer wesentlich: im ersten Fall kann er
  // nichts tun, im zweiten muss er nur den Filter löschen.
  const hasNoData = evidence.length === 0;
  const hasNoMatches = !hasNoData && visibleEvidence.length === 0;

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
      />

      <p className="filter-note">
        {visibleEvidence.length} von {evidence.length} Beweisstücken &middot; {bookmarkIds.length}{" "}
        mit Lesezeichen &middot; {activeCount} von 6 Filtern aktiv
      </p>

      {import.meta.env.DEV && (
        <RenderPurityProbe visibleCount={visibleEvidence.length} totalCount={evidence.length} />
      )}

      {import.meta.env.DEV && <EffectDepsProbe />}

      {import.meta.env.DEV && <CleanupProbe />}

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
          note={notes[selectedEvidence.id] ?? ""}
          onSaveNote={saveNote}
          onClose={() => {
            setSelectedId(null);
          }}
        />
      )}

      {hasNoData && (
        <EmptyState
          title="Keine Beweisstücke in der Fallakte"
          hint="Der Server hat erfolgreich geantwortet, die Liste ist aber leer. Das ist kein Fehler - es gibt schlicht nichts zu zeigen."
        />
      )}

      {hasNoMatches && (
        <EmptyState
          title="Kein Treffer"
          hint={`Keines der ${String(evidence.length)} Beweisstücke passt zu den gesetzten Filtern.`}
        >
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleClearFilters}
          >
            Filter zurücksetzen
          </button>
        </EmptyState>
      )}

      {!hasNoData && !hasNoMatches && (
        <EvidenceList items={visibleEvidence} onSelect={handleSelect} />
      )}
    </section>
  );
}
