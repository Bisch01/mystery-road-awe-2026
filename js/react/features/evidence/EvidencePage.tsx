// Evidence Catalogue (Exercise 5, Demo 1 bis 5).
//
// Feature-Komponente: besitzt den Zustand DIESER Ansicht (Suchbegriff und
// Sortierreihenfolge), leitet die sichtbare Liste daraus ab und reicht
// fertige Werte nach unten.
//
// Demo 5: Die Lesezeichen besitzt sie NICHT mehr. Sie kommen samt der
// Umschaltfunktion aus dem Outlet-Context von AppShell, dem niedrigsten
// gemeinsamen Vorfahren von Dashboard, Evidence und Workspace.
//
// Zwei der drei migrierten Handler (Demo 1) liegen hier:
//   - onChange am Suchfeld  (handleSearchChange)
//   - onClick am Stern      (toggleBookmark aus dem Context)
// Der dritte (onSubmit) liegt in features/workspace/components/HypothesisForm.

import { useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { EvidenceToolbar } from "./components/EvidenceToolbar.js";
import { EvidenceList } from "./components/EvidenceList.js";
import { BookmarkStateProbe } from "./components/BookmarkStateProbe.js";
import { DEFAULT_SORT_ORDER, isEvidenceSortOrder, sortEvidence } from "./evidenceSort.js";
import type { EvidenceSortOrder } from "./evidenceSort.js";
import type { Evidence } from "../../../types.js";

function matchesSearch(item: Evidence, term: string): boolean {
  if (term === "") return true;
  const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
  return haystack.includes(term);
}

export function EvidencePage() {
  const { status, evidence, people, locations } = useCaseData();

  // Aus dem Outlet-Context: der Zustand gehört AppShell, nicht dieser Seite.
  const { bookmarkIds, previousBookmarkIds, toggleBookmark, mutatingToggleBookmark } =
    useAppOutlet();

  // ZUSTAND DIESER ANSICHT: zwei Werte, die der Nutzer setzt und die sich aus
  // nichts berechnen lassen (Demo 4). Sie bleiben hier, weil sie nur hier
  // gebraucht werden – nicht alles muss nach oben wandern.
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<EvidenceSortOrder>(DEFAULT_SORT_ORDER);

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleSortChange(value: string): void {
    // Ein <select> liefert immer einen String. Der Typwächter macht daraus
    // einen EvidenceSortOrder – oder verwirft den Wert.
    if (isEvidenceSortOrder(value)) setSortOrder(value);
  }

  if (status === "loading") {
    return <p className="stub-note">Loading evidence&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // ABGELEITETER WERT (Demo 4): die sichtbare Liste ist KEIN Zustand. Sie
  // entsteht bei jedem Rendern neu aus evidence + searchTerm + sortOrder.
  //
  // KOPIEREN VOR DEM SORTIEREN (Demo 3): filter() gibt ein NEUES Array
  // zurück, und sortEvidence() kopiert zusätzlich selbst. Ein .sort() direkt
  // auf evidence wäre der Sortier-Bug aus Exercise 1, Demo 2.
  const term = searchTerm.toLowerCase().trim();
  const filtered = evidence.filter((item) => matchesSearch(item, term));
  const visibleEvidence = sortEvidence(filtered, sortOrder);

  const firstEvidence = evidence[0];

  return (
    <section>
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        evidence={evidence}
        people={people}
        locations={locations}
      />

      <p className="filter-note">
        {visibleEvidence.length} von {evidence.length} Beweisstücken &middot; {bookmarkIds.length}{" "}
        mit Lesezeichen
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

      <EvidenceList
        items={visibleEvidence}
        bookmarkIds={bookmarkIds}
        onToggleBookmark={toggleBookmark}
      />
    </section>
  );
}
