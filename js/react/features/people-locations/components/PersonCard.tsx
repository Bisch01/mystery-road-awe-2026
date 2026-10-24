import { Link } from "react-router";

import { Card } from "../../../shared/components/Card.js";
import { PersonAvatar } from "./PersonAvatar.js";
import { personPath } from "../../../app/routes.js";
import type { Person } from "../../../../types.js";

interface PersonCardProps {
  person: Person;
  /** Wird vom Aufrufer berechnet – die Karte selbst kennt die Beweisliste nicht. */
  relatedEvidenceCount: number;
}

export function PersonCard({ person, relatedEvidenceCount }: PersonCardProps) {
  return (
    <Card className="person-card">
      <div className="person-card-header">
        <PersonAvatar person={person} />
        <div>
          <h3>
            {/* Link statt reinem Text: führt auf die parametrisierte Route
                /team/people/:personId (Demo 9). */}
            <Link to={personPath(person.id)}>{person.name}</Link>
          </h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>

      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>

      <ul>
        {person.responsibilities.map((responsibility) => (
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>

      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>

      <p>
        {relatedEvidenceCount} related evidence item{relatedEvidenceCount === 1 ? "" : "s"}
      </p>
    </Card>
  );
}
