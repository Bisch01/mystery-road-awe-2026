// Von 7 Funktionen ist nur loadAllData exportiert. Die anderen bilden zusammen
// einen Ablauf mit dem Countdown loadingStepsRemaining: könnte man einzelne
// Teile von außen aufrufen, wäre der Zähler nicht mehr verlässlich.
// Nach außen gibt es genau einen Einstiegspunkt.

import {
    currentPage,
    allEvidence,
    setCaseData,
    setAllPeople,
    setAllLocations,
    setAllEvidence,
    setFilteredEvidence,
    setAllTimeline,
} from "./state.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderTimeline } from "./views/timeline.js";
import { populateAllDropdowns } from "./dropdowns.js";
import { renderEvidenceList, applyStoredBookmarkFlags, setEvidenceViewLoading } from "./views/evidence.js";
import { renderWorkspace } from "./views/workspace.js";

let loadingStepsRemaining = 3;

function showLoadingOverlay(msg){
    const overlay = document.getElementById("loadingOverlay");
    const text = document.getElementById("loadingText");
    if(text) text.textContent = msg;
    if(overlay) overlay.classList.remove("hidden");
}

//Overlay ausblenden, wenn alle Lade-Schritte abgeschlossen sind
function hideLoadingStep(){
    loadingStepsRemaining--;
    if(loadingStepsRemaining <= 0){
        const overlay = document.getElementById("loadingOverlay");
        if(overlay) overlay.classList.add("hidden");
    }
}

async function loadCorePeopleAndLocations() {
  const caseRes = await fetch("data/case.json");
  const caseJson = await caseRes.json();
  setCaseData(caseJson);

  const peopleRes = await fetch("data/people.json");
  const peopleJson = await peopleRes.json();
  setAllPeople(peopleJson);

  const locationsRes = await fetch("data/locations.json");
  const locationsJson = await locationsRes.json();
  setAllLocations(locationsJson);

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

//holt Beweisstücke, setzt gespeicherten Bookmark-Status und rendert neu
function loadEvidenceData() {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      setAllEvidence(data);
      setEvidenceViewLoading(false); // Meldung an evidence.js, dass die Beweise geladen sind
      applyStoredBookmarkFlags();
      setFilteredEvidence(allEvidence.slice()); // .sclice() = Kopie, damit die Referenz nicht gleich ist
      renderDashboard();
      populateAllDropdowns();
      if (currentPage === "evidence") renderEvidenceList();
      if (currentPage === "workspace") renderWorkspace();
    })
    .catch(function (err) {
      setEvidenceViewLoading(false);
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    })
    .finally(function () {
      hideLoadingStep();
    });
}

async function loadTimelineData() {
  try {
    const res = await fetch("data/timeline.json");
    const data = await res.json();
    setAllTimeline(data);
    renderDashboard();
    if (currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData() {
  showLoadingOverlay("Loading case file…");
  loadingStepsRemaining = 3;
  await loadCorePeopleAndLocations();
  loadEvidenceData();
  loadTimelineData();
}
