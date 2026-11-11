// Lese-Backend der Fallakte (Exercise 6, Demo 4).
//
// NUR FÜR DIE LOKALE ENTWICKLUNG. Dieser Server wird nicht deployt und ist
// nicht Teil des GitHub-Pages-Workflows aus Exercise 2. Die gebaute Seite
// liest ihre Daten weiterhin aus public/data/.
//
// Er liefert dieselben fünf JSON-Dateien, die bisher direkt geladen wurden,
// als Lese-Endpunkte. Keine Schreib-Endpunkte, keine Datenbank: Lesezeichen,
// Notizen und der Hypothesen-Entwurf bleiben im Local Storage.
//
// Dazu drei Schalter, die eine statische Datei nicht bieten kann:
//   ?delay=2000  verzögert die Antwort um 2000 ms
//   ?fail=1      antwortet mit 500 statt mit Daten
//   ?empty=1     antwortet mit einer leeren Liste statt mit Daten
// Alle drei gehen auch global über die Umgebungsvariablen API_DELAY,
// API_FAIL und API_EMPTY. Ohne diese Schalter wären Ladeanzeige,
// Fehlerzustand, Leerzustand (Demo 6) und der Wettlauf zweier Anfragen
// (Demo 7) nicht vorführbar: eine Datei ist entweder sofort da oder 404.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

const PORT = Number(process.env.PORT ?? 3001);
const MAX_DELAY_MS = 30_000;

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, "..", "public", "data");

// Eine Ressource je JSON-Datei. Der Name ist zugleich der Dateiname.
const RESOURCES = ["case", "evidence", "people", "locations", "timeline"];

// case ist ein einzelnes Objekt, alle anderen sind Listen. Nur Listen haben
// eine sinnvolle leere Fassung - deshalb wirkt ?empty=1 nicht auf /api/case.
const COLLECTIONS = RESOURCES.filter((name) => name !== "case");

/** Prüft einen Schalter aus Query-Parameter oder Umgebungsvariable. */
function isOn(value) {
  return value !== undefined && value !== "0" && value !== "false";
}

const app = express();

// Kein CORS-Paket: der Vite-Dev-Server leitet /api an diesen Port weiter
// (siehe vite.config.js). Aus Sicht des Browsers bleibt alles bei
// localhost:5173, es gibt also gar keine fremde Herkunft.

/** Verzögerung und Fehler auf Abruf - gilt für alle Endpunkte. */
app.use(async (req, res, next) => {
  const requested = req.query.delay ?? process.env.API_DELAY ?? 0;
  const delayMs = Number(requested);

  if (Number.isFinite(delayMs) && delayMs > 0) {
    const capped = Math.min(delayMs, MAX_DELAY_MS);
    console.log(`[api] ${req.method} ${req.originalUrl} - warte ${capped} ms`);
    await new Promise((resolve) => setTimeout(resolve, capped));
  }

  const fail = req.query.fail ?? process.env.API_FAIL;
  if (isOn(fail)) {
    console.log(`[api] ${req.method} ${req.originalUrl} - antworte mit 500`);
    res.status(500).json({ error: "Simulierter Serverfehler", path: req.path });
    return;
  }

  next();
});

/** Kurzer Lebenszeichen-Endpunkt, nützlich zum Prüfen im Browser. */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, resources: RESOURCES });
});

// Ein GET je Ressource. Die Antwort ist der unveränderte Dateiinhalt,
// damit die Form exakt der bisherigen Datei entspricht.
for (const name of RESOURCES) {
  app.get(`/api/${name}`, async (req, res, next) => {
    try {
      // Leere Liste auf Abruf: eine erfolgreiche Antwort (200) ohne Inhalt.
      // Genau der Fall, den Demo 6 vom Ladezustand unterscheiden soll.
      const empty = req.query.empty ?? process.env.API_EMPTY;
      if (isOn(empty) && COLLECTIONS.includes(name)) {
        console.log(`[api] ${req.method} ${req.originalUrl} - antworte mit leerer Liste`);
        res.type("application/json").send("[]");
        return;
      }

      const raw = await readFile(join(DATA_DIR, `${name}.json`), "utf8");
      res.type("application/json").send(raw);
    } catch (err) {
      next(err);
    }
  });
}

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Unbekannte Ressource", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error("[api] Fehler:", err);
  res.status(500).json({ error: "Interner Fehler" });
});

app.listen(PORT, () => {
  console.log(`[api] läuft auf http://localhost:${PORT}/api  (nur Entwicklung)`);
  console.log(`[api] Ressourcen: ${RESOURCES.map((r) => `/api/${r}`).join(", ")}`);
  console.log(`[api] Verzögerung: ?delay=2000   Fehler: ?fail=1   Leer: ?empty=1`);
});
