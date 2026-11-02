// Evidence Catalogue (Exercise 5, Demo 1).
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
import type { Evidence, EvidenceId } from "../../../types.js";

function matchesSearch(item: Evidence, term: string): boolean {
  if (term === "") return true;
  const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
  return haystack.includes(term);
}

export function EvidencePage() {
  const { status, evidence, people, locations } = useCaseData();

  const [searchTerm, setSearchTerm] = useState("");
  // Local Storage ist synchron, deshalb taugt readBookmarks() als Startwert.
  // Die Funktion wird dank der Lazy-Form nur beim ersten Rendern aufgerufen.
  const [bookmarkIds, setBookmarkIds] = useState<EvidenceId[]>(() => readBookmarks());

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleToggleBookmark(evidenceId: EvidenceId): void {
    // Neues Array statt push/splice: der alte Zustand bleibt unangetastet.
    // Vanilla-Gegenstück: bookmarks.push(id) und ev.bookmarked = true,
    // also zwei Mutationen (Demo 3 geht darauf im Detail ein).
    const next = bookmarkIds.includes(evidenceId)
      ? bookmarkIds.filter((id) => id !== evidenceId)
      : [...bookmarkIds, evidenceId];

    setBookmarkIds(next);
    writeBookmarks(next);
  }

  if (status === "loading") {
    return <p className="stub-note">Loading evidence&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // Abgeleitete Werte, kein eigener Zustand: bei jedem Rendern neu berechnet.
  // Damit kann die sichtbare Liste nicht von den Daten abweichen (Demo 4).
  const term = searchTerm.toLowerCase().trim();
  const visibleEvidence = evidence
    .filter((item) => matchesSearch(item, term))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section>
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        evidence={evidence}
        people={people}
        locations={locations}
      />

      <p className="filter-note">
        {visibleEvidence.length} von {evidence.length} Beweisstücken &middot; {bookmarkIds.length}{" "}
        mit Lesezeichen
      </p>

      <EvidenceList
        items={visibleEvidence}
        bookmarkIds={bookmarkIds}
        onToggleBookmark={handleToggleBookmark}
      />
    </section>
  );
}
