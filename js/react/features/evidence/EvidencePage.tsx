// Evidence Catalogue (Exercise 5, Demo 1 bis 4).
//
// Feature-Komponente: besitzt den Zustand dieser Ansicht, leitet die
// sichtbare Liste daraus ab und reicht fertige Werte nach unten.
//
// Zwei der drei migrierten Handler liegen hier:
//   - onChange am Suchfeld  (handleSearchChange)
//   - onClick am Stern      (handleToggleBookmark)
// Der dritte (onSubmit) liegt in features/workspace/components/HypothesisForm.
//
// BEWUSSTE ZWISCHENSTUFE: Der Bookmark-Zustand liegt hier lokal, obwohl das
// Dashboard und der Workspace ihn ebenfalls brauchen. Beide lesen ihn derzeit
// getrennt aus dem Local Storage – dieselbe Tatsache an drei Orten. Demo 5
// hebt den Zustand zum gemeinsamen Vorfahren hoch, Demo 6 reicht den Callback
// von dort nach unten.

import { useState } from "react";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { readBookmarks, writeBookmarks } from "../../shared/data/bookmarksStorage.js";
import { EvidenceToolbar } from "./components/EvidenceToolbar.js";
import { EvidenceList } from "./components/EvidenceList.js";
import { BookmarkStateProbe } from "./components/BookmarkStateProbe.js";
import { DEFAULT_SORT_ORDER, isEvidenceSortOrder, sortEvidence } from "./evidenceSort.js";
import type { EvidenceSortOrder } from "./evidenceSort.js";
import type { Evidence, EvidenceId } from "../../../types.js";

function matchesSearch(item: Evidence, term: string): boolean {
  if (term === "") return true;
  const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
  return haystack.includes(term);
}

export function EvidencePage() {
  const { status, evidence, people, locations } = useCaseData();

  // ZUSTAND: zwei Werte, die der Nutzer setzt und die sich aus nichts
  // berechnen lassen (Demo 4).
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<EvidenceSortOrder>(DEFAULT_SORT_ORDER);
  // Local Storage ist synchron, deshalb taugt readBookmarks() als Startwert.
  // Die Funktion wird dank der Lazy-Form nur beim ersten Rendern aufgerufen.
  const [bookmarkIds, setBookmarkIds] = useState<EvidenceId[]>(() => readBookmarks());
  // Demo 3: hält die Referenz VOR dem letzten Umschalten fest, damit die
  // Zustandssonde zeigen kann, dass das alte Array unangetastet bleibt.
  const [previousBookmarkIds, setPreviousBookmarkIds] = useState<EvidenceId[]>([]);

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleSortChange(value: string): void {
    // Ein <select> liefert immer einen String. Der Typwächter macht daraus
    // einen EvidenceSortOrder – oder verwirft den Wert.
    if (isEvidenceSortOrder(value)) setSortOrder(value);
  }

  function handleToggleBookmark(evidenceId: EvidenceId): void {
    // UNVERÄNDERLICHES UPDATE (Demo 3).
    //
    // filter() und [...spread] erzeugen beide ein NEUES Array. bookmarkIds
    // selbst wird nicht angefasst – es behält seinen Inhalt und seine
    // Identität. Deshalb gilt danach next !== bookmarkIds, und genau daran
    // erkennt React, dass sich der Zustand geändert hat.
    //
    // Vanilla-Gegenstück in js/views/evidence.ts, handleBookmarkClick():
    //   bookmarks.push(evidenceId);   // mutiert das Array an Ort und Stelle
    //   ev.bookmarked = true;         // mutiert zusätzlich das Datenobjekt
    const next = bookmarkIds.includes(evidenceId)
      ? bookmarkIds.filter((id) => id !== evidenceId)
      : [...bookmarkIds, evidenceId];

    // Die Zusicherung, die Task 2 verlangt: das Ergebnis muss ein anderes
    // Objekt sein. Im Produktionsbuild entfernt Vite diesen Block.
    if (import.meta.env.DEV && Object.is(next, bookmarkIds)) {
      throw new Error("Bookmark-Update hat dasselbe Array zurückgegeben - Mutation!");
    }

    setPreviousBookmarkIds(bookmarkIds);
    setBookmarkIds(next);
    writeBookmarks(next);
  }

  // NUR ZUM VORFÜHREN (Demo 3), nicht benutzt außerhalb der Zustandssonde.
  // Dieselbe Aufgabe wie oben, aber mutierend gelöst – so, wie es die
  // Vanilla-Variante tut. Das Array wird an Ort und Stelle verändert und
  // danach dieselbe Referenz an den Setter gegeben.
  function handleMutatingToggle(): void {
    const first = evidence[0];
    if (!first) return;

    if (bookmarkIds.includes(first.id)) {
      // splice statt filter: verändert das vorhandene Array.
      bookmarkIds.splice(bookmarkIds.indexOf(first.id), 1);
    } else {
      // push statt spread: verändert das vorhandene Array.
      bookmarkIds.push(first.id);
    }

    setPreviousBookmarkIds(bookmarkIds);
    setBookmarkIds(bookmarkIds); // dieselbe Referenz wie vorher
    writeBookmarks(bookmarkIds);
  }

  if (status === "loading") {
    return <p className="stub-note">Loading evidence&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // ABGELEITETER WERT (Demo 4): die sichtbare Liste ist KEIN Zustand. Sie
  // entsteht bei jedem Rendern neu aus evidence + searchTerm + sortOrder.
  // Es gibt also keine zweite Liste, die von den Daten abweichen könnte –
  // anders als das frühere filteredEvidence der Vanilla-Variante.
  //
  // KOPIEREN VOR DEM SORTIEREN (Demo 3): filter() gibt ein NEUES Array
  // zurück, und sortEvidence() kopiert zusätzlich selbst. Ein .sort() direkt
  // auf evidence wäre der Sortier-Bug aus Exercise 1, Demo 2 – dort zeigten
  // filteredEvidence und allEvidence nach setFilteredEvidence(allEvidence)
  // auf DASSELBE Array.
  const term = searchTerm.toLowerCase().trim();
  const filtered = evidence.filter((item) => matchesSearch(item, term));
  const visibleEvidence = sortEvidence(filtered, sortOrder);

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

      {import.meta.env.DEV && (
        <BookmarkStateProbe
          previous={previousBookmarkIds}
          current={bookmarkIds}
          onMutatingToggle={handleMutatingToggle}
        />
      )}

      <EvidenceList
        items={visibleEvidence}
        bookmarkIds={bookmarkIds}
        onToggleBookmark={handleToggleBookmark}
      />
    </section>
  );
}
