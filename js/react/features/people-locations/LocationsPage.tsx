// Kindroute /team/locations (Exercise 4, Demo 8).

import { LocationCard } from "./components/LocationCard.js";
import { useTeamContext } from "./TeamLayout.js";

export function LocationsPage() {
  const { locations } = useTeamContext();

  return (
    <div className="locations-grid">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}
