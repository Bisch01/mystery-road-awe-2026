import type { CaseData, Evidence, Location, Person, TimelineEvent } from "./types.js";

export let allEvidence: Evidence[] = [];
export let filteredEvidence: Evidence[] = [];
export let bookmarks: string[] = [];
export let currentPage = "dashboard";
export let allPeople: Person[] = [];
export let allLocations: Location[] = [];
export let allTimeline: TimelineEvent[] = [];
export let caseData: Partial<CaseData> = {};
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

export function setAllEvidence(value: Evidence[]): void {
  allEvidence = value;
}

export function setFilteredEvidence(value: Evidence[]): void {
  filteredEvidence = value;
}

export function setBookmarks(value: string[]): void {
  bookmarks = value;
}

export function setCurrentPage(value: string): void {
  currentPage = value;
}

export function setAllPeople(value: Person[]): void {
  allPeople = value;
}

export function setAllLocations(value: Location[]): void {
  allLocations = value;
}

export function setAllTimeline(value: TimelineEvent[]): void {
  allTimeline = value;
}

export function setCaseData(value: Partial<CaseData>): void {
  caseData = value;
}

export function setNotesStore(value: Record<string, string>): void {
  notesStore = value;
}
