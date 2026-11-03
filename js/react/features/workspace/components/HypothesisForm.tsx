// Hypothesen-Formular (Exercise 5, Demo 2 und 10).
//
// Alle sechs Felder sind jetzt KONTROLLIERT: ihr angezeigter Wert kommt aus
// dem React-Zustand (value), und jede Eingabe geht durch onChange zurück in
// den Zustand. Der Zustand ist die einzige Wahrheit, das DOM nur die Anzeige.
//
// Demo 1 hatte die Felder noch unkontrolliert (defaultValue + FormData beim
// Absenden). Zwei Dinge sind dadurch neu möglich:
//   - der Confidence-Wert steht live neben dem Schieberegler
//   - "Save" liest nichts mehr aus dem DOM zurück
//
// EINE useState-Variable für alle sechs Felder, nicht sechs einzelne:
// die Felder werden gemeinsam geladen, gemeinsam gespeichert und entsprechen
// genau der Form des Entwurfs im Local Storage (siehe Frage 2).
//
// Demo 10: der "Saved"-Timer lief vorher frei in handleSubmit() und damit
// außerhalb von Reacts Lebenszyklus. Jetzt liegt er in einem useEffect mit
// Aufräumfunktion.

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { readHypothesis, writeHypothesis } from "../../../shared/data/hypothesisStorage.js";
import type { HypothesisDraft } from "../../../shared/data/hypothesisStorage.js";
import type { Evidence, Person } from "../../../../types.js";

interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
}

export function HypothesisForm({ people, evidence }: HypothesisFormProps) {
  // Lazy-Form: readHypothesis() läuft nur beim ersten Rendern.
  const [draft, setDraft] = useState<HypothesisDraft>(() => readHypothesis());
  // Demo 10: Zähler statt boolesches Flag. Jeder Speichern-Vorgang erhöht ihn,
  // dadurch sieht der Effect unten eine neue Abhängigkeit, räumt den alten
  // Timer ab und startet die 2 Sekunden neu.
  const [savedTick, setSavedTick] = useState(0);
  const saved = savedTick > 0;

  // Der Timer gehört in einen Effect MIT Aufräumfunktion. Vorher lief er frei
  // in handleSubmit: beim Verlassen der Ansicht feuerte er auf eine bereits
  // ausgehängte Komponente, und zwei Klicks hintereinander ließen die
  // Bestätigung zu früh verschwinden.
  useEffect(() => {
    if (savedTick === 0) return;
    const timer = window.setTimeout(() => {
      setSavedTick(0);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [savedTick]);

  // Ein neues Objekt statt einer Zuweisung an draft.xy: der alte Zustand
  // bleibt unangetastet. Partial<HypothesisDraft> hält den Aufruf typsicher –
  // ein Feldname, den es nicht gibt, ist ein Compilerfehler.
  function updateDraft(patch: Partial<HypothesisDraft>): void {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    // Ohne preventDefault würde der Browser das Formular abschicken und die
    // Seite neu laden. Die Vanilla-Variante umging das, indem ihr Knopf
    // type="button" war und gar kein submit auslöste.
    event.preventDefault();

    // Kein FormData, kein getElementById: der Zustand IST der Entwurf.
    const toSave: HypothesisDraft = { ...draft, savedAt: new Date().toISOString() };

    if (!writeHypothesis(toSave)) return;

    setDraft(toSave);
    setSavedTick((current) => current + 1);
  }

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="hypSuspectR">Suspected responsible person</label>
          <select
            id="hypSuspectR"
            value={draft.suspectId}
            onChange={(event) => {
              updateDraft({ suspectId: event.target.value });
            }}
          >
            <option value="">Select a person&hellip;</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypNatureR">Accidental or deliberate incident</label>
          <select
            id="hypNatureR"
            value={draft.nature}
            onChange={(event) => {
              updateDraft({ nature: event.target.value });
            }}
          >
            <option value="">Select&hellip;</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidenceR">Selected supporting evidence</label>
          {/* Mehrfachauswahl: value ist ein Array, und selectedOptions liefert
              beim Ändern alle markierten Einträge auf einmal. */}
          <select
            id="hypEvidenceR"
            multiple
            size={6}
            value={draft.evidenceIds}
            onChange={(event) => {
              const ids = Array.from(event.target.selectedOptions, (option) => option.value);
              updateDraft({ evidenceIds: ids });
            }}
          >
            {evidence.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} - {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypConfidenceR">Confidence (0&ndash;100)</label>
          <input
            type="range"
            id="hypConfidenceR"
            min="0"
            max="100"
            value={draft.confidence}
            onChange={(event) => {
              updateDraft({ confidence: event.target.value });
            }}
          />
          {/* Erst durch den kontrollierten Zustand möglich: der Wert steht
              direkt im JSX. Vanilla brauchte dafür einen eigenen Listener in
              js/main.ts, der textContent eines <output> von Hand setzte. */}
          <output htmlFor="hypConfidenceR">{draft.confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanationR">Written explanation</label>
          <textarea
            id="hypExplanationR"
            rows={4}
            placeholder="Explain your reasoning&hellip;"
            value={draft.explanation}
            onChange={(event) => {
              updateDraft({ explanation: event.target.value });
            }}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternativeR">Alternative explanation</label>
          <textarea
            id="hypAlternativeR"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={draft.alternative}
            onChange={(event) => {
              updateDraft({ alternative: event.target.value });
            }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          {saved && <span className="saved-msg">Saved</span>}
          {draft.savedAt !== "" && !saved && (
            <span className="hint-text">
              Letzter Entwurf: {new Date(draft.savedAt).toLocaleString("de-AT")}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
