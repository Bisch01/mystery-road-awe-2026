import { Badge } from "../../../shared/components/Badge.js";
import type { CaseData } from "../../../../types.js";

interface CaseSummaryCardProps {
  caseData: CaseData | null;
}

export function CaseSummaryCard({ caseData }: CaseSummaryCardProps) {
  return (
    <div className="case-summary-card">
      <h3>{caseData?.title ?? "Case"}</h3>
      <p>
        <Badge label={(caseData?.status ?? "unknown").toUpperCase()} tone="flagged" />
      </p>
      <p>{caseData?.summary ?? ""}</p>
    </div>
  );
}
