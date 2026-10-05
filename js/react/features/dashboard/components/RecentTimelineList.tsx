import { Panel } from "../../../shared/components/Panel.js";
import { MiniListItem } from "../../../shared/components/MiniListItem.js";
import { formatDate } from "../../../../utils.js";
import type { TimelineEvent } from "../../../../types.js";

interface RecentTimelineListProps {
  items: TimelineEvent[];
}

export function RecentTimelineList({ items }: RecentTimelineListProps) {
  return (
    <Panel title="Recent timeline events">
      {items.length === 0 ? (
        <p>No timeline events loaded yet.</p>
      ) : (
        items.map((evt) => (
          <MiniListItem key={evt.id} title={formatDate(evt.time)}>
            <br />
            {evt.title}
          </MiniListItem>
        ))
      )}
    </Panel>
  );
}
