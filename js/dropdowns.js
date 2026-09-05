
// DROPDOWN-KOORDINATION
// populateAllDropdowns befüllt Auswahllisten in drei verschiedenen Views.
// Deshalb gehört es in keine dieser Views, sondern in ein eigenes Modul.


import { populateEvidenceDropdowns } from "./views/evidence.js";
import { populateTimelineDropdowns } from "./views/timeline.js";
import { populateHypothesisDropdowns } from "./views/workspace.js";

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}