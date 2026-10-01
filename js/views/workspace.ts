// WORKSPACE VIEW (Bookmarks, Notizen, Hypothesen-Formular)

import { allEvidence, allPeople, notesStore } from "../state.js";
import { STORAGE_KEY_HYPOTHESIS } from "../storage.js";
import { navigateTo } from "../navigation.js";
import { openEvidenceDetail } from "./evidence.js";
import { asElement, getInput, getSelect, getTextArea } from "../dom.js";
import type { EvidenceId, PersonId } from "../types.js";

// Form des Entwurfs, wie saveHypothesis ihn schreibt. Beim Lesen aus dem
// Local Storage ist das eine Behauptung -- geprüft wird dort nichts.
interface HypothesisDraft {
  suspectId: PersonId;
  nature: string;
  evidenceIds: EvidenceId[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

export function renderWorkspace(): void {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

// privat: Teil von renderWorkspace
function renderBookmarksList(): void {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = allEvidence.filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (const ev of bookmarkedItems) {
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (const openButton of openButtons) {
    openButton.addEventListener("click", function (e) {
      navigateTo("evidence");
      const id = asElement(e.target)?.getAttribute("data-open-evidence");
      if (!id) return;
      setTimeout(function () {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

// privat: Teil von renderWorkspace
function renderNotesList(): void {
  const container = document.getElementById("notesList");
  if (!container) return;

  const noteEntries: { index: number; evidenceId: EvidenceId; title: string; text: string }[] = [];
  allEvidence.forEach(function (ev, index) {
    const note = notesStore[ev.id];
    if (note) {
      noteEntries.push({ index, evidenceId: ev.id, title: ev.title, text: note });
    }
  });

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (const entry of noteEntries) {
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>"; // unsafe innerHTML rendering, same as the note preview
  }
  container.innerHTML = html;
}

// exportiert, weil dropdowns.js sie mit den anderen beiden zusammen aufruft
export function populateHypothesisDropdowns(): void {
  const suspectSelect = getSelect("hypSuspect");
  const evidenceSelect = getSelect("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (const person of allPeople) {
    suspectSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (const ev of allEvidence) {
    evidenceSelect.innerHTML +=
      '<option value="' + ev.id + '">' + ev.id + " - " + ev.title + "</option>";
  }
}

// exportiert, weil main.js den Save-Button daran hängt
export function saveHypothesis(): void {
  const suspectSelect = getSelect("hypSuspect");
  const natureSelect = getSelect("hypNature");
  const evidenceSelect = getSelect("hypEvidence");
  const confidenceInput = getInput("hypConfidence");
  const explanationArea = getTextArea("hypExplanation");
  const alternativeArea = getTextArea("hypAlternative");
  if (
    !suspectSelect ||
    !natureSelect ||
    !evidenceSelect ||
    !confidenceInput ||
    !explanationArea ||
    !alternativeArea
  ) {
    return;
  }

  const draft: HypothesisDraft = {
    suspectId: suspectSelect.value,
    nature: natureSelect.value,
    evidenceIds: getSelectedOptions(evidenceSelect),
    confidence: confidenceInput.value,
    explanation: explanationArea.value,
    alternative: alternativeArea.value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg");
  if (!msg) return;
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

// privat: DOM-Helfer nur für saveHypothesis
function getSelectedOptions(selectEl: HTMLSelectElement): string[] {
  const result: string[] = [];
  for (const option of selectEl.options) {
    if (option.selected) result.push(option.value);
  }
  return result;
}

// privat: Teil von renderWorkspace
function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  const draft = JSON.parse(raw) as Partial<HypothesisDraft>;

  const suspectSelect = getSelect("hypSuspect");
  const natureSelect = getSelect("hypNature");
  const confidenceInput = getInput("hypConfidence");
  const confidenceLabel = document.getElementById("hypConfidenceValue");
  const explanationArea = getTextArea("hypExplanation");
  const alternativeArea = getTextArea("hypAlternative");
  const evidenceSelect = getSelect("hypEvidence");

  if (suspectSelect) suspectSelect.value = draft.suspectId ?? "";
  if (natureSelect) natureSelect.value = draft.nature ?? "";
  if (confidenceInput) confidenceInput.value = draft.confidence ?? "50";
  if (confidenceLabel) confidenceLabel.textContent = draft.confidence ?? "50";
  if (explanationArea) explanationArea.value = draft.explanation ?? "";
  if (alternativeArea) alternativeArea.value = draft.alternative ?? "";

  if (!evidenceSelect) return;
  const savedIds = draft.evidenceIds ?? [];
  for (const option of evidenceSelect.options) {
    option.selected = savedIds.includes(option.value);
  }
}
