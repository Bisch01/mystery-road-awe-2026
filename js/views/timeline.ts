// TIMELINE VIEW (inkl. Quick-View-Modal)

import { allTimeline, allPeople, allLocations } from "../state.js";
import { findLocationById, findEvidenceById, formatDate } from "../utils.js";
import { navigateTo } from "../navigation.js";
import { openEvidenceDetail } from "./evidence.js";
import { asElement, getSelect } from "../dom.js";
import type { Certainty, TimelineEvent } from "../types.js";

// nur diese View benutzt es -> kein export
let modalCloseListenerCount = 0;

export function populateTimelineDropdowns(): void {
  const personSelect = getSelect("timelinePersonFilter");
  const locationSelect = getSelect("timelineLocationFilter");
  const typeSelect = getSelect("timelineTypeFilter");
  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of allPeople) {
    personSelect.innerHTML += '<option value="' + person.id + '">' + person.name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const loc of allLocations) {
    locationSelect.innerHTML += '<option value="' + loc.id + '">' + loc.id + "</option>";
  }

  const types: string[] = [];
  for (const evt of allTimeline) {
    if (!types.includes(evt.type)) types.push(evt.type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (const type of types) {
    typeSelect.innerHTML += '<option value="' + type + '">' + type + "</option>";
  }
}

export function renderTimeline(): void {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  const order = getSelect("timelineOrder")?.value ?? "asc";
  const personFilter = getSelect("timelinePersonFilter")?.value ?? "";
  const locationFilter = getSelect("timelineLocationFilter")?.value ?? "";
  const typeFilter = getSelect("timelineTypeFilter")?.value ?? "";

  let events: TimelineEvent[] = [];
  for (const evt of allTimeline) {
    if (personFilter && !evt.personIds.includes(personFilter)) continue;
    if (locationFilter && !evt.locationIds.includes(locationFilter)) continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    events.push(evt);
  }

  events = events.slice().sort(function (a, b) {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (const item of events) {
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    const eventLocationNames: string[] = [];
    for (const locationId of item.locationIds) {
      const evtLoc = findLocationById(locationId);
      // evtLoc ist ein Objekt -> in den String muss der lesbare Teil, nicht das Objekt
      eventLocationNames.push(evtLoc ? evtLoc.id + " - " + evtLoc.name : locationId);
    }
    if (eventLocationNames.length > 0) {
      html += '<p class="evidence-meta">Location: ' + eventLocationNames.join(", ") + "</p>";
    }

    for (const evidenceId of item.evidenceIds) {
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        evidenceId +
        '">View ' +
        evidenceId +
        "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");
  for (const linkButton of linkButtons) {
    linkButton.addEventListener("click", function (e) {
      const evidenceId = asElement(e.target)?.getAttribute("data-evidence-id");
      if (evidenceId) openEvidenceModal(evidenceId);
    });
  }
}

const certaintyBadgeClass = (certainty: Certainty): string => {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
};

// privat: wird nur aus renderTimeline heraus geöffnet
function openEvidenceModal(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" +
    ev.title +
    "</h3>" +
    '<p class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</p>" +
    "<p>" +
    ev.summary +
    "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    "</div></div>";

  modalCloseListenerCount++;
  console.log("modal opened, active close listeners:", modalCloseListenerCount);

  const modalElement = modal;
  modalElement.addEventListener("click", function (e) {
    const target = asElement(e.target);
    if (!target) return;
    if (
      target.classList.contains("modal-close-btn") ||
      target.classList.contains("modal-backdrop")
    ) {
      modalElement.innerHTML = "";
    }
    const openFullId = target.getAttribute("data-open-full");
    if (openFullId) {
      modalElement.innerHTML = "";
      navigateTo("evidence");
      setTimeout(function () {
        openEvidenceDetail(openFullId);
      }, 0);
    }
  });
}
