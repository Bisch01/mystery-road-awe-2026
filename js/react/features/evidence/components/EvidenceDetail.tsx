// Detailansicht eines Beweisstücks (Exercise 5, Demo 6, 8, 9 und 10).
//
// Ersetzt renderEvidenceDetail() aus js/views/evidence.ts – dort waren es
// 80 Zeilen String-Konkatenation, danach drei addEventListener auf frisch
// erzeugte Elemente, und der Notiztext wurde beim Speichern per
// textarea.getAttribute("data-evidence-id") aus dem DOM zurückgelesen.
//
// Demo 9: people und locations sind als Props weggefallen. Die Komponente
// liest die Falldaten selbst aus dem CaseDataContext. Damit sinkt die
// Prop-Liste von 6 auf 4, und EvidencePage muss Daten nicht mehr nur
// durchreichen (Prop Drilling).
//
// Demo 10: der "Saved"-Timer lief vorher frei in handleSave(). Jetzt steckt
// er in einem useEffect mit Aufräumfunktion - das ist die letzte Stelle
// dieser Komponente, die Arbeit außerhalb von Reacts Lebenszyklus gemacht hat.

import { useEffect, useState } from "react";

import { Badge, toneForRelevance, toneForStatus } from "../../../shared/components/Badge.js";
import { useBookmarks } from "../../../shared/data/BookmarkContext.js";
import { useCaseData } from "../../../shared/data/useCaseData.js";
import { formatDate } from "../../../../utils.js";
import type { Evidence, EvidenceId } from "../../../../types.js";

interface EvidenceDetailProps {
  evidence: Evidence;
  /** Die gespeicherte Notiz - Eigentümer ist AppShell (Outlet-Context). */
  note: string;
  onSaveNote: (evidenceId: EvidenceId, text: string) => void;
  onClose: () => void;
}

export function EvidenceDetail({ evidence, note, onSaveNote, onClose }: EvidenceDetailProps) {
  // Demo 9: Falldaten aus dem Context, nicht mehr als Prop.
  const { people, locations } = useCaseData();
  // Demo 8: die Lesezeichen kommen aus dem Context, die Notiz als Prop.
  // Beide Wege in einer Komponente, direkt vergleichbar.
  const { bookmarkIds, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarkIds.includes(evidence.id);
  // Lokaler Entwurf: was im Textfeld steht, bevor gespeichert wird.
  // key={evidence.id} am Aufrufer sorgt dafür, dass er beim Wechsel auf ein
  // anderes Beweisstück neu beginnt.
  const [draftNote, setDraftNote] = useState(note);
  // Demo 10: Zähler statt boolesches Flag. Jeder Speichern-Klick erhöht ihn,
  // dadurch ändert sich die Abhängigkeit des Effects und die 2 Sekunden
  // beginnen neu - sonst löscht der Timer des ersten Klicks die Bestätigung
  // des zweiten zu früh.
  const [savedTick, setSavedTick] = useState(0);
  const saved = savedTick > 0;

  // Timer MIT Aufräumfunktion: beim Schließen der Detailansicht wird er
  // abgebrochen statt auf eine ausgehängte Komponente zu feuern.
  useEffect(() => {
    if (savedTick === 0) return;
    const timer = window.setTimeout(() => {
      setSavedTick(0);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [savedTick]);

  // Abgeleitete Werte: Namen zu den Ids, kein Zustand.
  const personNames = evidence.personIds.map(
    (id) => people.find((person) => person.id === id)?.name ?? id
  );
  const locationNames = evidence.locationIds.map((id) => {
    const match = locations.find((location) => location.id === id);
    return match ? `${match.id} - ${match.name}` : id;
  });

  const isDirty = draftNote !== note;

  function handleSave(): void {
    onSaveNote(evidence.id, draftNote);
    setSavedTick((current) => current + 1);
  }

  return (
    <div className="evidence-detail">
      <div className="evidence-detail-header">
        <div>
          <h2>{evidence.title}</h2>
          <div className="evidence-meta">
            {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
          </div>
        </div>
        <button type="button" className="btn btn-secondary btn-small" onClick={onClose}>
          Close
        </button>
      </div>

      {evidence.tags.includes("critical") && (
        <div className="warning-banner">This item is tagged as critical evidence.</div>
      )}

      <div className="detail-field">
        <strong>Summary</strong>
        {evidence.summary}
      </div>

      <div className="evidence-detail-content">{evidence.content}</div>

      <div className="detail-field">
        <strong>Related people</strong>
        {personNames.join(", ")}
      </div>

      <div className="detail-field">
        <strong>Related locations</strong>
        {locationNames.join(", ")}
      </div>

      <div className="detail-field">
        <strong>Tags</strong>
        {evidence.tags.map((tag) => (
          <span className="tag-chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="detail-field">
        <strong>Review status</strong>
        <Badge label={evidence.status} tone={toneForStatus(evidence.status)} />{" "}
        <Badge label={evidence.relevance} tone={toneForRelevance(evidence.relevance)} />
      </div>

      <div className="detail-field">
        <strong>Bookmark</strong>
        {/* Zweiter Auslöser für denselben Zustand: derselbe Callback wie am
            Stern in der Liste, nur von einer anderen Komponente aufgerufen. */}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => {
            toggleBookmark(evidence.id);
          }}
        >
          {isBookmarked ? "Remove bookmark" : "Add bookmark"}
        </button>
      </div>

      <div className="detail-field">
        <strong>Investigator note</strong>
        <textarea
          className="note-textarea"
          rows={3}
          placeholder="Add a private note about this evidence..."
          value={draftNote}
          onChange={(event) => {
            setDraftNote(event.target.value);
          }}
        />
        <button
          type="button"
          className="btn btn-primary btn-small"
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save note
        </button>{" "}
        {saved && <span className="saved-msg">Saved</span>}
        {isDirty && !saved && <span className="hint-text">Nicht gespeichert</span>}
      </div>

      <div className="detail-field">
        <strong>Note preview</strong>
        {/* Vanilla schrieb hier preview.innerHTML = text - ein Notiztext
            konnte also Markup auf die Seite bringen. Als JSX-Kind wird er
            escaped. */}
        <div>{note}</div>
      </div>
    </div>
  );
}
