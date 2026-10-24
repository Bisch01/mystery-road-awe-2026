import { Card } from "../../../shared/components/Card.js";
import type { Location } from "../../../../types.js";

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="location-card">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {location.contains.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    </Card>
  );
}
