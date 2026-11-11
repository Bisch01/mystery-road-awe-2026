// Erreichbarkeit des Entwicklungs-Backends (Exercise 6, Demo 8).
//
// Die ZWEITE Stelle, die useFetch benutzt - und absichtlich eine ganz
// andere Art von Aufruf als der Lader der Falldaten:
//   - eine einzelne Ressource statt fünf
//   - eine winzige Antwort statt mehrerer Kilobyte
//   - ein Fehler ist hier kein Grund, die Anwendung anzuhalten, sondern
//     nur eine Anzeige
//
// Genau das ist der Nutzen der Auslagerung: dieselben drei Zustände,
// derselbe Abbruch, dieselbe Fehlerbehandlung - ohne eine Zeile davon noch
// einmal zu schreiben. Diese Komponente besteht nur noch aus der Anzeige.
//
// Nur im Entwicklungsmodus gerendert (siehe AppFooter): im Produktionsbuild
// gibt es kein Backend, das man anzeigen könnte.

import { useFetch } from "../../shared/hooks/useFetch.js";

interface Health {
  ok: boolean;
  resources: string[];
}

export function BackendStatus() {
  const health = useFetch<Health>("/api/health");

  if (health.status === "loading") {
    return (
      <p className="backend-status backend-pending">
        <span className="backend-dot" /> Backend wird geprüft &hellip;
      </p>
    );
  }

  if (health.status === "error") {
    return (
      <p className="backend-status backend-down">
        <span className="backend-dot" /> Backend nicht erreichbar &middot;{" "}
        <code>npm run server</code>{" "}
        <button type="button" className="btn btn-secondary btn-small" onClick={health.reload}>
          Erneut prüfen
        </button>
      </p>
    );
  }

  return (
    <p className="backend-status backend-up">
      <span className="backend-dot" /> Backend erreichbar &middot; {health.data.resources.length}{" "}
      Ressourcen
    </p>
  );
}
