# CHANGES.md — Exercise 1 (Project ReMotion)

Laufende Notiz zu allen Änderungen. Ergänzung zu den Commits: die Commits zeigen
*was* sich geändert hat, diese Datei *warum* und *wie reproduziert*.

Referenzpunkte:

| Tag | Bedeutung |
|---|---|
| `original-state` | Ausgangszustand des Professors |
| `demo-1-done` | nach dem Modul-Split |

```bash
git diff original-state HEAD --stat            # Überblick
git diff original-state HEAD -- index.html     # Entry Point + Inline-Handler
```

---

## Demo 1 — Split der App in ES-Module

### Ausgangslage

`app.js` war eine Datei mit 1085 Zeilen und 19 globalen `var`-Variablen. Darin
gemischt: Datenladen per `fetch`, geteilter Zustand, das Rendering aller fünf
Views, Event-Handling und Hilfsfunktionen. `index.html` lud sie als klassisches
Script und rief 13 Funktionen über `onclick`/`onchange`-Attribute auf.

### Leitkriterium für die Modulgrenze

Nicht Dateigröße, sondern **Zuständigkeit für eine Außenwelt**: Netzwerk,
Browser-Speicher, DOM. Jede dieser Außenwelten wird jetzt von genau einem Modul
angefasst. Reine Datenumwandlung ohne Außenwelt bildet ein eigenes Modul.

Praktische Methode für die Zuordnung: für jede globale Variable und jede Funktion
alle Aufrufstellen gezählt und geschaut, welchen geplanten Modulen sie zugehören.
Wird etwas von **mehreren** Modulen gebraucht, ist es geteilt; wird es von genau
**einem** gebraucht, bleibt es dort privat.

### Ergebnis: 13 Module

| Modul | Zuständigkeit | Außenwelt |
|---|---|---|
| `js/state.js` | geteilter Anwendungszustand + Setter | keine |
| `js/utils.js` | Lookups nach ID, Datumsformat, Badge-CSS-Klassen | keine |
| `js/storage.js` | Bookmarks und Notizen lesen/schreiben | `localStorage` |
| `js/api.js` | die fünf JSON-Dateien laden, Lade-Overlay | Netzwerk (`fetch`) |
| `js/navigation.js` | `navigateTo` (setzt den URL-Hash) | keine |
| `js/dropdowns.js` | koordiniert die Auswahllisten dreier Views | keine |
| `js/router.js` | Hash-Routing, View-Umschaltung | DOM |
| `js/main.js` | Entry Point: Event-Listener, App-Start | DOM |
| `js/views/dashboard.js` | Fallübersicht, Statistiken, Fortschritt | DOM |
| `js/views/evidence.js` | Liste, Filter, Suche, Sortierung, Bookmarks, Detail | DOM |
| `js/views/people.js` | Personen- und Ortskarten, Tab-Umschaltung | DOM |
| `js/views/timeline.js` | Ereignisliste, Filter, Quick-View-Modal | DOM |
| `js/views/workspace.js` | Bookmark-Liste, Notizen, Hypothesen-Formular | DOM |

### Zwei Entscheidungen, die sich erst beim Umsetzen ergaben

**`navigation.js` als eigenes Modul.** Ursprünglich sollten `navigateTo` und
`handleHashChange` gemeinsam in `router.js` liegen. Das erzeugt aber einen
Import-Zyklus: der Router importiert alle fünf Views, und drei Views
(`people`, `timeline`, `workspace`) brauchen ihrerseits `navigateTo`.
`navigateTo` hat null Abhängigkeiten, `handleHashChange` sieben — die Trennung
löst den Zyklus auf, statt ihn zu verwalten.

**`dropdowns.js` als eigenes Modul.** `populateAllDropdowns` befüllt
Auswahllisten in drei verschiedenen Views. Eine Funktion, die drei Views
koordiniert, gehört in keine dieser drei Views.

### Bewusst NICHT nach `state.js` verschoben

Diese Werte werden jeweils nur von einem Modul gebraucht und bleiben dort privat:

| Variable | privat in | Aufrufstellen im Original |
|---|---|---|
| `loadingStepsRemaining` | `api.js` | nur in `hideLoadingStep` / `loadAllData` |
| `evidenceViewLoading` | `views/evidence.js` | nur in `renderEvidenceList` |
| `selectedEvidence` | `views/evidence.js` | nur in `openEvidenceDetail` / `closeEvidenceDetail` |
| `latestSearchRequestId` | `views/evidence.js` | nur in `handleSearchInput` |
| `currentPeopleTab` | `views/people.js` | nur in `switchPeopleTab` |
| `modalCloseListenerCount` | `views/timeline.js` | nur in `openEvidenceModal` |
| `STORAGE_KEY_BOOKMARKS`, `STORAGE_KEY_NOTES` | `storage.js` | nur dort |

Grenzfall, den reines Hinschauen falsch beantwortet hätte: `viewRendered` sieht
nach einer reinen Router-Angelegenheit aus, wird aber auch in der
Evidence-Detailansicht gelesen (`if (viewRendered.evidence) renderEvidenceList()`).
Also doch geteilter Zustand. Deshalb wirklich alle Aufrufstellen prüfen, nicht
nach Gefühl entscheiden.

### Bewusst privat gehalten (kein `export`)

| Modul | privat | Begründung |
|---|---|---|
| `api.js` | 6 von 7 Funktionen: `showLoadingOverlay`, `hideLoadingStep`, `loadCorePeopleAndLocations`, `loadEvidenceData`, `loadTimelineData` | Die Funktionen bilden zusammen einen Ablauf mit dem Countdown `loadingStepsRemaining`. Könnte man Teile von außen aufrufen, wäre der Zähler nicht mehr verlässlich. Nach außen gibt es genau einen Einstiegspunkt: `loadAllData`. |
| `views/dashboard.js` | `statCardHTML` | reiner HTML-Baustein |
| `views/evidence.js` | 12 von 20: `getFilteredEvidence`, `renderEvidenceCardHTML`, `handleEvidenceListClick`, `handleBookmarkClick`, `closeEvidenceDetail`, `renderEvidenceDetail`, `statusOptionHTML`, `saveCurrentNote`, `simulateAsyncSearch` u.a. | Innereien der Liste bzw. der Detailansicht; nach außen zeigt die grösste Datei nur 8 Namen |
| `views/people.js` | `countEvidenceForPerson` | Hilfszähler nur für die Personenkarten |
| `views/timeline.js` | `certaintyBadgeClass`, `openEvidenceModal` | das Modal wird nur aus der Timeline geöffnet |
| `views/workspace.js` | `renderBookmarksList`, `renderNotesList`, `loadHypothesisFromStorage`, `getSelectedOptions` | Teile von `renderWorkspace` |

### Ein bewusster Kompromiss

`STORAGE_KEY_HYPOTHESIS` wird aus `storage.js` exportiert, die anderen zwei Keys
nicht. Grund: `saveHypothesis` und `loadHypothesisFromStorage` enthalten je ein
Dutzend `document.getElementById`-Aufrufe und genau eine Speicherzeile — es sind
Formularfunktionen mit Speicherzugriff, keine Speicherfunktionen. Sie gehören
deshalb in `views/workspace.js`, brauchen aber den Key.

Sauberer wäre, in `storage.js` zusätzlich `saveHypothesisDraft(draft)` und
`loadHypothesisDraft()` einzuführen; dann bliebe der Key privat. Dagegen
entschieden, weil das die Funktionen zerschneiden würde und Demo 1 ein reiner
Refactor ohne Umbau sein soll. Die Keys bleiben trotzdem alle drei an einer
Stelle — so ist die Frage "welche localStorage-Keys benutzt die App" in einer
Datei beantwortbar.

### Änderungen in `index.html`

- `<script src="app.js">` → `<script type="module" src="js/main.js">`
- 9× `onclick="navigateTo('x')"` → `data-navigate="x"`, in `main.js` per
  `addEventListener` verdrahtet
- `onchange="handleSortChange()"` und 2× `onclick="switchPeopleTab(...)"` entfernt
  (die Elemente hatten bereits IDs)
- `onclick="saveHypothesis()"` entfernt, Button `id="saveHypothesisBtn"` gegeben

Grund für alle diese Änderungen: Inline-Attribute werden im **globalen** Scope
ausgewertet. Modul-Funktionen sind nicht global, jeder dieser Buttons hätte mit
`ReferenceError: navigateTo is not defined` geantwortet.

Die Alternative wäre gewesen, in `main.js` `window.navigateTo = navigateTo` zu
setzen. Funktioniert, stellt aber genau das globale Namespace-Verhalten wieder
her, das der Modul-Split beseitigen soll.

### Zwei versteckte Inline-Handler

Nicht in `index.html`, sondern von `renderEvidenceDetail` zur Laufzeit per
`innerHTML` erzeugt:

```js
'<button ... onclick="closeEvidenceDetail()">Close</button>'
'<button ... onclick="saveCurrentNote()">Save note</button>'
```

Durch Textsuche im HTML nicht findbar — nur durch Testen der Detailansicht.
Umgestellt auf `id="closeEvidenceDetailBtn"` / `id="saveNoteBtn"` plus
`addEventListener` direkt nach dem `innerHTML`-Aufruf.

### Verifikation (reiner Refactor)

Ein `git diff` allein genügt hier nicht: die Anordnung *soll* sich ändern.
Geprüft wurde das Verhalten.

1. Alle Textkonstanten der neuen Module gegen `app.js` abgeglichen — eine
   Abweichung gefunden und korrigiert: `"Unknown Date"` statt `"Unknown date"`
   in `formatDate`.
2. Beide Versionen im Browser durchgeklickt und verglichen:

| | Original | nach dem Split |
|---|---|---|
| Dashboard | 18 Evidence, 6 People, 6 Locations, 0 Bookmarked, 1 Reviewed | identisch |
| alle 5 Views erreichbar | ja | ja |
| Personenkarten | 6 | 6 |
| Locations-Tab | funktioniert | funktioniert |
| Evidence-Karten | **0** | **0** |
| Konsole | `First note preview: Promise` | identisch |
| Konsole | 6× `getAttribute`-Fehler | identisch |

Die 0 Evidence-Karten und die Konsolenfehler sind **erwünscht** — sie sind Bugs
des Originals und beweisen, dass in Demo 1 nichts repariert wurde.

### `var` → `let`/`const`

In den verschobenen Funktionen weitgehend umgestellt, obwohl das formal zu Demo 8
gehört. Unbedenklich, weil die betroffenen Variablen in Schleifen ohne Callbacks
stehen, wo `var` und `let` sich identisch verhalten.

**Eine Ausnahme, absichtlich unverändert:** die Schleife in `setupEventListeners`
(`main.js`) erzeugt Callbacks, die auf `i` zugreifen. Hier ändert `let` das
Verhalten und würde einen Bug beheben, der für Demo 4 und Demo 8 gebraucht wird.
Im Code als Kommentar markiert.

### Gefundene, absichtlich NICHT behobene Auffälligkeiten

| Fund | Datei | vorgesehen für |
|---|---|---|
| `evidenceViewLoading` wird auf `true` gesetzt und nie zurück → `renderEvidenceList` bricht immer sofort ab, Liste bleibt leer | `views/evidence.js` | Demo 5 |
| `setFilteredEvidence(allEvidence)` — beide Namen zeigen auf dasselbe Array, keine Kopie | `api.js` | Demo 2 |
| `loadNoteAsync` verpackt einen sofort verfügbaren Wert in ein Promise; der Aufrufer in `initApp` packt es nicht aus → Konsole zeigt `Promise {}` | `storage.js` | Demo 3 / 4 |
| `var i` in der Nav-Schleife → Callback greift auf `navButtons[5]` zu → `TypeError` bei jedem Nav-Klick, ohne sichtbare Folge | `main.js` | Demo 4 + 8 |
| Countdown `loadingStepsRemaining = 2`, aber drei Ladevorgänge; `loadEvidenceData` meldet sich nicht ab | `api.js` | Demo 5 |
| Drei `catch`-Blöcke mit drei verschiedenen Reaktionen: `console.error` + `alert`, `console.log`, gar nichts | `api.js` | Demo 5 / 8 |
| `res.json()` ohne `res.ok`-Prüfung → bei 404 wird die Fehlerseite als JSON geparst | `api.js` | Demo 7 |
| `loadNotesFromStorage` ohne `try/catch`, `loadBookmarksFromStorage` mit → kaputte Notizen im Speicher lassen den Start abstürzen, kaputte Bookmarks nicht | `storage.js` | Demo 7 |
| `evidenceMentionsPerson` sucht in `personIds` zusätzlich nach `person.name`, obwohl dort nur IDs stehen | `utils.js` | Demo 5 / 8 |
| `selectedEvidence` und `currentPeopleTab` werden gesetzt, aber nie gelesen | evidence / people | Demo 8 |
| `setAttribute("onchange", "renderEvidenceList()")` auf `#filterStatus`, obwohl direkt darüber schon ein Listener hängt | `main.js` | Demo 8 |

### Commits

```
87d3f39  extract shared state into js/state.js
8165206  extract lookup and formatting helpers into js/utils.js
477fab6  extract data loading into js/api.js
04f002a  added storage.js
453c9a2  complete module split: views, router, navigation, dropdowns, entry point
107314d  move views into js/views, rename dropdowns.js
         remove app.js (superseded by js/ modules)
         → Tag: demo-1-done
```

---

## Fragen zu Demo 1

### Klassisches `<script>` vs. `<script type="module">`

Vier Unterschiede, die diese App betreffen:

1. **Scope.** Ein klassisches Script legt seine top-level-Variablen und
   -Funktionen am globalen Objekt ab. Ein Modul hat seinen eigenen Scope; nichts
   ist von außen sichtbar außer über `export`. Genau deshalb sind alle 13
   Inline-Handler in `index.html` kaputtgegangen.
2. **Ausführungszeitpunkt.** Module sind automatisch *deferred*: sie laufen erst,
   wenn das HTML fertig geparst ist. Ein klassisches Script an derselben Stelle
   läuft sofort.
3. **Strict mode.** Module laufen immer im strict mode, ohne `"use strict"`.
   Fehler, die vorher stillschweigend verschluckt wurden, werfen jetzt.
4. **CORS.** Modul-Imports unterliegen der Same-Origin-Policy, klassische
   Scripts nicht.

### `allEvidence` war ein globales `var` — was muss nach dem Split passieren?

**Lesen:** ein explizites `import { allEvidence } from "./state.js"`. Wichtig
dabei: ein Import ist ein *live binding*, kein Schnappschuss. `utils.js` wird beim
Seitenstart geladen, wenn `allEvidence` noch `[]` ist, und sieht später trotzdem
die geladenen Daten — ohne dass es benachrichtigt werden muss.

**Schreiben:** gar nicht direkt. Importierte Bindings sind read-only. Deshalb
stehen in `state.js` Setter-Funktionen: die Zuweisung passiert innerhalb des
Moduls, in dem die Variable deklariert ist.

**Der Fehler, wenn man es vergisst:** in einem Modul
`TypeError: "allEvidence" is read-only`. In der DevTools-Konsole dagegen
(non-strict mode) scheitert dieselbe Zuweisung *lautlos* — der Ausdruck gibt den
zugewiesenen Wert zurück, obwohl nichts passiert ist. Beides selbst getestet:
derselbe Code, einmal harter Fehler, einmal stilles Ignorieren.

**Warum der Fehler nützlich ist:** er stoppt sofort und an der richtigen Stelle,
statt dass ein Schreibversuch wirkungslos verpufft und der Fehler später woanders
auffällt. Und er erzwingt die Setter — die damit eine vollständige Liste aller
Stellen sind, an denen der Zustand ersetzt werden kann.

**Ausnahme, die man verstehen muss:** gesperrt ist die *Variable*, nicht der
*Inhalt*. `viewRendered.dashboard = true` und `notesStore[id] = text` funktionieren
ohne Setter, weil sie eine Eigenschaft ändern statt die Variable zu ersetzen.
Deshalb ist `viewRendered` als `const` exportiert und hat keinen Setter.

### Named export vs. default export

Ein **named export** kann mehrfach pro Datei vorkommen, der Name steht beim
Import fest. Ein **default export** existiert einmal pro Datei, der Importeur
wählt den Namen frei.

Im Refactor ausschließlich named exports verwendet. Begründung: fast alle Module
exportieren mehrere Dinge (`utils.js` sieben Funktionen, `state.js` neun Werte und
neun Setter), da ist named die einzige Möglichkeit. Aber auch bei den Modulen mit
nur einem Export — `navigation.js` (`navigateTo`) und `dropdowns.js`
(`populateAllDropdowns`) — bewusst named gewählt, damit der Name an jeder
Importstelle gleich heißt. Bei einem default export könnte eine Datei
`import nav from "./navigation.js"` schreiben und eine andere
`import go from "./navigation.js"` — derselbe Code unter zwei Namen, was die
Suche nach Aufrufstellen erschwert. Ein einheitlicher Stil war hier mehr wert als
die kürzere Schreibweise.

### Warum laufen `type="module"`-Scripts nicht über `file://`?

Beides, und aus derselben Wurzel. Modul-Imports werden als CORS-Requests
ausgeführt; ein `file://`-Dokument hat einen *opaque origin*, der jede
Same-Origin-Prüfung scheitern lässt — der Browser blockiert also bereits den
Import von `js/state.js`. Dieselbe Regel trifft `fetch("data/case.json")`.

Der Unterschied: `fetch` braucht auch als klassisches Script einen Server, das
war also schon vorher so. Neu ist, dass jetzt **gar kein Code mehr läuft** statt
nur die Datenanfragen zu scheitern. Zwei getrennte Fehlermeldungen, eine Ursache:
die Same-Origin-Policy.
