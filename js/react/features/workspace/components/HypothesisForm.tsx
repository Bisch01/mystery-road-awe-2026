// Hypothesen-Formular (Exercise 5, Demo 1).
//
// Hier liegt der dritte migrierte Handler: onSubmit am <form>.
// Vanilla-Gegenstück: ein <button id="saveHypothesisBtn"> ohne form-Bezug,
// an das js/main.ts per addEventListener saveHypothesis() hängte. Diese
// Funktion las danach sechs Felder einzeln mit getSelect/getInput/getTextArea
// aus dem DOM zurück.
//
// BEWUSSTE ZWISCHENSTUFE: Die Felder sind UNKONTROLLIERT. Sie bekommen ihren
// Startwert über defaultValue aus dem gespeicherten Entwurf, und beim Absenden
// liest FormData den aktuellen Stand vom Formular. React kennt die Werte
// zwischen Start und Absenden also nicht.
// Demo 2 macht daraus kontrollierte Felder – und erst dann kann der
// Confidence-Wert live neben dem Schieberegler angezeigt werden, wie es die
// Vanilla-Variante über ein <output> und einen eigenen Listener tat.

import { useState } from "react";
import type { FormEvent } from "react";

import { readHypothesis, writeHypothesis } from "../../../shared/data/hypothesisStorage.js";
import type { HypothesisDraft } from "../../../shared/data/hypothesisStorage.js";
import type { Evidence, Person } from "../../../../types.js";

interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
}

/** Liest einen Textwert aus den Formulardaten. */
function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

export function HypothesisForm({ people, evidence }: HypothesisFormProps) {
  // Nur beim ersten Rendern gelesen: der gespeicherte Entwurf liefert die
  // Startwerte der Felder.
  const [initial] = useState<HypothesisDraft>(() => readHypothesis());
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    // Ohne preventDefault würde der Browser das Formular abschicken und die
    // Seite neu laden. Die Vanilla-Variante umging das, indem ihr Knopf
    // type="button" war und gar kein submit auslöste.
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const draft: HypothesisDraft = {
      suspectId: field(data, "suspectId"),
      nature: field(data, "nature"),
      // getAll, weil das Mehrfach-Auswahlfeld mehrere Werte liefert.
      evidenceIds: data.getAll("evidenceIds").filter((x): x is string => typeof x === "string"),
      confidence: field(data, "confidence"),
      explanation: field(data, "explanation"),
      alternative: field(data, "alternative"),
      savedAt: new Date().toISOString(),
    };

    if (!writeHypothesis(draft)) return;

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="hypSuspectR">Suspected responsible person</label>
          <select id="hypSuspectR" name="suspectId" defaultValue={initial.suspectId}>
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
          <select id="hypNatureR" name="nature" defaultValue={initial.nature}>
            <option value="">Select&hellip;</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidenceR">Selected supporting evidence</label>
          <select
            id="hypEvidenceR"
            name="evidenceIds"
            multiple
            size={6}
            defaultValue={initial.evidenceIds}
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
            name="confidence"
            min="0"
            max="100"
            defaultValue={initial.confidence}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanationR">Written explanation</label>
          <textarea
            id="hypExplanationR"
            name="explanation"
            rows={4}
            placeholder="Explain your reasoning&hellip;"
            defaultValue={initial.explanation}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternativeR">Alternative explanation</label>
          <textarea
            id="hypAlternativeR"
            name="alternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            defaultValue={initial.alternative}
          />
        </div>

        <div className="form-actions">
          {/* type="submit", damit der Klick das onSubmit des Formulars auslöst
              und nicht einen eigenen Klick-Handler braucht. */}
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          {saved && <span className="saved-msg">Saved</span>}
        </div>
      </form>
    </div>
  );
}
