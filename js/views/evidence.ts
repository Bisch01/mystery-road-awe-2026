// EVIDENCE VIEW (Liste, Filter, Suche, Sortierung, Bookmarks, Detail)
// Größte View. Privat bleiben: die drei Zustandswerte, die nur hier
// gebraucht werden, und alle reinen HTML-Bausteine.

import {
  allEvidence,
  bookmarks,
  currentPage,
  allPeople,
  allLocations,
  viewRendered,
  setFilteredEvidence,
  setBookmarks,
} from "../state.js";
import {
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
} from "../utils.js";
import { saveBookmarksToStorage, saveNoteForEvidence, loadNoteForEvidence } from "../storage.js";
import { asElement, asInput, asSelect, getInput, getSelect, getTextArea } from "../dom.js";
import type { Evidence, EvidenceId } from "../types.js";

let evidenceViewLoading = true;
// Setter, damit api.js melden kann, dass die Beweisstücke geladen sind.
// evidenceViewLoading selbst bleibt privat.
export function setEvidenceViewLoading(value: boolean): void {
  evidenceViewLoading = value;
}
let latestSearchRequestId = 0;

// --- Dropdowns ---

export function populateEvidenceDropdowns(): void {
  const typeSelect = getSelect("filterType");
  const personSelect = getSelect("filterPerson");
  const locationSelect = getSelect("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types: string[] = [];
  for (const ev of allEvidence) {
    const t = ev.type.toLowerCase();
    if (!types.includes(t)) types.push(t);
  }
  typeSelect.innerHTML = '<option value="">All types</option>';
  for (const type of types) {
    typeSelect.innerHTML += '<option value="' + type + '">' + type + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of allPeople) {
    personSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const loc of allLocations) {
    locationSelect.innerHTML +=
      '<option value="' + loc.id + '">' + loc.id + " - " + loc.name + "</option>";
  }
}

// --- Filtern & Liste ---

// privat: nur renderEvidenceList braucht das Ergebnis
function getFilteredEvidence(): Evidence[] {
  const searchTerm = getInput("evidenceSearch")?.value.toLowerCase().trim() ?? "";
  const typeVal = getSelect("filterType")?.value ?? "";
  const personVal = getSelect("filterPerson")?.value ?? "";
  const locationVal = getSelect("filterLocation")?.value ?? "";
  const statusVal = getSelect("filterStatus")?.value ?? "";
  const relevanceVal = getSelect("filterRelevance")?.value ?? "";

  const results: Evidence[] = [];
  for (const item of allEvidence) {
    let matches = true;

    if (searchTerm) {
      const haystack = (item.title + " " + item.summary + " " + item.tags.join(" ")).toLowerCase();
      if (!haystack.includes(searchTerm)) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && !item.locationIds.includes(locationVal)) matches = false;
    if (matches && statusVal && item.status !== statusVal) matches = false;
    if (matches && relevanceVal && item.relevance !== relevanceVal) matches = false;

    if (matches) results.push(item);
  }

  sortEvidence(results);
  setFilteredEvidence(results);
  return results;
}

export function renderEvidenceList(): void {
  const container = document.getElementById("evidenceList");
  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (const item of results) {
    html += renderEvidenceCardHTML(item);
  }
  container.innerHTML = html;

  // Event delegation for card clicks / bookmark button.
  container.addEventListener("click", handleEvidenceListClick);
}

// privat: HTML-Baustein einer Karte
function renderEvidenceCardHTML(ev: Evidence): string {
  const isBookmarked = bookmarks.includes(ev.id);
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.includes("critical")) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
  html +=
    '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
  html += "<div>";
  for (const tag of ev.tags) {
    html += '<span class="tag-chip">' + tag + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
}

// privat: Klick-Verteilung innerhalb der Liste
function handleEvidenceListClick(event: Event): void {
  const target = asElement(event.target);
  if (!target) return;

  if (target.dataset.action === "bookmark") {
    event.stopPropagation();
    const id = target.dataset.id;
    if (id) handleBookmarkClick(id);
    return;
  }

  const card = target.closest(".evidence-card");
  const cardId = card?.getAttribute("data-id");
  if (cardId) {
    openEvidenceDetail(cardId);
  }
}

// privat: wird nur aus handleEvidenceListClick gerufen
function handleBookmarkClick(evidenceId: EvidenceId): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (!bookmarks.includes(evidenceId)) {
    bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    setBookmarks(
      bookmarks.filter(function (id) {
        return id !== evidenceId;
      })
    );
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (currentPage === "evidence") renderEvidenceList();
}

export function applyStoredBookmarkFlags(): void {
  for (const ev of allEvidence) {
    ev.bookmarked = bookmarks.includes(ev.id);
  }
}

export function handleSortChange(): void {
  // Nur neu zeichnen. Die Sortierung passiert in getFilteredEvidence, weil dort
  // das Array entsteht, das tatsächlich gerendert wird.
  renderEvidenceList();
}

// privat: sortiert die übergebene Liste in place, nach dem aktuellen Dropdown-Wert
function sortEvidence(list: Evidence[]): Evidence[] {
  const sortValue = getSelect("sortEvidence")?.value ?? "date-desc";

  if (sortValue === "title-asc") {
    list.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sortValue === "title-desc") {
    list.sort(function (a, b) {
      return b.title.localeCompare(a.title);
    });
  } else if (sortValue === "date-asc") {
    list.sort(function (a, b) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } else {
    list.sort(function (a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  return list;
}

export function clearFilters(): void {
  const searchBox = getInput("evidenceSearch");
  if (searchBox) searchBox.value = "";
  for (const id of [
    "filterType",
    "filterPerson",
    "filterLocation",
    "filterStatus",
    "filterRelevance",
  ]) {
    const select = getSelect(id);
    if (select) select.value = "";
  }
  renderEvidenceList();
}

// privat: simuliert eine langsame Suche
function simulateAsyncSearch(term: string): Promise<string> {
  return new Promise<string>(function (resolve) {
    setTimeout(function () {
      resolve(term);
    }, 300);
  });
}

export function handleSearchInput(event: Event): void {
  const term = asInput(event.target)?.value ?? "";
  const requestId = ++latestSearchRequestId;

  void simulateAsyncSearch(term).then(function (_resolvedTerm) {
    // Only apply this response if nothing newer has been typed meanwhile.
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  });
}

// --- Detailansicht ---

export function openEvidenceDetail(evidenceId: EvidenceId): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

// privat: nur der Close-Button in der Detailansicht ruft das
function closeEvidenceDetail(): void {
  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;
  section.classList.add("hidden");
  section.innerHTML = "";
}

// privat: baut die Detailansicht auf
function renderEvidenceDetail(ev: Evidence): void {
  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;

  const personNames: string[] = [];
  for (const personId of ev.personIds) {
    const person = findPersonById(personId);
    personNames.push(person ? person.name : personId);
  }

  const locationNames: string[] = [];
  for (const locationId of ev.locationIds) {
    const loc = findLocationById(locationId);
    locationNames.push(loc ? loc.id + " - " + loc.name : locationId);
  }

  let tagsHtml = "";
  for (const tag of ev.tags) {
    tagsHtml += '<span class="tag-chip">' + tag + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";
  // war: onclick="closeEvidenceDetail()" -- Inline-Handler laufen im globalen
  // Scope und finden Modul-Funktionen nicht. Jetzt über eine id + Listener.
  html +=
    '<button type="button" id="closeEvidenceDetailBtn" class="btn btn-secondary btn-small">Close</button>';
  html += "</div>";

  if (ev.tags.includes("critical")) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html +=
    '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";
  html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";
  // war: onclick="saveCurrentNote()"
  html +=
    '<button type="button" id="saveNoteBtn" class="btn btn-primary btn-small" style="margin-top:6px;">Save note</button>';
  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  document.getElementById("closeEvidenceDetailBtn")?.addEventListener("click", closeEvidenceDetail);
  document.getElementById("saveNoteBtn")?.addEventListener("click", saveCurrentNote);

  document.getElementById("detailStatusSelect")?.addEventListener("change", function (e) {
    const value = asSelect(e.target)?.value;
    // Der Compiler kennt nur "string". Dass im Select genau die drei erlaubten
    // Werte stehen, muss hier ausdrücklich geprüft werden.
    if (value === "unreviewed" || value === "reviewed" || value === "flagged") {
      ev.status = value; // direct mutation of the loaded evidence object
      renderEvidenceDetail(ev);
      if (viewRendered.evidence) renderEvidenceList();
    }
  });
  document.getElementById("detailRelevanceSelect")?.addEventListener("change", function (e) {
    const value = asSelect(e.target)?.value;
    if (value === "unknown" || value === "relevant" || value === "irrelevant") {
      ev.relevance = value;
      renderEvidenceDetail(ev);
      if (viewRendered.evidence) renderEvidenceList();
    }
  });
}

// privat: HTML-Baustein für eine <option>
function statusOptionHTML(current: string, value: string, label: string): string {
  const currentLower = current.toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

// privat: nur der Save-Button in der Detailansicht ruft das
function saveCurrentNote(): void {
  const textarea = getTextArea("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id"); // note id is read back off the DOM
  if (!evidenceId) return;
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text; // unsafe on purpose, see above
}
