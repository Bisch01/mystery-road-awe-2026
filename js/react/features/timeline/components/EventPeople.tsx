// Löst die personIds eines Ereignisses zu Namen auf und überlässt die
// Darstellung MetaLine.
//
// Drei der 15 Ereignisse (T11–T13) haben keine personIds. MetaLine gibt
// dafür null zurück und rendert gar nichts.

import { MetaLine } from "./MetaLine.js";
import type { Person, PersonId } from "../../../../types.js";

interface EventPeopleProps {
  personIds: PersonId[];
  people: Person[];
}

export function EventPeople({ personIds, people }: EventPeopleProps) {
  const names = personIds.map((id) => people.find((person) => person.id === id)?.name ?? id);

  return <MetaLine label="People" values={names} />;
}
