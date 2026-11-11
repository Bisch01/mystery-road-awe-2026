// Layout-Route für /team (Exercise 4, Demo 8).
//
// Zuständig für: Datenquelle, Überschrift und Tab-Leiste. Welches Gitter
// darunter erscheint, entscheidet die Kindroute über <Outlet />.
//
// Die Daten werden hier EINMAL gelesen und per Outlet-Context an die
// Kindroute weitergegeben. Beim Tabwechsel bleibt die Layout-Route montiert,
// es wird also nicht neu geladen.
//
// Exercise 6, Demo 6: Lade- und Fehlerzustand lagen früher hier. Sie liegen
// jetzt einmal in AppShell, weil alle fünf Ansichten dieselben Daten lesen.

import { Outlet, useOutletContext } from "react-router";

import { useCaseData } from "../../shared/data/useCaseData.js";
import { TeamTabs } from "./components/TeamTabs.js";
import type { Evidence, Location, Person } from "../../../types.js";

export interface TeamContext {
  people: Person[];
  locations: Location[];
  evidence: Evidence[];
}

/** Typisierter Zugriff auf den Context für PeoplePage und LocationsPage. */
export function useTeamContext(): TeamContext {
  return useOutletContext<TeamContext>();
}

export function TeamLayout() {
  const { people, locations, evidence } = useCaseData();

  const context: TeamContext = { people, locations, evidence };

  return (
    <section>
      <h2>People &amp; Locations</h2>
      <TeamTabs />
      <Outlet context={context} />
    </section>
  );
}
