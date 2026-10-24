// Parametrisierte Kindroute /team/people/:personId (Exercise 4, Demo 9).
//
// Zeigt eine einzelne Person mit Angaben, die auf der Karte keinen Platz
// haben (background) sowie die zugehörigen Beweisstücke.

import { Link, useParams } from "react-router";

import { Card } from "../../shared/components/Card.js";
import { Badge, toneForStatus } from "../../shared/components/Badge.js";
import { PersonAvatar } from "./components/PersonAvatar.js";
import { useTeamContext } from "./TeamLayout.js";
import { ROUTE_PATHS } from "../../app/routes.js";
import { evidenceMentionsPerson } from "../../../utils.js";

export function PersonDetailPage() {
  // useParams() liefert Record<string, string | undefined>. Der Wert ist
  // immer string | undefined, nie ein eigener Typ: der Router kennt die
  // Domäne nicht und kann nur den Rohtext aus der URL weitergeben.
  const { personId } = useParams();
  const { people, evidence } = useTeamContext();

  const person = people.find((candidate) => candidate.id === personId);

  // Die Route passt, der Datensatz fehlt. Deshalb KEINE Weiterleitung:
  // "/team/people/gibt-es-nicht" ist eine gültige Adresse mit leerem
  // Inhalt, nicht eine unbekannte Adresse. Der Nutzer soll sehen, woran es
  // liegt, statt unerklärt auf der Liste zu landen.
  if (!person) {
    return (
      <div>
        <p className="stub-note">
          Keine Person mit der Kennung <code>{personId}</code> in diesem Fall.
        </p>
        <Link className="back-link" to={ROUTE_PATHS.people}>
          &larr; Back to all people
        </Link>
      </div>
    );
  }

  const relatedEvidence = evidence.filter((ev) => evidenceMentionsPerson(ev, person));

  return (
    <div>
      <Link className="back-link" to={ROUTE_PATHS.people}>
        &larr; Back to all people
      </Link>

      <Card className="person-card">
        <div className="person-card-header">
          <PersonAvatar person={person} />
          <div>
            <h3>{person.name}</h3>
            <div className="person-role">{person.role}</div>
          </div>
        </div>

        <p>
          <strong>Speciality:</strong> {person.speciality}
        </p>

        <p>
          <strong>Responsibilities:</strong>
        </p>
        <ul>
          {person.responsibilities.map((responsibility) => (
            <li key={responsibility}>{responsibility}</li>
          ))}
        </ul>

        <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>

        <p>
          <strong>Background:</strong> {person.background}
        </p>

        <p>
          <strong>
            Related evidence ({relatedEvidence.length} item
            {relatedEvidence.length === 1 ? "" : "s"})
          </strong>
        </p>
        {relatedEvidence.length === 0 ? (
          <p className="stub-note">No evidence mentions this person.</p>
        ) : (
          <ul className="person-evidence-list">
            {relatedEvidence.map((ev) => (
              <li key={ev.id}>
                <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
                <Badge label={ev.status} tone={toneForStatus(ev.status)} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
