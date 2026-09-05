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
import{ renderDashboard } from "./views/dashboard.js";
import { renderEvidenceList, applyStoredBookmarkFlags } from "./views/evidence.js";
import { renderTimeline } from "./views/timeline.js";
import { populateAllDropdowns } from "./dropdowns.js";

let loadingStepsRemaining = 2;

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

//holt case.json, people.json und locations.json streng nacheinander, danach Dashboard rendern und Dropdowns füllen
function loadCorePeopleAndLocations() {
  return fetch("data/case.json").then(function (caseRes) {
    return caseRes.json().then(function (caseJson) {
      setCaseData(caseJson);

      return fetch("data/people.json").then(function (peopleRes) {
        return peopleRes.json().then(function (peopleJson) {
          setAllPeople(peopleJson);

          return fetch("data/locations.json").then(function (locationsRes) {
            return locationsRes.json().then(function (locationsJson) {
              setAllLocations(locationsJson);

              hideLoadingStep();
              renderDashboard();
              populateAllDropdowns();
            });
          });
        });
      });
    });
  });
}

//holt Beweisstücke, setzt gespeicherten Bookmark-Status und rendert neu
function loadEvidenceData() {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      setAllEvidence(data);
      applyStoredBookmarkFlags();
      setFilteredEvidence(allEvidence);
      renderDashboard();
      populateAllDropdowns();
      if (currentPage === "evidence") renderEvidenceList();
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

//holt Timeline
function loadTimelineData() {
  return fetch("data/timeline.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      setAllTimeline(data);
      renderDashboard();
      if (currentPage === "timeline") renderTimeline();
      populateAllDropdowns();
    })
    .catch(function (err) {
      console.log("timeline load error", err);
    })
    .finally(function () {
      hideLoadingStep();
    });
}

//Einstieg: Overlay eiblenden, Zägler auf 2 und dann Kette starten
export function loadAllData() {
  showLoadingOverlay("Loading case file…");
  loadingStepsRemaining = 2;
  return loadCorePeopleAndLocations().then(function () {
    loadEvidenceData();
    loadTimelineData();
  });
}
