// Dashboard der React-Variante (Exercise 3 Demo 10, erweitert in Exercise 5
// Demo 4 und 5).
//
// Feature-Komponente im Sinne von Kap. 16.3: kennt die Datenquelle, berechnet
// die abgeleiteten Werte und reicht reine Werte an die Darstellung weiter.

import { useCaseData } from "../../shared/data/useCaseData.js";
import { useAppOutlet } from "../../app/AppShell.js";
import { CaseSummaryCard } from "./components/CaseSummaryCard.js";
import { StatGrid } from "./components/StatGrid.js";
import { ReviewProgressPanel } from "./components/ReviewProgressPanel.js";
import { RecentEvidenceList } from "./components/RecentEvidenceList.js";
import { RecentTimelineList } from "./components/RecentTimelineList.js";

export function DashboardPage() {
  const { status, caseData, evidence, people, locations, timeline } = useCaseData();

  // Demo 5: die Lesezeichen kommen aus dem Outlet-Context von AppShell.
  // Keine eigene Kopie mehr – vorher stand hier ein eigenes useState mit
  // readBookmarks() als Startwert, also eine dritte Kopie derselben Tatsache.
  const { bookmarkIds } = useAppOutlet();

  if (status === "loading") {
    return <p className="stub-note">Loading case file&hellip;</p>;
  }

  if (status === "error") {
    return <p className="stub-note">Falldaten konnten nicht geladen werden.</p>;
  }

  // ABGELEITETE WERTE (Skript Kap. 17.5: nicht speichern, was sich berechnen
  // lässt). Sie entstehen bei jedem Render neu aus evidence bzw. bookmarkIds –
  // damit können sie nicht veralten.
  //
  // Vanilla-Gegenstück: renderDashboard() berechnete dieselben Zahlen einmal
  // und schrieb sie per innerHTML ins DOM. Weil das viewRendered.dashboard-Flag
  // ein zweites Zeichnen verhinderte, blieben sie danach stehen.
  const reviewedCount = evidence.filter((ev) => ev.status === "reviewed").length;
  const bookmarkCount = bookmarkIds.length;
  const progressPct =
    evidence.length === 0 ? 0 : Math.round((reviewedCount / evidence.length) * 100);

  // slice() liefert eine Kopie, reverse() verändert also nicht den Zustand.
  const recentEvidence = evidence.slice(-5).reverse();
  const recentTimeline = timeline.slice(-5).reverse();

  return (
    <section id="react-dashboard">
      <h2>Dashboard</h2>

      <CaseSummaryCard caseData={caseData} />

      <StatGrid
        evidenceCount={evidence.length}
        peopleCount={people.length}
        locationCount={locations.length}
        bookmarkCount={bookmarkCount}
        reviewedCount={reviewedCount}
      />

      <ReviewProgressPanel progressPct={progressPct} />

      <div className="dashboard-columns">
        <RecentEvidenceList items={recentEvidence} />
        <RecentTimelineList items={recentTimeline} />
      </div>
    </section>
  );
}
