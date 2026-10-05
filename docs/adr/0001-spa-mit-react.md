# ADR 0001 — Single-Page-Architektur mit React

- **Status:** akzeptiert
- **Datum:** 2026-10-05
- **Kontext:** Exercise 3, Project ReMotion (Advanced Web Engineering, CSDC)
- **Betrifft:** Rendering-Architektur und UI-Bibliothek

## Kontext

Project ReMotion ist ein Ermittlungsportal für einen fiktiven Fall. Es zeigt
Beweisstücke, Personen, Orte und eine Zeitleiste und lässt die Nutzerin damit
arbeiten: filtern, suchen, sortieren, Lesezeichen setzen, Notizen schreiben und
einen Hypothesen-Entwurf speichern.

Die sieben Punkte aus Kap. 14.13 des Skripts, auf diese Anwendung angewendet:

| Frage                                                        | Antwort für diese App                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Wie schnell müssen Inhalt und Interaktion erscheinen?        | Keine harte Anforderung. Kein öffentlicher Einstiegspunkt, keine Absprungrate             |
| Wie viel UI-Zustand überlebt Navigation?                     | **Viel.** Lesezeichen, Notizen, Filter, Sortierung, Hypothese — eine Sitzung dauert lange |
| Ist der Inhalt öffentlich, personalisiert, häufig wechselnd? | Weder noch. 27 KB statische Falldaten, Änderung nur per Deployment                        |
| Offline-Betrieb oder lange Sitzungen?                        | Lange Sitzungen ja, Offline nein                                                          |
| Welche Geräte und Netzbedingungen?                           | Desktop-Browser, normale Verbindung. Keine Low-End-Anforderung                            |
| Routing, Caching, Deployment, Fehlerbehandlung?              | Hash-Routing, kein Server, Auslieferung als statische Dateien über GitHub Pages           |
| Welche Komplexität kann das Team tragen?                     | **Eine Person**, im Rahmen einer Lehrveranstaltung, deren Lernziel React ist              |

Der Bestand ist eine Client-Anwendung mit 1.629 Zeilen TypeScript. Sie ist nach
Navigation und Zustandshaltung bereits eine SPA (Stufe 4 nach Abb. 12.1), rendert
aber noch wie eine AJAX-Seite (Stufe 3): HTML-Strings und `innerHTML`.

Daraus folgen drei belegte Probleme:

1. **Imperative Updates verlieren Stellen.** Ein Lesezeichen-Klick zeichnet die
   gesamte Beweisliste neu (~235 Elemente für zwei nötige Änderungen) und
   aktualisiert zugleich den Lesezeichen-Zähler im Dashboard _nicht_.
2. **Veraltete Ansichten.** Die Render-Cache-Flags `viewRendered` zeichnen jede
   View nur beim ersten Besuch — URL-Zustand und gerenderter Zustand laufen
   auseinander.
3. **Markup-Duplikate.** Das Badge-Markup existiert an 6 Stellen in 3 Dateien,
   `mini-list-item` an 4 Stellen in 2 Dateien. `utils.ts` teilt nur die
   Klassenberechnung; `timeline.ts` umgeht sie bereits.

## Entscheidung

Wir bleiben bei einer **Single-Page-Architektur mit Client-Side-Rendering** und
führen **React** als Rendering-Modell ein. Die Migration erfolgt schrittweise
neben der weiterhin lauffähigen Vanilla-Variante (siehe Demo 6: getrennter
Mountpunkt, Schalter `?react=1`).

## Begründung

**Warum SPA bleibt:** Die App hat viel langlebigen Client-Zustand und viel
Interaktion nach dem ersten View — der Fall, für den Kap. 13.10 die SPA als
passend beschreibt. Eine serverseitig gerenderte Variante gäbe es nur mit einem
Backend, das es nicht gibt und für 27 KB unveränderliche Daten auch nicht
gerechtfertigt wäre.

**Warum React:** Kap. 15.9 nennt als Eignungskriterien wiederverwendbare
Komponenten, deklaratives zustandsgetriebenes Rendering und ein großes Ökosystem.
Die ersten beiden adressieren direkt die drei belegten Probleme oben:
Duplikate werden zu Komponenten, und „UI folgt dem Zustand" beseitigt die Klasse
von Fehlern, zu der der Lesezeichen-Zähler und der Render-Cache gehören.

**Und der ehrliche Teil:** React ist zusätzlich die vom Kurs vorgegebene
Technologie. Ohne diese Vorgabe wäre Preact bei gleicher API und rund einem
Zehntel der Größe die naheliegendere Wahl für ein Projekt dieser Größe.

## Verworfene Alternativen

| Alternative                                    | Warum verworfen                                                                                                                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vanilla bleiben, nur einen Router ergänzen** | Löst Routing, aber keines der drei Probleme. Markup-Duplikate und imperative Updates blieben                                                                                       |
| **Server-Rendering / MPA**                     | Erfordert ein Backend. Der langlebige Client-Zustand müsste in URL, Cookies oder Server-Session wandern. Statisches Hosting entfiele                                               |
| **Preact**                                     | Technisch die bessere Wahl für diese Größe (gleiche API, ~10× kleiner). Verworfen wegen der Kursvorgabe und des kleineren Typen-/Ökosystems                                        |
| **Svelte, Lit, Alpine**                        | Tragfähig, teils kleiner. Verworfen: anderer Werkzeugkasten, kein Lernziel des Kurses                                                                                              |
| **Hybrid (SSG + Hydration / Islands)**         | Technisch attraktiv, weil die Daten statisch sind. Verworfen für jetzt: erfordert ein Meta-Framework und würde den Umfang von Exercise 3 sprengen. Siehe „Was uns umstimmen würde" |

## Konsequenzen

### Positiv

- Markup-Duplikate werden zu typisierten Komponenten (Badge 6×, MiniListItem 4×)
- Abgeleitete Werte (Review-Prozentsatz, Zähler) folgen automatisch dem Zustand;
  die Fehlerklasse „vergessene Stelle" entfällt strukturell
- Der Render-Cache `viewRendered` wird überflüssig
- Werte in `{…}` werden automatisch escaped — die beiden mit
  `// unsafe innerHTML` markierten Stellen verschwinden
- Props machen die heute implizite Schnittstelle (`ev` plus globale Variablen)
  explizit und überprüfbar
- DOM-Identität bleibt erhalten: Fokus, Scrollposition und Textselektion
  überleben Updates

### Negativ

- **Bundle:** React-Chunk 219,56 kB (gzip 68,62 kB) gegenüber 23,67 kB
  (gzip 7,02 kB) für die komplette bisherige App — rund das Zehnfache, bei
  27 KB Nutzdaten
- **Startzeit** wird schlechter, nicht besser: mehr Code auf dem kritischen Pfad
  aus Kap. 13.2
- **Neue Fehlerklassen:** unreine Komponenten, fehlende oder falsche `key`s,
  Effect-Schleifen, veraltete Closures
- **Build-Abhängigkeit:** JSX erfordert dauerhaft einen Build-Schritt
- **Aufwand:** 1.629 Zeilen müssen über die Exercises 3–5 neu ausgedrückt werden
- **Ökosystem-Bindung** mit eigenem Aktualisierungsrhythmus
- React entscheidet **nicht** die Rendering-Architektur (Kap. 15.9): CSR,
  Hash-Routing und fehlendes SSR bleiben unverändert bestehen

## Was uns umstimmen würde

- **Harte Anforderung für schwache Geräte oder schlechte Verbindungen** →
  Wechsel auf Pre-Rendering/SSG mit selektiver Hydration (Kap. 14.4, 14.7, 14.8).
  Bei 27 KB statischer Daten ist Static Site Generation nahezu kostenlos
- **Öffentlicher, indexierbarer Inhalt** → SSR oder SSG erforderlich
- **Mehrbenutzerbetrieb oder geräteübergreifende Daten** → Backend nötig, und
  damit ist die Architekturfrage neu zu stellen
- **Bundle-Größe wird zum Problem** → Preact über Alias-Konfiguration ist ein
  Ersatz mit geringem Aufwand
