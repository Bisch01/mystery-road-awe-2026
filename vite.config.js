import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: GitHub Pages liefert das Projekt unter /<repo-name>/ aus, nicht unter /.
// Vite schreibt damit alle absoluten Pfade in index.html um.
export default defineConfig({
  // Kompiliert .tsx zu JavaScript und sorgt im Dev-Server für React Fast Refresh.
  plugins: [react()],
  base: "/mystery-road-awe-2026/",
  server: {
    open: true,
    // Exercise 6, Demo 4: alles unter /api geht an das lokale Node-Backend
    // (server/server.js, Port 3001). Der Browser spricht dadurch nur mit
    // localhost:5173 - es gibt keine fremde Herkunft und damit kein CORS.
    //
    // Die Alternative wäre, im Backend cors({ origin: "http://localhost:5173" })
    // zu erlauben. Der Proxy ist hier die bessere Wahl, weil die
    // Produktionsvariante ohnehin kein Backend hat: so steht die
    // CORS-Konfiguration nicht in einem Server, den niemand deployt.
    //
    // Läuft das Backend nicht, antwortet der Proxy mit einem Fehler - genau
    // der Fall, den Demo 6 als Fehlerzustand anzeigen soll.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: false,
      },
    },
  },
});
