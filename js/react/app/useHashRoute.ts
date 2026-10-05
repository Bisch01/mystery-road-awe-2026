// Minimaler Hash-Router als Hook (Skript Kap. 16.4: React enthält selbst
// keinen Router). Bewusst ohne Bibliothek – Exercise 3 verlangt nur ein
// Routing-Gerüst.

import { useEffect, useState } from "react";
import { DEFAULT_ROUTE, isRouteId, type RouteId } from "./routes.js";

interface ParsedHash {
  route: RouteId;
  isUnknown: boolean;
}

function parseHash(): ParsedHash {
  const raw = window.location.hash.replace("#", "");
  if (raw === "") return { route: DEFAULT_ROUTE, isUnknown: false };
  if (isRouteId(raw)) return { route: raw, isUnknown: false };
  return { route: DEFAULT_ROUTE, isUnknown: true };
}

export function useHashRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(() => parseHash().route);

  useEffect(() => {
    function sync(): void {
      const parsed = parseHash();

      if (parsed.isUnknown) {
        // Unbekannte Route: die URL wird auf die Default-Route KORRIGIERT.
        // replace() statt Zuweisung an location.hash, damit kein zusätzlicher
        // History-Eintrag entsteht. Entspricht dem Wildcard-Redirect aus
        // Kap. 16.4 (<Route path="*" element={<Navigate to="/" replace />} />).
        window.location.replace("#" + DEFAULT_ROUTE);
        return;
      }

      setRoute(parsed.route);
    }

    window.addEventListener("hashchange", sync);
    sync(); // Startzustand und Korrektur beim ersten Rendern
    return () => {
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return route;
}
