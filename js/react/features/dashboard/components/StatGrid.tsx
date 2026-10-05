import { StatCard } from "../../../shared/components/StatCard.js";

interface StatGridProps {
  evidenceCount: number;
  peopleCount: number;
  locationCount: number;
  bookmarkCount: number;
  reviewedCount: number;
}

export function StatGrid({
  evidenceCount,
  peopleCount,
  locationCount,
  bookmarkCount,
  reviewedCount,
}: StatGridProps) {
  return (
    <div className="stat-grid">
      <StatCard value={evidenceCount} label="Evidence items" />
      <StatCard value={peopleCount} label="People" />
      <StatCard value={locationCount} label="Locations" />
      <StatCard value={bookmarkCount} label="Bookmarked" />
      <StatCard value={reviewedCount} label="Reviewed" />
    </div>
  );
}
