import { Panel } from "../../../shared/components/Panel.js";
import { MiniListItem } from "../../../shared/components/MiniListItem.js";
import { Badge, toneForStatus } from "../../../shared/components/Badge.js";
import type { Evidence } from "../../../../types.js";

interface RecentEvidenceListProps {
  items: Evidence[];
}

export function RecentEvidenceList({ items }: RecentEvidenceListProps) {
  return (
    <Panel title="Recent evidence">
      {items.length === 0 ? (
        <p>No evidence loaded yet.</p>
      ) : (
        // key = fachliche Id, nicht der Array-Index (Skript Kap. 16.2).
        items.map((ev) => (
          <MiniListItem key={ev.id} title={ev.id}>
            {" — "}
            {ev.title} <Badge label={ev.status} tone={toneForStatus(ev.status)} />
          </MiniListItem>
        ))
      )}
    </Panel>
  );
}
