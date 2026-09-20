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

## Demo 3 — Bug: Async / Promise-Handling

**Symptom:** Die Evidence-Ansicht bleibt dauerhaft leer, der Lade-Indikator dreht
endlos. Keine Fehlermeldung in der Konsole. Das Dashboard zeigt gleichzeitig
"18 Evidence items" an — die Daten sind also geladen.

**Reproduktion:**
1. App über Live Server öffnen
2. Auf den Reiter "Evidence" klicken
→ Erwartet: 18 Evidence-Karten.
→ Tatsächlich: leere Liste, Lade-Indikator sichtbar, Konsole sauber.

**Root Cause:** `evidenceViewLoading` in `js/views/evidence.js` startet als `true`
und wird nirgends zurückgesetzt. `renderEvidenceList` prüft das Flag als Erstes
und verlässt die Funktion mit `return`, bevor gezeichnet wird.

In Begriffen der Async-Operation: `loadEvidenceData` holt `data/evidence.json`
per `fetch`. Das Flag hätte im `.then()`-Callback — also nach dem Auflösen des
Promise — auf `false` gesetzt werden müssen. Genau dieser Schritt fehlte. Der
Ladezustand wird betreten, aber nie verlassen. Der Bug passiert also nicht beim
Start und nicht während des Wartens, sondern **nach erfolgreichem Auflösen**:
das Promise liefert die Daten korrekt (das Dashboard zeigt sie ja), nur die
Zustandsänderung, die daran hängen müsste, findet nicht statt.

**Bestätigt durch:** Testweise `let evidenceViewLoading = false;` gesetzt →
die 18 Karten erschienen sofort. Damit war belegt, dass diese eine Variable die
Ansicht blockiert und nicht etwa fehlende Daten.

**Fix:** `evidenceViewLoading` wird auf `false` gesetzt, sobald `evidence.json`
verarbeitet ist — im `.then()`-Callback von `loadEvidenceData`, direkt nach
`setAllEvidence(data)`. Zusätzlich im `.catch()`, damit der Lade-Indikator auch
bei einem Fehlschlag verschwindet statt endlos zu drehen.

Weil das Flag privat in `views/evidence.js` bleibt, geschieht das über einen
exportierten Setter `setEvidenceViewLoading(value)` — nach demselben Muster wie
die Setter in `state.js`.

**Kein Symptom-Patch:** Der Startwert `true` ist richtig und bleibt. Hätte man
ihn auf `false` geändert, würde der Lade-Indikator nie erscheinen — die Funktion,
die das Flag haben soll, wäre entfernt statt repariert.

**Verifiziert:**
- 18 Karten erscheinen, Lade-Indikator verschwindet
- Dashboard-Zahl (18) und Listenlänge stimmen überein
- Mit gedrosseltem Netz (DevTools → Netzwerk → Slow 3G) ist der Lade-Indikator
  kurz sichtbar und verschwindet dann — das Flag erfüllt jetzt seinen Zweck

**Commits:** `demo-1-done` / `37d07c3` (kaputt) → `4b449cb` (heil)

### Fragen

- **Welche Async-Operation, und in welcher Phase passiert der Bug?**
  `fetch("data/evidence.json")` in `loadEvidenceData`. Der Fehler liegt nicht im
  Laden selbst — das gelingt — sondern im `.then()`-Callback: dort fehlte die
  Zustandsänderung, die das Ende des Ladevorgangs signalisiert. Bestätigt, indem
  ich das Flag testweise überschrieben habe und die Liste sofort erschien; die
  Daten waren also längst da.

  ## Demo 2 — Bug: Mutation / Referenz

**Symptom:** Das Sortier-Dropdown in der Evidence-Ansicht hat keinerlei Wirkung.
Die Kartenreihenfolge bleibt bei allen vier Optionen identisch.

**Vorgeschichte:** Dieser Bug war zunächst unsichtbar, weil die Evidence-Liste
wegen des Async-Bugs aus Demo 3 überhaupt keine Karten anzeigte. Er wurde erst
sichtbar, nachdem `evidenceViewLoading` korrekt zurückgesetzt wurde.

**Reproduktion:**
1. App öffnen, Reiter "Evidence"
2. Reihenfolge der Karten-IDs notieren (E01, E02, E03, …)
3. Im Sortier-Dropdown (2. Werkzeugzeile) "Title (A–Z)" wählen
4. Reihenfolge erneut ablesen
→ Erwartet: alphabetisch nach Titel sortiert.
→ Tatsächlich: unverändert E01, E02, E03, … Ebenso bei "Oldest first" und
  "Title (Z–A)". Keine Fehlermeldung in der Konsole.

**Root Cause:** Zwei Referenz-Probleme, die zusammenwirken.

*(a) Sortiert wird ein Array, das sofort weggeworfen wird.*

`handleSortChange` rief `filteredEvidence.sort(...)` auf und danach
`renderEvidenceList()`. Diese ruft `getFilteredEvidence()`, und dort entsteht mit
`const results = []` ein **neues** Array, das in der Reihenfolge von `allEvidence`
befüllt und am Ende per `setFilteredEvidence(results)` zugewiesen wird. Der Name
`filteredEvidence` zeigt danach auf dieses neue Array; das eben sortierte ist
unerreichbar und wird vom Garbage Collector eingesammelt. Gezeichnet wird
`results` — in der ursprünglichen Reihenfolge.

Die Sortierung fand also statt, nur am falschen Objekt.

*(b) Beim Laden teilten sich zwei Namen ein Array.*

In `js/api.js` stand `setFilteredEvidence(allEvidence)` — ohne Kopie. Beide Namen
zeigten auf dasselbe Array. Solange das gilt, würde jede In-place-Operation auf
`filteredEvidence` (wie `.sort()`) auch `allEvidence` verändern und damit das
Dashboard beeinflussen, das über `allEvidence.slice(-5)` die "Recent evidence"
anzeigt.

Beides sind Referenzfehler, aber in entgegengesetzte Richtungen: einmal wird eine
Referenz ersetzt, wo sie hätte bestehen bleiben müssen; einmal wird eine Referenz
geteilt, wo eine Kopie nötig gewesen wäre.

**Fix:**

1. Die Sortierung wandert dorthin, wo das gerenderte Array entsteht: in
   `getFilteredEvidence`, direkt vor `setFilteredEvidence(results)`. Ausgelagert
   in eine private Funktion `sortEvidence(list)`, die den aktuellen Dropdown-Wert
   aus dem DOM liest.
2. `handleSortChange` löst nur noch `renderEvidenceList()` aus — genau wie alle
   anderen Filter-Dropdowns, die ihren Wert bei jedem Render frisch lesen. Damit
   ist die Sortierung konsistent mit dem Rest der Ansicht behandelt.
3. In `js/api.js`: `setFilteredEvidence(allEvidence.slice())`. `.slice()` ohne
   Argumente erzeugt ein neues Array mit denselben Elementen, sodass Änderungen an
   `filteredEvidence` `allEvidence` nicht mehr erreichen.

**Kein Symptom-Patch:** Naheliegend wäre gewesen, in `handleSortChange` eine Kopie
zu sortieren. Das hätte nichts geändert — auch die Kopie wäre von
`getFilteredEvidence` überschrieben worden. Entscheidend ist, *welches* Array
sortiert wird, nicht ob es eine Kopie ist.

**Verifiziert:**
- Alle vier Optionen ändern die Reihenfolge
- "Oldest first" ist exakt die Umkehrung von "Newest first", ebenso
  "Title (Z–A)" von "Title (A–Z)"
- Sortierung bleibt erhalten, wenn danach ein Filter gesetzt wird
- Bekannte, gewollte Nebenwirkung: die Startreihenfolge ist jetzt nach Datum
  absteigend statt Dateireihenfolge. Das Dropdown stand von Anfang an auf
  "Newest first" — vorher hat die App diese Sortierung nur behauptet.

**Commits:** `4b449cb` (kaputt) → `e528391` (heil)

### Fragen

- **Referenz vs. Kopie in JavaScript:**
  Eine Variable, die auf ein Objekt oder Array zeigt, enthält nicht die Daten
  selbst, sondern einen Verweis darauf. `b = a` kopiert nur den Verweis — danach
  zeigen beide Namen auf dasselbe Array, und `b.push(x)` ist auch für `a`
  sichtbar. `b = a.slice()` erzeugt dagegen ein zweites Array; die beiden sind
  danach unabhängig.

  Beide Hälften dieses Bugs erklären sich daraus. Bei (a) wurde ein Array
  sortiert und dann der Name auf ein anderes Array umgebogen — die Arbeit war
  weg, obwohl `.sort()` einwandfrei gelaufen war. Bei (b) zeigten zwei Namen auf
  dasselbe Array, sodass eine Änderung an einem den anderen mit verändert hätte.
  Dieselbe Eigenschaft der Sprache, zwei entgegengesetzte Fehler.

  Wichtig ist außerdem der Unterschied zwischen *verändern* und *ersetzen*:
  `.sort()` verändert das vorhandene Array in place, `.slice()` und das
  Array-Literal `[]` erzeugen ein neues. Nur bei der ersten Sorte wirkt sich
  etwas auf andere Namen aus, die auf dasselbe Array zeigen.

- **Exakte User-Aktionen und Systemzustand, die den Bug auslösen:**
  Die Evidence-Ansicht muss gerendert sein (dafür musste erst der Demo-3-Bug
  behoben werden), dann genügt eine Änderung am Sortier-Dropdown. Der Bug trat
  immer auf, nicht nur unter bestimmten Bedingungen.

- **Hätte ich ihn durch reines Lesen gefunden?**
  Theoretisch ja — die drei beteiligten Funktionen stehen untereinander in einer
  Datei. Praktisch nein, und zwar aus zwei Gründen. Erstens wirkt jede Funktion
  für sich korrekt: `handleSortChange` sortiert richtig, `getFilteredEvidence`
  filtert richtig. Der Fehler entsteht erst aus ihrem Zusammenspiel — genauer aus
  der Reihenfolge, in der sie einander aufrufen. Zweitens war der Bug vor dem
  Demo-3-Fix gar nicht auslösbar: bei leerer Liste gibt es nichts zu sortieren.
  Ich habe ihn gefunden, indem ich nach dem ersten Fix die Ansicht systematisch
  durchprobiert habe — also durch Benutzen, nicht durch Lesen.

  ## Demo 4 — Bug: stiller Bug (nur Konsole)

**Konsolen-Ausgabe (wörtlich):

Uncaught TypeError: Cannot read properties of undefined (reading 'getAttribute')
at main.js:29


**Reproduktion:**
1. DevTools öffnen (F12), Tab "Konsole", **bevor** irgendetwas angeklickt wird
2. Seite neu laden
3. Auf einen beliebigen Navigationsknopf klicken
→ Oberfläche: völlig korrekt — die Ansicht wechselt, der Knopf wird markiert,
  die Inhalte erscheinen.
→ Konsole: ein TypeError pro Klick. Außerdem fehlt die erwartete Zeile
  `nav clicked: <view>`.

**Verantwortliche Zeilen:** `js/main.js`, in `setupEventListeners`:

```js
var navButtons = document.querySelectorAll(".nav-btn");
for (var i = 0; i < navButtons.length; i++) {
  navButtons[i].addEventListener("click", function () {
    var targetView = navButtons[i].getAttribute("data-view");
    console.log("nav clicked:", targetView);
  });
}
```

**Root Cause:** `var i` ist function-scoped — es existiert **ein einziges `i`**
für die gesamte Funktion, nicht eines pro Schleifendurchlauf. Die fünf Callbacks
werden registriert, aber erst beim Klick ausgeführt; sie merken sich keinen Wert,
sondern greifen auf dieselbe Variable zu. Nach Ende der Schleife steht `i` auf 5
(die Bedingung `5 < 5` hat sie beendet). Beim Klick liest der Callback also
`navButtons[5]` — gültig sind nur 0 bis 4 — und erhält `undefined`.
`undefined.getAttribute(...)` wirft.

**Warum nichts sichtbar kaputtgeht:** Dieser Listener hat keine Aufgabe außer dem
Logging. Die eigentliche Navigation läuft über die `data-navigate`-Attribute und
den URL-Hash, in einem separaten Listener. Der Fehler unterbricht nur den
Log-Callback, nicht die Navigation.

**Fix:** `var` → `let` in der Schleife (und `const` für `navButtons`). `let` ist
block-scoped: jeder Durchlauf erzeugt eine eigene Bindung, die der jeweilige
Callback festhält.

**Verifiziert:** Konsole geöffnet, Seite neu geladen, alle fünf Reiter angeklickt.
Vorher: fünf TypeErrors, keine Log-Zeile. Nachher: kein Fehler, und pro Klick die
korrekte Zeile `nav clicked: dashboard`, `nav clicked: evidence` usw. Dass jetzt
der *richtige* Name erscheint, beweist zusätzlich, dass der Callback nun auf den
angeklickten Button zugreift und nicht auf `undefined`.

**Anmerkung:** Diese Stelle war seit dem Modul-Split (Demo 1) bewusst mit einem
Kommentar als "nicht anfassen" markiert — überall sonst wurde `var` bereits zu
`let`/`const`, nur hier hätte das den Bug versehentlich mitbehoben. Der Kommentar
wurde mit diesem Fix entfernt.

**Commits:** `da6edbf` (kaputt) → `<hash-fixed>` (heil)

### Fragen

- **Wie ist mir der Bug aufgefallen, obwohl nichts kaputt aussah?**
  Nur weil die Konsole während des gesamten Testens offen war. Beim Klicken durch
  die Reiter tauchte bei jedem Klick eine rote Zeile auf, während die Oberfläche
  sich völlig normal verhielt.

  "Sieht nicht kaputt aus" ist nicht dasselbe wie "ist nicht kaputt", weil die
  sichtbare Oberfläche nur einen Teil dessen zeigt, was der Code tut. Hier war
  eine Funktion seit dem ersten Klick defekt, ohne jede Auswirkung auf die
  Darstellung — schlicht, weil ihr einziger Zweck das Logging war. Wäre in
  demselben Callback später eine echte Aufgabe ergänzt worden (Statistik,
  Zustandswechsel, ein Analytics-Aufruf), hätte sie von Anfang an nicht
  funktioniert, und die Ursache wäre weit weg von der neuen Zeile gelegen.

  Dazu kommt: der Fehler betrifft nur einen von zwei Listenern auf denselben
  Buttons. Ein kaputter Listener neben einem funktionierenden ist von außen
  grundsätzlich nicht unterscheidbar von "alles in Ordnung".

  ## Demo 5 — Vollständiger Durchgang & Reflexion

Systematisch durchgetestet: Dashboard-Statistiken · Evidence Suche/Filter/
Sortierung/Bookmark/Detail/Notizen · People- und Locations-Tabs samt
Querverweisen · Timeline mit Sortierung, Filtern und Evidence-Links · Workspace
(Bookmarks, Notizen, Hypothesen-Formular, Reload-Persistenz).

Zusätzlich abseits des normalen Gebrauchs: Reload zu verschiedenen Zeitpunkten
und in verschiedenen Ansichten, Netzwerkdrosselung (Regular 3G / GPRS),
einzelne Anfragen im Netzwerk-Tab blockiert, localStorage im Web-Speicher von
Hand verändert und mit ungültigem JSON überschrieben, Klick auf den bereits
aktiven Reiter, leere Eingaben.

Bereits in Demo 2, 3 und 4 behandelt und hier nicht wiederholt: wirkungslose
Sortierung, dauerhaft leere Evidence-Liste, TypeError bei Nav-Klicks.

### Bug 5.1 — Timeline zeigt "[object Object]" statt des Ortsnamens

**Reproduktion:** Reiter "Timeline" öffnen, auf die graue Meta-Zeile unter der
Ereignisbeschreibung schauen.
**Erwartet:** `Location: L01 - Human-Robot Interaction Laboratory`
**Tatsächlich:** `Location: [object Object]`

**Root Cause:** `js/views/timeline.js`, in `renderTimeline`:
`eventLocationNames.push(evtLoc || item.locationIds[el])`. `findLocationById`
liefert das vollständige Ort-Objekt; beim Zusammensetzen des HTML wird es
implizit in einen String umgewandelt, was bei einem einfachen Objekt
`[object Object]` ergibt. Das `||` war als Fallback gedacht, aber sein erster
Zweig ist kein darstellbarer Wert. `renderEvidenceDetail` macht es richtig
(`loc.id + " - " + loc.name`) — die App enthält beide Varianten nebeneinander.

**Fix:** `eventLocationNames.push(evtLoc ? evtLoc.id + " - " + evtLoc.name : item.locationIds[el])`

**Warum kein Konsolenfehler:** `[object Object]` ist das korrekte Ergebnis der
Standard-String-Umwandlung, kein Fehler. Nur durch Hinschauen zu finden — das
Gegenstück zu Demo 4, wo die Oberfläche fehlerfrei aussah.

**Verifiziert:** Alle Ereignisse mit Ort zeigen lesbare Namen; Ereignisse ohne
Ort zeigen weiterhin keine Location-Zeile.

### Bug 5.2 — Workspace zeigt nach einem Reload keine Bookmarks und Notizen

**Reproduktion (DevTools → Netzwerkanalyse → "Regular 3G"):**
1. Evidence-Reiter, ein Beweisstück mit dem Stern markieren
2. Auf Workspace wechseln → der Eintrag steht unter "Bookmarked Evidence"
3. F5, während Workspace aktiv ist
4. → "No bookmarked evidence yet", obwohl der Web-Speicher `["E14"]` enthält
5. Erneut auf "Workspace" klicken → keine Wirkung
6. Auf Evidence wechseln (Stern ist gefüllt) und zurück → erst jetzt erscheint er

**Root Cause — zwei Ursachen zusammen:**

(a) Beim Reload mit `#workspace` läuft `handleHashChange`, sobald `loadAllData()`
aufgelöst ist. `loadAllData` wartet aber nur auf `case.json`, `people.json` und
`locations.json`; `evidence.json` lädt parallel. `renderBookmarksList` filtert
also über ein leeres `allEvidence`. Wenn die Daten eintreffen, zeichnet
`loadEvidenceData` Dashboard, Evidence-Liste und Dropdowns nach — den Workspace
nicht.

(b) `navigateTo` setzt nur `window.location.hash`. Ist der Hash bereits der
Zielwert, feuert der Browser kein `hashchange`-Ereignis. Da das Neuzeichnen
ausschließlich daran hängt, bleibt ein Klick auf den aktiven Reiter wirkungslos —
man kommt aus dem leeren Zustand nicht heraus.

**Fix:**
1. `js/api.js`: in `loadEvidenceData` zusätzlich
   `if (currentPage === "workspace") renderWorkspace();`, analog zu den bereits
   vorhandenen Nachzeichnungen für Evidence und Timeline
2. `js/main.js`: der `data-navigate`-Listener prüft, ob der Hash schon auf dem
   Ziel steht, und ruft in dem Fall `handleHashChange()` direkt auf

**Verifiziert:** Mit Drosselung erscheinen Bookmarks und Notizen nach dem Reload,
sobald der Ladebildschirm verschwindet. Klick auf den aktiven Reiter zeichnet neu.

**Warum ohne Drosselung schwer zu finden:** Lokal sind alle JSON-Dateien in
Millisekunden da, und je nach Reihenfolge tritt der Fehler auf oder nicht. In
meinen Tests mal so, mal so — reproduzierbar erst durch die Netzwerkdrosselung.
Genau die Art Fehler, die in Produktion bei langsamen Verbindungen jeden trifft
und auf localhost nie auffällt.

### Bug 5.3 — Ladebildschirm verschwindet, bevor die Beweisstücke geladen sind

**Reproduktion:** DevTools → Netzwerkanalyse → "Cache deaktivieren" und
"Regular 3G" → Strg+Shift+R → auf die Dashboard-Kachel "Evidence items" schauen.
Der Ladebildschirm verschwindet, während dort noch **0** steht; erst danach
springt die Zahl auf 18. "Review progress" zeigt kurz 0 %.

Deterministische Variante: Im Netzwerk-Tab Rechtsklick auf `evidence.json` →
"URL blockieren" → neu laden. Der Ladebildschirm verschwindet trotzdem, das
Dashboard bleibt dauerhaft bei 0, die Evidence-Liste leer.

**Root Cause:** `js/api.js` zählt mit `loadingStepsRemaining` herunter; bei 0
wird der Ladebildschirm ausgeblendet. Der Zähler stand auf **2**, es gibt aber
**drei** Ladevorgänge:

| Ladevorgang | meldet sich ab? |
|---|---|
| `loadCorePeopleAndLocations` | ja, im innersten `.then()` |
| `loadTimelineData` | ja, im `.finally()` |
| `loadEvidenceData` | **nein** |

Der Zähler wurde passend zu den zwei vorhandenen Aufrufen gesetzt, statt den
fehlenden dritten zu ergänzen. Der Ladebildschirm meldet damit "fertig", während
ein Drittel der Daten noch unterwegs ist.

**Fix:** `loadingStepsRemaining` an beiden Stellen auf 3, und `loadEvidenceData`
bekommt ein `.finally(function () { hideLoadingStep(); })` — wie
`loadTimelineData` es bereits hat.

**Warum `.finally` und nicht `.then`:** Scheitert das Laden, muss der
Ladebildschirm trotzdem verschwinden, sonst friert die App darin ein. Ein `.then`
hätte einen Bug durch einen schlimmeren ersetzt.

**Verifiziert:** (1) Mit Drosselung bleibt der Ladebildschirm, bis das Dashboard
beim ersten Erscheinen 18 zeigt. (2) Mit blockiertem `evidence.json` verschwindet
er trotzdem, die Fehlermeldung aus dem `catch` erscheint, die App bleibt bedienbar.

### Bug 5.4 — Konsole gibt ein Promise statt des Notiztextes aus

**Reproduktion:** Konsole öffnen, Seite neu laden.
**Erwartet:** `First note preview:` gefolgt vom Notiztext für E01
**Tatsächlich:** `First note preview: Promise { <state>: "fulfilled", <value>: "" }`

Verschärfte Variante: Für E01 eine Notiz speichern und neu laden — die Notiz
steht im Web-Speicher, die Konsole zeigt trotzdem das Promise-Objekt.

**Root Cause:** `loadNoteAsync` in `js/storage.js` gibt ein Promise zurück. In
`js/main.js` wurde der Rückgabewert direkt geloggt:

```js
const firstNote = loadNoteAsync("E01");
console.log("First note preview:", firstNote);
```

Damit wird die Quittung ausgegeben, nicht der Wert. Derselbe Fehlertyp wie in
Demo 3: etwas, das an einem Promise hängt, wird behandelt, als wäre es bereits
fertige Daten.

**Fix:** `loadNoteAsync("E01").then(function (firstNote) { console.log(...); });`

**Verifiziert:** Konsole zeigt `First note preview: <empty string>` bzw. den
gespeicherten Notiztext. Kein `Promise {...}` mehr.

**Anmerkung:** Dieser Bug war der zweite Kandidat für Demo 4 — kein sichtbarer
Effekt, nur eine falsche Konsolenausgabe. Gewählt wurde dort der `var i`-Bug,
weil er ein echter Laufzeitfehler ist.

### Bug 5.5 — Kaputte Notizen im localStorage verhindern den Start (nicht behoben)

**Reproduktion:** Web-Speicher → `remotion_notes` → Wert durch `kaputt` ersetzen
→ neu laden. Die App startet nicht mehr, in der Konsole steht ein
`SyntaxError` aus `JSON.parse`. Dieselbe Manipulation an `remotion_bookmarks`
hat **keine** Folgen — die App startet mit leerer Bookmark-Liste.

**Root Cause:** `loadBookmarksFromStorage` in `js/storage.js` hat `try/catch` und
zusätzlich `Array.isArray`; `loadNotesFromStorage` direkt darunter hat beides
nicht und ruft `JSON.parse(raw)` ungeschützt auf. Zwei Funktionen mit demselben
Zweck, unterschiedlich sorgfältig geschrieben.

**Bewusst nicht behoben**, weil Demo 7 genau diese Manipulation als
Live-Vorführung verlangt ("Replace a value with text that isn't valid JSON and
see what happens"). Der Fix wäre derselbe `try/catch`-Block wie bei den Bookmarks.

### Bug 5.6 — Kein `res.ok`-Check vor `res.json()` (nicht behoben)

**Reproduktion:** Netzwerk-Tab → Rechtsklick auf `timeline.json` → "URL
blockieren" → neu laden. Der Fehler landet im `catch`, aber nur als
`console.log`, ohne Hinweis für den Benutzer; die Timeline bleibt kommentarlos
leer. Bei einem echten 404 (Datei umbenannt) würde `res.json()` die HTML-
Fehlerseite zu parsen versuchen.

**Root Cause:** Alle drei Ladefunktionen rufen `res.json()` auf, ohne vorher
`res.ok` zu prüfen. `fetch` wirft bei einem HTTP-Fehlerstatus nicht — ein 404
ist für `fetch` eine erfolgreich beantwortete Anfrage. Der Fehler entsteht erst
beim Parsen, mit einer irreführenden Meldung.

Zusätzlich behandeln die drei `catch`-Blöcke denselben Fall unterschiedlich:
`console.error` plus `alert` bei Evidence, nur `console.log` bei der Timeline,
und in `loadCorePeopleAndLocations` gibt es gar keinen `catch`.

**Bewusst nicht behoben** — Demo 7 fragt nach dem *aktuellen* Verhalten bei einem
404. Der Fix wäre
`if (!res.ok) throw new Error("HTTP " + res.status)` vor jedem `res.json()`
sowie eine einheitliche Fehlerbehandlung.

### Für die Live-Präsentation gewählt

**Bug 5.1** (Timeline `[object Object]`). Symptom in zwei Sekunden sichtbar,
Ursache in einem Satz erklärbar, Fix eine Zeile.

Vorführung:
```bash
git checkout demo-4-done    # Zustand vor dem Fix
# Timeline öffnen -> "Location: [object Object]"
git checkout main
# Timeline öffnen -> "Location: L01 - Human-Robot Interaction Laboratory"
git diff demo-4-done main -- js/views/timeline.js
```

## Fragen zu Demo 5

### Live-Walkthrough des gewählten Bugs

Siehe Bug 5.1. Auslösender Zustand: keiner — der Fehler tritt bei jedem Öffnen
der Timeline auf, für jedes Ereignis mit hinterlegtem Ort. Keine besondere
Vorgeschichte, kein Timing, keine gespeicherten Daten nötig.

### Hat das Beheben eines Bugs einen anderen verändert, aufgedeckt oder
### versehentlich mitbehoben?

**Ja, zweimal, und beide Male aufdeckend statt behebend.**

*Fall 1 — Demo 3 deckte Demo 2 auf.* Solange `evidenceViewLoading` nie
zurückgesetzt wurde, verließ `renderEvidenceList` die Funktion sofort mit
`return`; die Evidence-Ansicht blieb leer. Dadurch war der Sortier-Bug nicht
auslösbar — bei null Karten gibt es keine Reihenfolge zu beobachten. Erst nach
dem Demo-3-Fix erschienen die 18 Karten, und beim Durchprobieren der
Sortier-Optionen zeigte sich, dass keine von ihnen etwas bewirkt. Der zweite
Bug lag also nicht im selben Code, sondern war schlicht hinter dem ersten
*versteckt*.

*Fall 2 — Demo 3 deckte 5.2 und 5.3 auf.* Beide betreffen die Reihenfolge, in
der Daten ankommen und Ansichten gezeichnet werden. Solange die Evidence-Ansicht
generell leer war, fiel nicht auf, dass sie manchmal *zu spät* gefüllt wird.

**Beinahe-Fall, bewusst vermieden:** Beim Modul-Split in Demo 1 wurde `var`
weitgehend durch `let`/`const` ersetzt. Die Schleife in `setupEventListeners`
blieb absichtlich unverändert und mit einem Kommentar markiert, weil `let` dort
den Demo-4-Bug stillschweigend mitbehoben hätte. Ein Refactoring hätte also fast
einen Bug beseitigt, ohne dass jemand ihn je gesehen oder verstanden hätte.

**Wie ich die Isolation der übrigen Fixes bestätigt habe:** Jeder Fix bekam einen
eigenen Commit, und nach jedem wurde die vollständige Testrunde erneut
durchlaufen (alle fünf Ansichten, Konsole offen, einmal mit Drosselung).
Vergleichsgrößen dabei: 18 Karten, Dashboard-Zahlen 18/6/6, Konsole ohne Fehler,
Bookmarks und Notizen überstehen den Reload. So war nach jedem Schritt belegt,
dass die bereits behobenen Bugs behoben blieben und keine neuen dazukamen.

## Demo 8 — Clean Coding: Globals, var/let/const, Code Smells

### Alle top-level `var` im ursprünglichen `app.js`

19 Stück, alle im globalen Scope und damit von jeder der 1085 Zeilen les- und
schreibbar.

| # | Variable | nach dem Split |
|---|---|---|
| 1 | `allEvidence` | `state.js`, geteilt |
| 2 | `filteredEvidence` | `state.js`, geteilt |
| 3 | `selectedEvidence` | privat in `views/evidence.js` |
| 4 | `bookmarks` | `state.js`, geteilt |
| 5 | `currentPage` | `state.js`, geteilt |
| 6 | `allPeople` | `state.js`, geteilt |
| 7 | `allLocations` | `state.js`, geteilt |
| 8 | `allTimeline` | `state.js`, geteilt |
| 9 | `caseData` | `state.js`, geteilt |
| 10 | `currentPeopleTab` | privat in `views/people.js` |
| 11 | `loadingStepsRemaining` | privat in `api.js` |
| 12 | `evidenceViewLoading` | privat in `views/evidence.js` |
| 13 | `viewRendered` | `state.js`, geteilt (als `const`) |
| 14 | `notesStore` | `state.js`, geteilt |
| 15 | `modalCloseListenerCount` | privat in `views/timeline.js` |
| 16 | `STORAGE_KEY_BOOKMARKS` | privat in `storage.js` |
| 17 | `STORAGE_KEY_NOTES` | privat in `storage.js` |
| 18 | `STORAGE_KEY_HYPOTHESIS` | `storage.js`, exportiert |
| 19 | `latestSearchRequestId` | privat in `views/evidence.js` |

### Kollisionsrisiko — drei Beispiele

**`currentPage`** ist der gefährlichste Name der Liste: generisch, kurz, und in
jeder zweiten Web-App vorhanden. Würde jemand eine Paginierung für die
Evidence-Liste ergänzen und dort ebenfalls `var currentPage = 1` schreiben, gäbe
es keinen Fehler und keine Warnung — die zweite Deklaration überschreibt die
erste stillschweigend. Ab dem ersten Seitenwechsel der Paginierung stünde in
`currentPage` eine Zahl, und `handleHashChange` würde die falsche Ansicht
auswählen. Der Fehler würde in der Navigation sichtbar, die Ursache läge in der
Paginierung.

*Durch den Modul-Split gelöst:* `currentPage` lebt nur in `state.js`. Ein
Paginierungs-`currentPage` in `views/evidence.js` wäre eine völlig andere
Variable, auch bei identischem Namen.

**`bookmarks`** ist ebenso generisch. Ein zweites `bookmarks` — etwa für
gemerkte Personen statt Beweisstücke — würde dasselbe Array überschreiben.
Schlimmer: `saveBookmarksToStorage` würde weiterlaufen und den falschen Inhalt
nach `remotion_bookmarks` schreiben. Der Datenverlust wäre nach dem Reload
dauerhaft.

*Gelöst:* nur `state.js` deklariert `bookmarks`; nur `storage.js` und
`views/evidence.js` importieren es, sichtbar an den `import`-Zeilen.

**`loadingStepsRemaining`** zeigt die andere Seite des Problems. Der Name ist
spezifisch genug, dass eine Kollision unwahrscheinlich ist — aber im globalen
Scope konnte **jede** Zeile ihn verändern. Genau hier saß Bug 5.3: der Zähler
stand auf 2 statt 3. Solange die Variable global ist, muss man zur Fehlersuche
die ganze Datei durchsehen; jetzt ist der Suchraum `api.js` mit 110 Zeilen, und
der Zugriff ist auf drei Funktionen beschränkt, die alle privat sind.

*Was der Modul-Split NICHT löst:* Innerhalb eines Moduls sind geteilte Variablen
weiterhin für alle Funktionen dieses Moduls erreichbar. `views/evidence.js` hat
mit ~360 Zeilen und drei privaten Zustandswerten immer noch eine spürbare
Angriffsfläche — nur eben eine um den Faktor drei kleinere.

### `var` → `const`/`let`

Vollständig durchgezogen: im Projekt existiert kein `var` mehr
(`grep -rn "\bvar \b" js/` liefert nichts).

Entscheidungsregel: **`const` als Standard, `let` nur wenn neu zugewiesen wird.**
Konkret heißt das:

- `const` für alle DOM-Referenzen (`const container = document.getElementById(...)`),
  für Zwischenergebnisse (`const results = []` — der Inhalt ändert sich, die
  Variable nicht) und für Schleifenobjekte (`const item = allEvidence[i]`)
- `let` für Schleifenzähler (`let i`), für aufsummierte Werte
  (`let reviewedCount`), für schrittweise aufgebaute Strings (`let html = ""`)
  und für Zustand, der ersetzt wird (`let evidenceViewLoading`)

`const results = []` gefolgt von `results.push(...)` ist dabei kein Widerspruch:
`const` verbietet die Neuzuweisung der Variablen, nicht die Veränderung ihres
Inhalts — dasselbe Prinzip wie bei `viewRendered` in `state.js`.

Der größte Teil dieser Umstellung geschah bereits beim Modul-Split (Demo 1), weil
der Code dabei ohnehin Zeile für Zeile angefasst wurde. Eine Stelle blieb
absichtlich zurück (siehe unten).

### Code Smell 1 — Inline-Handler zur Laufzeit gesetzt

`js/main.js` enthielt zwei Zeilen für dasselbe Element und dasselbe Ereignis:

```js
document.getElementById("filterStatus").addEventListener("change", renderEvidenceList);
document.getElementById("filterStatus").setAttribute("onchange", "renderEvidenceList()");
```

Die zweite setzt per JavaScript ein Inline-Attribut — genau das, was in Demo 1 aus
`index.html` entfernt wurde, nur im Code versteckt und deshalb bei der Textsuche
im HTML unauffindbar.

**Warum schlecht:** Attribut-Handler werden im globalen Scope ausgewertet;
Modul-Funktionen sind nicht global. Bei jeder Änderung des Statusfilters
erscheint in der Konsole:
Uncaught ReferenceError: renderEvidenceList is not defined

Der Filter funktioniert trotzdem, weil der `addEventListener` eine Zeile darüber
die Arbeit macht. Also: funktionierender Code, der bei jeder Benutzung einen
Fehler produziert — und zusätzlich zwei konkurrierende Mechanismen für dieselbe
Aufgabe, was jeden späteren Leser verwirrt.

**Fix:** Zeile ersatzlos entfernt.

**Verifiziert:** Statusfilter durchgeschaltet — Filter arbeitet weiter, Konsole
bleibt sauber.

### Code Smell 2 — Derselbe Listener doppelt registriert

`js/main.js` registrierte `handleHashChange` zweimal auf `hashchange`: einmal in
`setupEventListeners`, einmal am Dateiende.

**Warum schlecht:** Bei jedem Ansichtswechsel läuft die komplette Routing-Logik
doppelt — DOM-Abfragen, Klassenwechsel, gegebenenfalls ein Render. Sichtbar ist
nichts, weil `handleHashChange` idempotent ist. Genau das macht es tückisch: ein
Leser kann nicht erkennen, ob die zweite Registrierung Absicht war, und traut
sich nicht, sie zu entfernen. Bei einer teureren Render-Funktion wäre daraus ein
Performance-Problem geworden.

**Fix:** Die Registrierung am Dateiende entfernt; die in `setupEventListeners`
bleibt, weil dort alle Listener gebündelt sind.

**Verifiziert:** Alle fünf Ansichten durchgeklickt, Navigation unverändert.

### Weitere erkannte, nicht behobene Smells

Für die Vollständigkeit notiert; nicht behoben, weil sie für andere Demos
gebraucht werden oder über einen reinen Aufräum-Commit hinausgehen:

| Smell | Datei | warum offen |
|---|---|---|
| `loadNotesFromStorage` ohne `try/catch`, `loadBookmarksFromStorage` mit | `storage.js` | Live-Vorführung in Demo 7 |
| `res.json()` ohne `res.ok`-Prüfung, drei unterschiedliche `catch`-Behandlungen | `api.js` | Demo 7 fragt nach dem aktuellen Verhalten |
| `selectedEvidence` und `currentPeopleTab` werden gesetzt, aber nie gelesen | evidence / people | toter Zustand, reine Aufräumarbeit |
| `loadNoteForEvidence` und `loadNoteAsync` liefern denselben Wert, einmal synchron, einmal als Promise | `storage.js` | wird in Demo 9 gebraucht |
| `evidenceMentionsPerson` sucht in `personIds` zusätzlich nach `person.name`, obwohl dort nur IDs stehen | `utils.js` | Verhalten unklar, Änderung wäre kein reines Aufräumen |
| `renderEvidenceList` registriert bei jedem Aufruf erneut einen Klick-Listener auf dem Container | `views/evidence.js` | Listener häufen sich an; Fix gehört inhaltlich zu einem eigenen Bug |

## Fragen zu Demo 8

### `var` / `let` / `const`: Scope und Reassignment

**Scope:** `var` ist function-scoped — eine Deklaration irgendwo in einer Funktion
gilt für die ganze Funktion, auch in Blöcken darüber. `let` und `const` sind
block-scoped: sie gelten nur zwischen den geschweiften Klammern, in denen sie
stehen, also auch pro Schleifendurchlauf einzeln.

**Reassignment:** `var` und `let` erlauben Neuzuweisung, `const` nicht. `const`
verbietet dabei nur die Neuzuweisung der *Variablen*, nicht die Veränderung des
*Inhalts*: `const arr = []; arr.push(1)` ist erlaubt, `arr = [1]` nicht.

**Hoisting:** `var`-Deklarationen werden an den Funktionsanfang gezogen und mit
`undefined` vorbelegt — ein Zugriff davor liefert `undefined` statt eines
Fehlers. `let` und `const` existieren zwar auch schon, sind aber bis zur
Deklaration gesperrt (temporal dead zone); ein Zugriff davor wirft einen
`ReferenceError`.

**Konkreter Bug aus diesem Projekt** (Demo 4), `js/main.js`:

```js
for (var i = 0; i < navButtons.length; i++) {
  navButtons[i].addEventListener("click", function () {
    var targetView = navButtons[i].getAttribute("data-view");   // i ist 5
  });
}
```

Durch `var` gibt es **ein einziges `i`** für die gesamte Funktion. Die fünf
Callbacks merken sich keinen Wert, sondern greifen auf dieselbe Variable zu.
Nach dem letzten Durchlauf steht `i` auf 5; beim Klick liest der Callback
`navButtons[5]` — es gibt nur 0 bis 4 — und erhält `undefined`.
`undefined.getAttribute(...)` wirft.

Mit `let i` bekommt jeder Durchlauf seine eigene Bindung, die der jeweilige
Callback festhält. Der Bug ist damit nicht behoben, sondern **von vornherein
unmöglich**.

Diese Stelle wurde beim Modul-Split in Demo 1 bewusst als einzige nicht
umgestellt und im Code mit einem Kommentar markiert — sonst wäre der Bug
verschwunden, bevor ihn jemand gesehen hätte.

### Was ist ein "accidental global"?

Eine Zuweisung ohne Deklarationsschlüsselwort:

```js
function berechne() {
  ergebnis = 42;        // kein var/let/const
}
```

Im non-strict mode erzeugt JavaScript daraus stillschweigend eine **globale**
Variable — sie überlebt die Funktion, ist von überall sichtbar und kann
gleichnamige Variablen anderer Programmteile überschreiben. Kein Fehler, keine
Warnung. Ein Tippfehler in einem Variablennamen (`ergebniss = 42`) erzeugt auf
diesem Weg eine zweite Variable, während die eigentliche unverändert bleibt.

**In ES-Modulen** — und die App besteht seit Demo 1 ausschließlich daraus —
gilt automatisch strict mode. Dieselbe Zeile wirft dann:
ReferenceError: ergebnis is not defined

Der Fehler tritt sofort und an der richtigen Stelle auf, statt später und
woanders. Der Modul-Split hat diese Fehlerklasse also nicht nur unwahrscheinlicher
gemacht, sondern vollständig beseitigt.

Denselben Unterschied habe ich beim Konsolentest zu `state.js` gesehen: In der
DevTools-Konsole (non-strict) scheiterte `s.allEvidence = []` **lautlos** — der
Ausdruck gab den zugewiesenen Wert zurück, obwohl nichts passiert war. Derselbe
Code in einem Modul wirft `TypeError: "allEvidence" is read-only`.

### "Funktioniert" vs. "ist sauber" — ein konkretes Beispiel

`setAttribute("onchange", "renderEvidenceList()")` aus Smell 1. Der Statusfilter
hat korrekt gefiltert; ein Benutzer hätte nie etwas bemerkt.

**Die realen Kosten der unsauberen Version:**

*Fehlerrauschen.* Bei jeder Filteränderung ein roter Eintrag in der Konsole.
Wer später einen echten Bug sucht, muss diesen Fehler erst als "bekannt und
harmlos" einordnen — oder er gewöhnt sich an rote Konsolen und übersieht den
nächsten echten Fehler. Beides kostet Zeit.

*Bug-Risiko bei der nächsten Änderung.* Zwei konkurrierende Mechanismen auf
demselben Element. Entfernt jemand den `addEventListener` in der Annahme, das
`onchange`-Attribut übernehme die Arbeit, ist der Filter tot — und die
Fehlersuche führt zu einer Zeile, die seit Monaten unverändert im Code steht.

*Einarbeitungszeit.* Ein neuer Entwickler sieht zwei Zeilen, die dasselbe tun
sollen, und muss herausfinden, ob das Absicht ist. Diese Frage kostet ihn ein
paar Minuten und im Zweifel eine Rückfrage — multipliziert mit jeder solchen
Stelle im Projekt.

*Review-Aufwand.* Eine Codeänderung an dieser Stelle zwingt den Reviewer, beide
Mechanismen im Kopf zu halten, statt nur einen.

Der Aufwand für den Fix war eine gelöschte Zeile.

## Demo 10 — Arrow Functions

**Konvertiert:**

| Funktion | Datei | warum guter Kandidat |
|---|---|---|
| `findEvidenceById`, `findPersonById`, `findLocationById` | `utils.js` | for-Schleife → `.find()`, je 6 Zeilen auf 1 |
| `evidenceMentionsPerson` | `utils.js` | reine Prädikatsfunktion ohne `this` |
| `getStatusBadgeClass`, `getRelevanceBadgeClass` | `utils.js` | reine Übersetzer |
| `statCardHTML` | `views/dashboard.js` | ein Ausdruck, implizites return |
| `certaintyBadgeClass` | `views/timeline.js` | reine Übersetzung |
| anonymer `input`-Callback | `main.js` | Aufgabe 2 |

**Bewusst nicht konvertiert:** `initApp` und `setupEventListeners` in `main.js`.

**Verifiziert:** Alle fünf Ansichten, Filter, Sortierung, Timeline, Workspace
unverändert; Konsole ohne neue Fehler. Besonders geprüft: `findPersonById` mit
unbekannter ID gibt weiterhin `null`, nicht `undefined`.

### Fragen

- **`this` in Arrow Functions vs. normalen Funktionen.**
  Eine normale Funktion bekommt ihr eigenes `this`, bestimmt davon, *wie* sie
  aufgerufen wird: als Methode zeigt es auf das Objekt, als Listener auf das
  Element, sonst auf `undefined` (strict mode). Eine Arrow Function hat **kein
  eigenes `this`** — sie übernimmt das der umgebenden Stelle, und zwar dort, wo
  sie geschrieben steht, nicht wo sie aufgerufen wird.

  Als Objektmethode ist das riskant: `const obj = { name: "x", getName: () => this.name }`
  greift nicht auf `obj` zu, sondern auf das `this` des umgebenden Scopes — auf
  Modulebene `undefined`. Als Callback ist es dagegen meist erwünscht, weil man
  sonst mit `.bind(this)` oder einer Hilfsvariable arbeiten müsste.

  **Befund in diesem Projekt:** `this` kommt im gesamten Code kein einziges Mal
  vor (`grep -rn "\bthis\b" js/` liefert nur Treffer in Kommentaren und einem
  Platzhaltertext). Es gibt keine Klassen und keine Objektmethoden. Die Umstellung
  war deshalb in dieser Hinsicht gefahrlos — und genau deshalb musste die
  Begründung für die *nicht* konvertierte Funktion über Hoisting laufen statt
  über `this`.

- **Kein `new`, kein eigenes `arguments` — hat das eine Konvertierung verhindert?**
  Nein, in diesem Projekt nicht. `new` kommt nur bei eingebauten Typen vor
  (`new Date(...)`, `new Promise(...)`); keine eigene Funktion wird als
  Konstruktor benutzt. `arguments` wird nirgends verwendet — alle Funktionen haben
  feste benannte Parameter. Beide Einschränkungen waren also irrelevant.

- **Hoisting — hat das eine Rolle gespielt? Ja, an zwei Stellen.**

  *Verhindernd:* `main.js` endet mit
  `window.addEventListener("DOMContentLoaded", initApp);`. Diese Zeile wird
  **während der Modul-Auswertung** ausgeführt. Als Funktionsdeklaration ist
  `initApp` gehoistet und die Position im File egal; als `const`-Arrow wäre die
  Reihenfolge tragend. Nachgewiesen mit einem Minimalbeispiel:

  const-Arrow, Referenz oberhalb der Deklaration:
ReferenceError: Cannot access 'initApp' before initialization
function-Deklaration, gleiche Anordnung:
läuft durch


  Heute steht die Deklaration oberhalb, es würde also auch so funktionieren — aber
  eine spätere Umsortierung der Datei würde den Start der App brechen, und der
  Fehler träte weit entfernt von der eigentlichen Änderung auf. Deshalb bleibt es
  eine Funktionsdeklaration.

  *Toleriert:* `statCardHTML` (dashboard.js) und `certaintyBadgeClass`
  (timeline.js) werden jeweils **oberhalb** ihrer Deklaration verwendet — in
  `renderDashboard` bzw. `renderTimeline`. Das funktioniert, weil diese
  Render-Funktionen erst nach der Modul-Auswertung aufgerufen werden und die
  temporal dead zone dann längst vorbei ist. Die Umstellung ist also korrekt,
  macht aber die Reihenfolge im File von "egal" zu "heute unkritisch". Als
  Konsequenz würde ich in einer echten Codebasis die Hilfsfunktionen vor ihre
  Verwendung setzen, sobald sie `const`-Arrows sind.

- **Konkretes Before/After, mit Laufzeitunterschied?**

```js
  // vorher
  export function findPersonById(id) {
    for (let i = 0; i < allPeople.length; i++) {
      if (allPeople[i].id === id) return allPeople[i];
    }
    return null;
  }

  // nachher
  export const findPersonById = (id) => allPeople.find((person) => person.id === id) || null;
```

  **Verhaltensunterschiede, die es zu beachten gab:**

  1. `.find()` liefert bei keinem Treffer `undefined`, die Schleife lieferte
     `null`. Ohne `|| null` wäre das eine echte Verhaltensänderung gewesen —
     `null` und `undefined` verhalten sich bei `if (!x)` zwar gleich, aber bei
     `x === null` nicht. Mit `|| null` ist das Verhalten identisch.
  2. Die Arrow Function hat kein eigenes `this` und kein `arguments`. Da beides
     hier nicht benutzt wurde, ohne Folgen.
  3. Hoisting: siehe oben, an dieser Stelle unkritisch.

  Davon abgesehen ist es reine Lesbarkeit. Die Schleife und `.find()` machen
  dasselbe; `.find()` bricht ebenfalls beim ersten Treffer ab. Laufzeitmäßig ist
  kein Unterschied messbar, schon gar nicht bei sechs Personen.

- **Vorgeschlagene Team-Regel.**

  *Funktionsdeklarationen* (`function name() {}`) für alles, was auf Modulebene
  steht und exportiert oder als Einstiegspunkt dient — also die `render*`-,
  `load*`- und `handle*`-Funktionen. Begründung: sie sind gehoistet, wodurch die
  Reihenfolge im File nie tragend wird, sie erscheinen mit ihrem Namen im Call
  Stack, und sie heben sich optisch von den Hilfsfunktionen ab.

  *Arrow Functions* für Callbacks (`.map`, `.filter`, `.find`, `.sort`,
  `addEventListener`) und für kurze Hilfsfunktionen ohne eigenen Zustand.
  Begründung: weniger Rauschen, implizites return bei Einzeilern, und kein
  eigenes `this` — bei Callbacks genau das gewünschte Verhalten.

  *Nie* eine Arrow Function als Objektmethode oder dort, wo `this` oder
  `arguments` gebraucht wird.

  Die Regel lässt sich in einem Satz prüfen: **Steht der Name im Call Stack und
  soll die Position im File egal sein? Dann `function`. Ist es ein Argument an
  eine andere Funktion? Dann Arrow.**
