// Kindroute /team/people (Exercise 4, Demo 8).
//
// Kennt keine Datenquelle mehr: Personen und Beweise kommen aus dem
// Outlet-Context der Layout-Route TeamLayout.

import { PersonCard } from "./components/PersonCard.js";
import { useTeamContext } from "./TeamLayout.js";
import { evidenceMentionsPerson } from "../../../utils.js";
import type { Evidence, Person } from "../../../types.js";

function countEvidenceForPerson(evidence: Evidence[], person: Person): number {
  return evidence.filter((ev) => evidenceMentionsPerson(ev, person)).length;
}

export function PeoplePage() {
  const { people, evidence } = useTeamContext();

  return (
    <div className="people-grid">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          relatedEvidenceCount={countEvidenceForPerson(evidence, person)}
        />
      ))}
    </div>
  );
}
