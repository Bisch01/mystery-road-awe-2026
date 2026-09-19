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