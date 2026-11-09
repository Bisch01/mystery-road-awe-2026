// Escape schließt die offene Detailansicht (Exercise 6, Demo 3).
//
// Der echte, berechtigte Fall für eine Aufräumfunktion in dieser Anwendung.
// Der Listener hängt am window, also außerhalb von React. React weiß nichts
// davon und kann ihn nicht von selbst wieder abmelden - das muss die
// Aufräumfunktion tun, die der Effect zurückgibt.
//
// Die Abhängigkeitsliste enthält onEscape. In EvidenceDetail ist das die
// Prop onClose, und die entsteht im Aufrufer bei jedem Render neu (dieselbe
// Beobachtung wie bei objectDep in Demo 2). Der Effect läuft deshalb nach
// jedem Render erneut: erst Aufräumfunktion, dann neue Anmeldung. Das ist
// harmlos, WEIL aufgeräumt wird - ohne die Aufräumfunktion läge nach zehn
// Renders zehnmal derselbe Listener am window, und ein einziger
// Escape-Tastendruck würde onClose zehnmal aufrufen.

import { useEffect } from "react";

export function useEscapeKey(onEscape: () => void): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onEscape();
    }

    window.addEventListener("keydown", handleKeyDown);
    if (import.meta.env.DEV) console.log("[Demo 3] listener angemeldet");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (import.meta.env.DEV) console.log("[Demo 3] listener abgemeldet");
    };
  }, [onEscape]);
}
