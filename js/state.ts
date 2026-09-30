//all variables, which touch more than one module, are stored here.
export let allEvidence: unknown[] = [];
export let filteredEvidence: unknown[] = [];
export let bookmarks: string[] = [];
export let currentPage = "dashboard";
export let allPeople: unknown[] = [];
export let allLocations: unknown[] = [];
export let allTimeline: unknown[] = [];
export let caseData: Record<string, unknown> = {};
export let notesStore: Record<string, string> = {};

// viewRendered can be const because we are not reassigning the variable itself, but rather modifying its properties. (Variable ist gesperrt, Inhalt nicht)
//in JavaScript let and const are block-scoped, meaning they are only accessible within the block they are defined in. Var is function-scoped, meaning it is accessible throughout the entire function it is defined in.
export const viewRendered = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false,
};

// Setter functions for state variables
// These functions allow other parts of the application to update the state variables
// import would be read-only, so we need to provide setter functions to modify the state variables

export function setAllEvidence(value: unknown[]): void {
  allEvidence = value;
}

export function setFilteredEvidence(value: unknown[]): void {
  filteredEvidence = value;
}

export function setBookmarks(value: string[]): void {
  bookmarks = value;
}

export function setCurrentPage(value: string): void {
  currentPage = value;
}

export function setAllPeople(value: unknown[]): void {
  allPeople = value;
}

export function setAllLocations(value: unknown[]): void {
  allLocations = value;
}

export function setAllTimeline(value: unknown[]): void {
  allTimeline = value;
}

export function setCaseData(value: Record<string, unknown>): void {
  caseData = value;
}

export function setNotesStore(value: Record<string, string>): void {
  notesStore = value;
}
