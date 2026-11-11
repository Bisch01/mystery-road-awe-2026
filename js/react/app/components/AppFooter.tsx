// Fußbereich der React-Variante.
//
// Exercise 6, Demo 8: zeigt im Entwicklungsmodus zusätzlich an, ob das
// lokale Backend läuft. Im Produktionsbuild fällt der Block weg, weil
// Vite import.meta.env.DEV fest durch false ersetzt.

import { BackendStatus } from "./BackendStatus.js";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <p>
        Project ReMotion Investigation Portal &mdash; Research Center AI, Software and IT-Security
        of HCW (fictional case study)
      </p>
      {import.meta.env.DEV && <BackendStatus />}
    </footer>
  );
}
