// React-Einstiegspunkt (Skript Kap. 15.2).
// Wird von main.ts nur dann dynamisch importiert, wenn ?react=1 in der URL
// steht. Dadurch landet React nicht im Bundle der Vanilla-Variante.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";

const container = document.getElementById("react-root");

// Expliziter Null-Check statt non-null assertion: ein fehlender Mountpunkt
// soll laut scheitern, nicht stillschweigend verschwinden.
if (!container) {
  throw new Error("Mountpunkt #react-root fehlt in index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
