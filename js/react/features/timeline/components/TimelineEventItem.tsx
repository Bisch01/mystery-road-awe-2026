import { Badge, toneForCertainty } from "../../../shared/components/Badge.js";
import { EventLocations } from "./EventLocations.js";
import { EventPeople } from "./EventPeople.js";
import { formatDate } from "../../../../utils.js";
import type { Location, Person, TimelineEvent } from "../../../../types.js";

interface TimelineEventItemProps {
  event: TimelineEvent;
  locations: Location[];
  people: Person[];
}

export function TimelineEventItem({ event, locations, people }: TimelineEventItemProps) {
  return (
    <div className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}
        {" · "}
        <Badge label={event.certainty} tone={toneForCertainty(event.certainty)} />
      </div>

      <h3>{event.title}</h3>
      <p>{event.description}</p>

      <EventLocations locationIds={event.locationIds} locations={locations} />
      <EventPeople personIds={event.personIds} people={people} />

      {/* Zahlenvergleich statt .length allein: 0 würde React als "0" rendern. */}
      {event.evidenceIds.length > 0 && (
        <p className="evidence-meta">Related evidence: {event.evidenceIds.join(", ")}</p>
      )}
    </div>
  );
}
