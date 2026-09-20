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

  
  const navButtons = document.querySelectorAll(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  document.querySelectorAll("[data-navigate]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const target = btn.getAttribute("data-navigate");
      if (window.location.hash.replace("#", "") === target) {
        // gleicher Hash -> der Browser feuert kein hashchange, also selbst rendern
        handleHashChange();
      } else {
        navigateTo(target);
      }
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

    loadNoteAsync("E01").then(function (firstNote) {
      console.log("First note preview:", firstNote);
    });
  });
}

window.addEventListener("DOMContentLoaded", initApp);
