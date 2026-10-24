// Löst die locationIds eines Ereignisses zu lesbaren Beschriftungen auf
// und überlässt die Darstellung MetaLine.
//
// Demo 5: Vorher machte diese Datei beides – nachschlagen UND rendern.

import { MetaLine } from "./MetaLine.js";
import type { Location, LocationId } from "../../../../types.js";

interface EventLocationsProps {
  locationIds: LocationId[];
  locations: Location[];
}

export function EventLocations({ locationIds, locations }: EventLocationsProps) {
  const labels = locationIds.map((id) => {
    const match = locations.find((location) => location.id === id);
    // Unbekannte Id: lieber die rohe Id zeigen als die Zeile zu verschlucken.
    return match ? `${match.id} - ${match.name}` : id;
  });

  return <MetaLine label="Location" values={labels} />;
}
