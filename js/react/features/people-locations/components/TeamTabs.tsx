// Tab-Leiste von /team. Zwei echte Links, keine Klick-Handler.
//
// Vanilla-Gegenstück: switchPeopleTab() in js/views/people.ts schaltet vier
// CSS-Klassen von Hand um und lässt die URL unberührt.

import { NavLink } from "react-router";
import { TEAM_TABS } from "../../../app/routes.js";

export function TeamTabs() {
  return (
    <div className="tab-bar">
      {TEAM_TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
