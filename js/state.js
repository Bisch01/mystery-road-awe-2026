
//all variables, which touch more than one module, are stored here. 
export let allEvidence = [];
export let filteredEvidence = [];
export let bookmarks = [];
export let currentPage = "dashboard";
export let allPeople = [];
export let allLocations = [];
export let allTimeline = [];
export let caseData = {};
export let notesStore = {};

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

export function setAllEvidence(value) {
    allEvidence = value;
}

export function setFilteredEvidence(value) {
    filteredEvidence = value;
}

export function setBookmarks(value) {
    bookmarks = value;
}

export function setCurrentPage(value) {
    currentPage = value;
}

export function setAllPeople(value) {
    allPeople = value;
}

export function setAllLocations(value) {
    allLocations = value;
}

export function setAllTimeline(value) {
    allTimeline = value;
}

export function setCaseData(value) {
    caseData = value;
}

export function setNotesStore(value) {
    notesStore = value;
}

