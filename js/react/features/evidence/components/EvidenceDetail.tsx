// Detailansicht eines Beweisstücks (Exercise 5, Demo 6 und 8).
//
// Ersetzt renderEvidenceDetail() aus js/views/evidence.ts – dort waren es
// 80 Zeilen String-Konkatenation, danach drei addEventListener auf frisch
// erzeugte Elemente, und der Notiztext wurde beim Speichern per
// textarea.getAttribute("data-evidence-id") aus dem DOM zurückgelesen.
//
// Diese Komponente besitzt KEINEN gemeinsamen Zustand. Sie bekommt die Notiz
// als Prop und meldet eine Änderung über onSaveNote nach oben. Der eigene
// useState ist nur der Entwurf im Textfeld, solange nicht gespeichert wurde –
// den braucht niemand sonst.

import { useState } from "react";

import { Badge, toneForRelevance, toneForStatus } from "../../../shared/components/Badge.js";
import { useBookmarks } from "../../../shared/data/BookmarkContext.js";
import { formatDate } from "../../../../utils.js";
import type { Evidence, EvidenceId, Location, Person } from "../../../../types.js";

interface EvidenceDetailProps {
  evidence: Evidence;
  people: Person[];
  locations: Location[];
  /** Die gespeicherte Notiz - Eigentümer ist AppShell (Outlet-Context). */
  note: string;
  onSaveNote: (evidenceId: EvidenceId, text: string) => void;
  onClose: () => void;
}

export function EvidenceDetail({
  evidence,
  people,
  locations,
  note,
  onSaveNote,
  onClose,
}: EvidenceDetailProps) {
  // Demo 8: die Lesezeichen kommen aus dem Context, die Notiz als Prop.
  // Beide Wege in einer Komponente, direkt vergleichbar.
  const { bookmarkIds, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarkIds.includes(evidence.id);
  // Lokaler Entwurf: was im Textfeld steht, bevor gespeichert wird.
  // key={evidence.id} am Aufrufer sorgt dafür, dass er beim Wechsel auf ein
  // anderes Beweisstück neu beginnt.
  const [draftNote, setDraftNote] = useState(note);
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
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
