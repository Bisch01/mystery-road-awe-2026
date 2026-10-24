// Zeigt die beteiligten Personen eines Ereignisses.
//
// Drei der 15 Ereignisse (T11–T13) haben keine personIds. Für die gibt
// die Komponente null zurück und rendert gar nichts – kein leeres <p>,
// das Abstand erzeugen würde (Skript Kap. 16.1).

import type { Person, PersonId } from "../../../../types.js";

interface EventPeopleProps {
  personIds: PersonId[];
  people: Person[];
}

export function EventPeople({ personIds, people }: EventPeopleProps) {
  if (personIds.length === 0) {
    return null;
  }

  const names = personIds.map((id) => people.find((person) => person.id === id)?.name ?? id);

  return <p className="evidence-meta">People: {names.join(", ")}</p>;
}
