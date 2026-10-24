import type { Person } from "../../../../types.js";

interface PersonAvatarProps {
  person: Person;
}

export function PersonAvatar({ person }: PersonAvatarProps) {
  // person.avatar steht relativ in people.json ("assets/people/x.png").
  // BASE_URL macht daraus den korrekten Pfad, auch unter /mystery-road-awe-2026/.
  const src = `${import.meta.env.BASE_URL}${person.avatar}`;

  return <img className="person-avatar" src={src} alt={`Portrait of ${person.name}`} />;
}
