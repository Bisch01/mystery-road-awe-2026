// Zeigt die Orte eines Zeitstrahl-Ereignisses an.
//
// Hat ein Ereignis keine Orte, gibt die Komponente null zurück und rendert
// damit GAR NICHTS – kein leeres <p>, das Abstände erzeugen würde.
// Skript Kap. 16.1: "A component may return null when it should render nothing."

import type { Location, LocationId } from "../../../../types.js";

interface EventLocationsProps {
  locationIds: LocationId[];
  locations: Location[];
}

export function EventLocations({ locationIds, locations }: EventLocationsProps) {
  if (locationIds.length === 0) {
    return null;
  }

  const labels = locationIds.map((id) => {
    const match = locations.find((location) => location.id === id);
    // Unbekannte Id: lieber die rohe Id zeigen als die Zeile zu verschlucken.
    return match ? `${match.id} - ${match.name}` : id;
  });

  return <p className="evidence-meta">Location: {labels.join(", ")}</p>;
}
