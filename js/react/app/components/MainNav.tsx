import { ROUTES, ROUTE_LABELS, type RouteId } from "../routes.js";

interface MainNavProps {
  currentRoute: RouteId;
}

export function MainNav({ currentRoute }: MainNavProps) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {ROUTES.map((routeId) => (
        // Echte Links statt <button data-navigate>: damit funktionieren
        // Strg+Klick, "In neuem Tab öffnen" und "Link kopieren".
        <a
          key={routeId}
          href={`#${routeId}`}
          className={routeId === currentRoute ? "nav-btn active" : "nav-btn"}
          aria-current={routeId === currentRoute ? "page" : undefined}
        >
          {ROUTE_LABELS[routeId]}
        </a>
      ))}
    </nav>
  );
}
