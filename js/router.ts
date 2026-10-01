// HASH ROUTING
// Entscheidet, welche View sichtbar ist und ob sie neu gezeichnet werden
// muss. Importiert von allen Views - Views importieren nie den Router
// (navigateTo liegt deshalb in navigation.js).

import { viewRendered, setCurrentPage } from "./state.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderEvidenceList } from "./views/evidence.js";
import { renderPeople, renderLocations } from "./views/people.js";
import { renderTimeline } from "./views/timeline.js";
import { renderWorkspace } from "./views/workspace.js";

export function handleHashChange(): void {
  let hash = window.location.hash.replace("#", "");
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (!validViews.includes(hash)) {
    hash = "dashboard";
  }
  setCurrentPage(hash);

  const sections = document.querySelectorAll(".view");
  for (const section of sections) {
    section.classList.remove("active");
  }
  document.getElementById("view-" + hash)?.classList.add("active");

  const navButtons = document.querySelectorAll(".nav-btn");
  for (const navButton of navButtons) {
    navButton.classList.remove("active");
    if (navButton.getAttribute("data-view") === hash) {
      navButton.classList.add("active");
    }
  }

  if (hash === "dashboard" && !viewRendered.dashboard) {
    renderDashboard();
    viewRendered.dashboard = true;
  } else if (hash === "evidence" && !viewRendered.evidence) {
    renderEvidenceList();
    viewRendered.evidence = true;
  } else if (hash === "people" && !viewRendered.people) {
    renderPeople();
    renderLocations();
    viewRendered.people = true;
  } else if (hash === "timeline" && !viewRendered.timeline) {
    renderTimeline();
    viewRendered.timeline = true;
  } else if (hash === "workspace") {
    // workspace is cheap enough that it always re-renders
    renderWorkspace();
  }
}
