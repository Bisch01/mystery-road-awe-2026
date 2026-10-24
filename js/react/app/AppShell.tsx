// Anwendungsrahmen der React-Variante: Kopfbereich, Navigation, Fußbereich.
//
// Demo 8: AppShell wählt die aktive Seite nicht mehr selbst aus. Sie ist
// Layout-Route und rendert an der Stelle der View ein <Outlet />; welche
// Kindroute dort landet, entscheidet der Router.

import { Outlet } from "react-router";

import { AppHeader } from "./components/AppHeader.js";
import { AppFooter } from "./components/AppFooter.js";

export function AppShell() {
  return (
    <>
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </>
  );
}
