import { allEvidence, allPeople, allLocations } from './state.js';

// utils.js importiert nur lesend aus state.js: keine Funktion hier ändert
// Zustand oder greift auf das DOM zu. Deshalb ist das Modul von überall
// gefahrlos nutzbar, auch bevor die Seite fertig geladen ist.
//alle Funktionen dieses Moduls nehmen Werte entgegen und und geben Werte zurück

// reine Übersetzung:
//ID --> Objekt
//Objekt + Person --> ja/nein
//Zeitstempel --> lesbares Datum
//Statuswert --> CSS-Klasse

//data/evidence.json ist ein Array von Beweisstücken
//sucht in AllEvidence nach einem Beweisstück mit der gegebenen ID und gibt es (Beweisstück-Objekt) zurück, oder null, wenn nicht gefunden
export function findEvidenceById(id) {
    for (let i = 0; i < allEvidence.length; i++) {
        if (allEvidence[i].id === id) {
            return allEvidence[i];
        }
    }
    return null;
}

//sucht in AllPeople nach einer Person mit der gegebenen ID und gibt sie (Personen-Objekt) zurück, oder null, wenn nicht gefunden
export function findPersonById(id) {
    for (let i = 0; i < allPeople.length; i++) {
        if (allPeople[i].id === id) {
            return allPeople[i];
        }
    }
    return null;
}

//sucht in AllLocations nach einem Ort mit der gegebenen ID und gibt ihn (Ort-Objekt) zurück, oder null, wenn nicht gefunden
export function findLocationById(id) {
    for (let i = 0; i < allLocations.length; i++) {
        if (allLocations[i].id === id) {
            return allLocations[i];
        }
    }
    return null;
}

//prüft, ob ein Beweisstück eine bestimmte Person erwähnt
export function evidenceMentionsPerson(ev, person) {
    if (!ev.personIds) return false; //false falls Eintrag keine personIds hat
    return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
}


export function formatDate(ts) {
    if (!ts) return "Unknown date"; //kein Zeitstempfel --> Unknown Date
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts; //Zeitstempel aber unlesbar --> gibt Rohtext zurück
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); //Format: 1. Jan 2020 12:00, undefined = Browser default locale
}

//übersetzt einen Datenwert in einen CSS-Klassennamen für ein Badge, z.B. "reviewed" -> "badge-reviewed" --> in styles.css definiert
export function getStatusBadgeClass(status) {
    const s = (status || "").toLowerCase(); //fängt ab das Status undefined ist, dann wird "" genommen und toLowerCase() aufgerufen
    if (s === "reviewed") return "badge-reviewed";
    if (s === "flagged") return "badge-flagged";
    return "badge-unreviewed"; //fängt unbekanntes auf
}

//wie getStatusBadgeClass, aber für Relevance, z.B. "relevant" -> "badge-relevant"
export function getRelevanceBadgeClass(relevance) {
    const r = (relevance || "").toLowerCase();
    if (r === "relevant") return "badge-relevant";
    return "badge-unreviewed";
}

