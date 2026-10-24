// People & Locations (Exercise 4).
//
// Feature-Komponente: kennt die Datenquelle, berechnet den Beweis-Zähler
// und reicht fertige Werte an die Karten weiter.
//
// Die Tab-Umschaltung aus der Vanilla-Variante fehlt hier bewusst noch –
// sie wird in Demo 8 zu zwei echten Routen, nicht zu lokalem State.

import { useCaseData } from "../../data/useCaseData.js";
import { PersonCard } from "./components/PersonCard.js";
import { LocationCard } from "./components/LocationCard.js";
import { evidenceMentionsPerson } from "../../../utils.js";
import type { Evidence, Person } from "../../../types.js";

function countEvidenceForPerson(evidence: Evidence[], person: Person): number {
  return evidence.filter((ev) => evidenceMentionsPerson(ev, person)).length;
}

export function PeoplePage() {
  const { status, people, locations, evidence } = useCaseData();

  if (status === "loading") {
    return <p className="stub-note">Loading case file&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  return (
    <section>
      <h2>People &amp; Locations</h2>

      <h3>People</h3>
      <div className="people-grid">
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            relatedEvidenceCount={countEvidenceForPerson(evidence, person)}
          />
        ))}
      </div>

      <h3>Locations</h3>
      <div className="locations-grid">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
