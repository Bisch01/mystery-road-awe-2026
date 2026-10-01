// Von 7 Funktionen ist nur loadAllData exportiert. Die anderen bilden zusammen
// einen Ablauf mit dem Countdown loadingStepsRemaining: könnte man einzelne
// Teile von außen aufrufen, wäre der Zähler nicht mehr verlässlich.
// Nach außen gibt es genau einen Einstiegspunkt.

import {
  currentPage,
  allEvidence,
  allPeople,
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
import {
  renderEvidenceList,
  applyStoredBookmarkFlags,
  setEvidenceViewLoading,
} from "./views/evidence.js";
import { renderWorkspace } from "./views/workspace.js";
import type {
  CaseData,
  Evidence,
  EvidenceRelevance,
  EvidenceStatus,
  Location,
  Person,
  TimelineEvent,
} from "./types.js";

let loadingStepsRemaining = 3;

// Die einzige Stelle, an der eine unüberprüfte Behauptung über fremde Daten steht.
// res.json() liefert any -- hier wird daraus ein konkreter Typ.
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  return (await res.json()) as T;
}

// evidence.json hält sich bei status und relevance nicht an die Union-Typen
// (z. B. "Reviewed" statt "reviewed"). Deshalb wird die Rohform getrennt
// beschrieben und beim Laden auf die erlaubten Werte abgebildet.
type RawEvidence = Omit<Evidence, "status" | "relevance"> & {
  status: string;
  relevance: string;
};

const EVIDENCE_STATUSES: readonly EvidenceStatus[] = ["unreviewed", "reviewed", "flagged"];
const EVIDENCE_RELEVANCES: readonly EvidenceRelevance[] = ["unknown", "relevant", "irrelevant"];

function toEvidenceStatus(value: string): EvidenceStatus {
  const normalized = value.toLowerCase();
  return EVIDENCE_STATUSES.find((known) => known === normalized) ?? "unreviewed";
}

function toEvidenceRelevance(value: string): EvidenceRelevance {
  const normalized = value.toLowerCase();
  return EVIDENCE_RELEVANCES.find((known) => known === normalized) ?? "unknown";
}

function toEvidence(raw: RawEvidence): Evidence {
  return {
    ...raw,
    status: toEvidenceStatus(raw.status),
    relevance: toEvidenceRelevance(raw.relevance),
  };
}

// Typen beschreiben nur die FORM der Daten, nicht ihren Inhalt. Dass in
// personIds wirklich eine bekannte Person-Id steht und kein Anzeigename,
// kann nur zur Laufzeit geprüft werden.
function warnAboutUnknownPersonIds(evidence: Evidence[]): void {
  const knownIds = new Set(allPeople.map((person) => person.id));
  for (const item of evidence) {
    for (const personId of item.personIds) {
      if (!knownIds.has(personId)) {
        console.warn(`${item.id}: personIds enthält "${personId}" -- keine bekannte Person-Id`);
      }
    }
  }
}

function showLoadingOverlay(msg: string): void {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

//Overlay ausblenden, wenn alle Lade-Schritte abgeschlossen sind
function hideLoadingStep(): void {
  loadingStepsRemaining--;
  if (loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

async function loadCorePeopleAndLocations(): Promise<void> {
  setCaseData(await fetchJson<CaseData>("data/case.json"));
  setAllPeople(await fetchJson<Person[]>("data/people.json"));
  setAllLocations(await fetchJson<Location[]>("data/locations.json"));

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

//holt Beweisstücke, setzt gespeicherten Bookmark-Status und rendert neu
function loadEvidenceData(): void {
  fetchJson<RawEvidence[]>("data/evidence.json")
    .then(function (data) {
      setAllEvidence(data.map(toEvidence));
      warnAboutUnknownPersonIds(allEvidence);
      setEvidenceViewLoading(false); // Meldung an evidence.js, dass die Beweise geladen sind
      applyStoredBookmarkFlags();
      setFilteredEvidence(allEvidence.slice()); // .slice() = Kopie, damit die Referenz nicht gleich ist
      renderDashboard();
      populateAllDropdowns();
      if (currentPage === "evidence") renderEvidenceList();
      if (currentPage === "workspace") renderWorkspace();
    })
    .catch(function (err: unknown) {
      setEvidenceViewLoading(false);
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    })
    .finally(function () {
      hideLoadingStep();
    });
}

async function loadTimelineData(): Promise<void> {
  try {
    setAllTimeline(await fetchJson<TimelineEvent[]>("data/timeline.json"));
    renderDashboard();
    if (currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData(): Promise<void> {
  showLoadingOverlay("Loading case file…");
  loadingStepsRemaining = 3;
  await loadCorePeopleAndLocations();
  loadEvidenceData();
  void loadTimelineData();
}
