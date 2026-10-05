import { MainNav } from "./MainNav.js";
import type { RouteId } from "../routes.js";

// BASE_URL kommt aus der Vite-Konfiguration (base: "/mystery-road-awe-2026/").
// In index.html schreibt Vite absolute Pfade selbst um – in .tsx nicht,
// deshalb hier explizit.
const logoUrl = `${import.meta.env.BASE_URL}assets/logo/logo.svg`;

interface AppHeaderProps {
  currentRoute: RouteId;
}

export function AppHeader({ currentRoute }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src={logoUrl} alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>
        <MainNav currentRoute={currentRoute} />
      </div>
    </header>
  );
}
