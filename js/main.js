// ---------------------------------------------------------------------
// ENTRY POINT
//
// Einziges Modul, das index.html lädt. Verdrahtet alle Event-Listener
// und startet das Laden der Daten. Keine Render-Logik.
// ---------------------------------------------------------------------

import { loadAllData } from "./api.js";
import { loadBookmarksFromStorage, loadNotesFromStorage, loadNoteAsync } from "./storage.js";
import { navigateTo } from "./navigation.js";
import { handleHashChange } from "./router.js";
import {
  renderEvidenceList,
  handleSearchInput,
  handleSortChange,
  clearFilters
} from "./views/evidence.js";
import { switchPeopleTab } from "./views/people.js";
import { renderTimeline } from "./views/timeline.js";
import { saveHypothesis } from "./views/workspace.js";

function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  // ACHTUNG: var absichtlich beibehalten (siehe CHANGES.md, Demo 4 + 8).
  var navButtons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      var targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  // --- ersetzt die früheren inline onclick/onchange Attribute ---
  // Inline-Attribute werden im globalen Scope ausgewertet; Modul-Funktionen
  // sind nicht global und würden dort einen ReferenceError auslösen.
  document.querySelectorAll("[data-navigate]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      navigateTo(btn.getAttribute("data-navigate"));
    });
  });

  document.getElementById("sortEvidence").addEventListener("change", handleSortChange);

  document.getElementById("tabPeopleBtn").addEventListener("click", function () {
    switchPeopleTab("people");
  });
  document.getElementById("tabLocationsBtn").addEventListener("click", function () {
    switchPeopleTab("locations");
  });

  document.getElementById("saveHypothesisBtn").addEventListener("click", saveHypothesis);
  // --- Ende der früheren inline Handler ---

  document.getElementById("evidenceSearch").addEventListener("input", handleSearchInput);

  document.getElementById("filterType").addEventListener("change", renderEvidenceList);
  document.getElementById("filterPerson").addEventListener("change", renderEvidenceList);
  document.getElementById("filterLocation").addEventListener("change", renderEvidenceList);

  document.getElementById("filterStatus").addEventListener("change", renderEvidenceList);
  document.getElementById("filterStatus").setAttribute("onchange", "renderEvidenceList()");

  document.getElementById("filterRelevance").addEventListener("change", renderEvidenceList);

  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

  document.getElementById("timelineOrder").addEventListener("change", renderTimeline);
  document.getElementById("timelinePersonFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineLocationFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineTypeFilter").addEventListener("change", renderTimeline);

  document.getElementById("hypConfidence").addEventListener("input", function (e) {
    document.getElementById("hypConfidenceValue").textContent = e.target.value;
  });
}

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    var firstNote = loadNoteAsync("E01");
    console.log("First note preview:", firstNote);
  });
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);