import { NavLink } from "react-router";
import { MAIN_NAV } from "../routes.js";

export function MainNav() {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {MAIN_NAV.map((item) => (
        // NavLink statt <a>: der Router setzt die active-Klasse selbst, es gibt
        // keinen currentRoute-Prop mehr, der durch den Baum gereicht wird.
        // NavLink vergleicht standardmäßig als Präfix, deshalb bleibt
        // "People & Locations" auch bei /team/locations markiert.
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
