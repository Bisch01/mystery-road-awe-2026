import { TimelineEventItem } from "./TimelineEventItem.js";
import type { Location, Person, TimelineEvent } from "../../../../types.js";

interface TimelineListProps {
  events: TimelineEvent[];
  locations: Location[];
  people: Person[];
}

export function TimelineList({ events, locations, people }: TimelineListProps) {
  return (
    <div className="timeline-container">
      {events.length === 0 ? (
        <p>No timeline events match the current filters.</p>
      ) : (
        events.map((event) => (
          <TimelineEventItem key={event.id} event={event} locations={locations} people={people} />
        ))
      )}
    </div>
  );
}
