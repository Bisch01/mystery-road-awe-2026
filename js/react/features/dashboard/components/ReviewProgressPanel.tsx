import { Panel } from "../../../shared/components/Panel.js";

interface ReviewProgressPanelProps {
  progressPct: number;
}

export function ReviewProgressPanel({ progressPct }: ReviewProgressPanelProps) {
  return (
    <Panel title="Review progress">
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${String(progressPct)}%` }} />
      </div>
      <p>{progressPct}% of evidence reviewed</p>
    </Panel>
  );
}
