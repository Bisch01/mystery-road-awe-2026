# Architektur der React-Variante

Stand: Exercise 4. Die React-Variante liegt unter `js/react/` und wird über
den URL-Schalter `?react=1` gestartet (siehe `js/main.ts`). Evidence und
Workspace laufen weiterhin als Vanilla-TypeScript.

## Ordnerstruktur

```
js/react/
  mount.tsx                     React-Einstiegspunkt (createRoot)
  App.tsx                       Wurzelkomponente

  app/                          Anwendungsrahmen, featureübergreifend
    AppShell.tsx                Header + Navigation + aktive Seite + Footer
    routes.ts                   Routen-Liste, RouteId-Typ, Labels
    useHashRoute.ts             Hash-Router als Hook
    components/
      AppHeader.tsx
      MainNav.tsx
      AppFooter.tsx

  features/                     je Fachbereich ein Ordner
    dashboard/
      DashboardPage.tsx         Feature-Komponente
      components/               nur vom Dashboard verwendet
        CaseSummaryCard.tsx
        StatGrid.tsx
        StatCard.tsx
        ReviewProgressPanel.tsx
        RecentEvidenceList.tsx
        RecentTimelineList.tsx
        MiniListItem.tsx
        Panel.tsx
    people-locations/
      PeoplePage.tsx
      components/
        PersonCard.tsx
        LocationCard.tsx
        PersonAvatar.tsx
    timeline/
      TimelinePage.tsx
      components/
        TimelineList.tsx
        TimelineEventItem.tsx
        EventLocations.tsx
        EventPeople.tsx
        MetaLine.tsx
    evidence/
      EvidencePage.tsx          Platzhalter, Migration in Exercise 5
    workspace/
      WorkspacePage.tsx         Platzhalter, Migration in Exercise 5

  shared/                       nur, was mehrere Features wirklich nutzen
    components/
      Badge.tsx                 Dashboard + Timeline
      Card.tsx                  People & Locations + Dashboard
    data/
      useCaseData.ts            alle drei migrierten Seiten
```

## Zwei Dimensionen, nicht eine

Die Struktur ordnet nach **Fachbereich** (wo liegt die Datei), nicht nach
Dateityp. Davon unabhängig ist die **Verantwortung** einer Komponente:

- **Feature-Komponente** – kennt Datenquellen, besitzt Zustand, koordiniert.
  In diesem Projekt: `App`, `AppShell`, `DashboardPage`, `PeoplePage`,
  `TimelinePage`.
- **Darstellende Komponente** – bekommt alles über Props und rendert.
  Alle übrigen.

Eine darstellende Komponente kann also durchaus in einem Feature-Ordner
liegen, wenn ihre Bedeutung zu diesem Feature gehört.

## Regel: shared oder feature-lokal?

> Eine Komponente bleibt im Feature-Ordner, solange sie **von genau einem
> Feature** verwendet wird. Sie wandert erst nach `shared/`, wenn ein
> **zweites Feature** sie tatsächlich braucht – nicht, weil sie allgemein
> klingt.

Begründung: Vorzeitiges Teilen erzeugt eine Prop-Schnittstelle voller
feature-spezifischer Ausnahmen. Ein Umzug nach `shared/` ist billig; eine
aufgeblähte, überall eingebundene Komponente zurückzubauen ist teuer.

### Anwendung in Exercise 4, Demo 6

Vier Komponenten lagen in `shared/components/`, obwohl sie nur **ein**
Feature benutzte. Sie wurden zurück in ihr Feature verschoben:

| Komponente     | verwendet von              | Entscheidung                              |
| -------------- | -------------------------- | ----------------------------------------- |
| `Badge`        | Dashboard **und** Timeline | bleibt `shared/components/`               |
| `Card`         | nur People & Locations     | → `features/people-locations/components/` |
| `Panel`        | nur Dashboard              | → `features/dashboard/components/`        |
| `StatCard`     | nur Dashboard              | → `features/dashboard/components/`        |
| `MiniListItem` | nur Dashboard              | → `features/dashboard/components/`        |
| `useCaseData`  | alle drei Seiten           | → `shared/data/`                          |

`MetaLine` wurde in Demo 5 neu angelegt und bewusst **nicht** in `shared/`
abgelegt: sie wird nur innerhalb der Timeline verwendet.

`Card` ist in Demo 7 nach `shared/components/` zurückgewandert – nicht als
Rücknahme der Regel, sondern als deren Anwendung: ein zweites Feature
braucht sie jetzt tatsächlich. Siehe nächster Abschnitt.

## Wiederverwendbares UI-Element: `Card` (Demo 7)

`Card` liefert ausschließlich die Karten-Hülle und nimmt keine Daten an:

```tsx
interface CardProps {
  className?: string;
  children: ReactNode;
}
```

Verwendet von zwei Features an vier Stellen:

| Aufrufer          | Feature          | `className`         |
| ----------------- | ---------------- | ------------------- |
| `PersonCard`      | people-locations | `person-card`       |
| `LocationCard`    | people-locations | `location-card`     |
| `Panel`           | dashboard        | `dashboard-panel`   |
| `CaseSummaryCard` | dashboard        | `case-summary-card` |

**Fest in der Komponente:** das `<div>`, die Basisklasse `card`, die
Komposition über `children`.

**Variabel über Props:** die Variantenklasse und der komplette Inhalt.

`Panel` braucht zusätzlich eine Überschrift. Diese liegt bewusst **nicht**
als `title`-Prop in `Card`, sondern in `Panel`, das `Card` umschließt –
sonst müssten `PersonCard` und `LocationCard` einen Prop mitschleppen, den
sie nie setzen. Genau so entsteht die von der Aufgabe gemeinte
„special-cased mess".

Dieselbe Grenze gilt bei `Badge`: `label` und `tone` sind Props, aber die
Zuordnung, welcher Status welchen Ton ergibt, liegt in `toneForStatus()`
und `toneForCertainty()` **außerhalb** der Komponente. Sonst müsste `Badge`
jeden Domänen-Typ des Projekts kennen.

### CSS

Die Dashboard-Varianten tragen jetzt zusätzlich die Klasse `card`. Damit ihr
eigenes Padding (18px statt 22px) weiterhin gewinnt, gibt es eine Regel mit
zwei Klassen und damit höherer Spezifität:

```css
.card.case-summary-card,
.card.dashboard-panel {
  padding: 18px;
  margin-bottom: 18px;
}
```

Der alte Block `.case-summary-card, .dashboard-panel { ... }` bleibt stehen,
weil die Vanilla-Variante diese Kästen ohne `card` rendert
(`js/views/dashboard.ts`). Die CSS-Doppelung ist also bewusst in Kauf
genommen und löst sich auf, sobald die Vanilla-Variante entfällt.

### Vergleich mit dem Original

Im ursprünglichen `app.js` (vor Exercise 1) wurde dieselbe Kasten-Hülle
fünfmal von Hand geschrieben, in vier leicht abweichenden Schreibweisen:
`renderPeople()` Zeile 663, `renderLocations()` Zeile 699 und
`renderDashboard()` Zeilen 244, 258, 266, 278. Die Stat-Karten waren in
`statCardHTML()` ausgelagert, die Karten-Hüllen nicht – es gab also keine
Regel, sondern Zufall.

Was die Komponente leistet, was der Template-String nicht konnte:

- Öffnendes und schließendes Tag sind strukturell untrennbar; ein
  vergessenes `</div>` war vorher ein stummer Layout-Fehler
- `className` ist typisiert und `children` ist Pflicht – `tsc` meldet jeden
  fehlerhaften Aufruf
- Eine Änderung der Kasten-Optik betrifft eine Datei statt fünf Stellen
- `children` sind React-Elemente statt konkatenierter Strings, Text wird
  escaped statt per `innerHTML` ausgeführt

## Route-Parameter: Personen-Detailseite (Demo 9)

Route: `/team/people/:personId`, Komponente `PersonDetailPage`, als Kindroute
von `/team` definiert. Dadurch bleiben Tab-Leiste, Überschrift und der
geladene Datenbestand der Layout-Route `TeamLayout` erhalten.

`useParams()` liefert `Record<string, string | undefined>`. Der Wert ist roher
Text aus der Adresse, nicht `PersonId` — der Router kennt die Domäne nicht.
Die Zuordnung zu einem Datensatz passiert in der Komponente:

```tsx
const { personId } = useParams();
const person = people.find((candidate) => candidate.id === personId);
if (!person) {
  /* Hinweis + Rücklink, bewusst keine Weiterleitung */
}
```

Passt die Kennung zu keiner Person, erscheint ein Hinweis mit Rücklink. Es
wird **nicht** auf `/team/people` umgeleitet, weil sich dieser Fall von der
Auffangroute `path="*"` unterscheidet: dort existiert die Adressform nicht,
hier existiert sie und nur der Datensatz fehlt.

Verlinkt wird von `PersonCard`: der Personenname ist ein `<Link>` auf
`personPath(person.id)`. Die Hilfsfunktion steht neben `ROUTE_PATHS`, damit
die Pfadform nur an einer Stelle definiert ist.

Die Detailseite zeigt zusätzlich `person.background` — ein Feld aus
`people.json`, das in der Vanilla-Variante nirgends dargestellt wird. Das ist
die inhaltliche Begründung für die eigene Route: es gibt Daten, die auf der
Karte keinen Platz haben.

## URL als Zustand: Query-Parameter auf der Timeline (Demo 10)

`/timeline?person=<id>` filtert die Ereignisliste beim ersten Rendern. Gelesen
wird der Wert mit `useSearchParams()`:

```tsx
const [searchParams] = useSearchParams();
const personParam = searchParams.get(PARAM_PERSON) ?? "";
```

`get()` liefert `string | null`. Es gibt **kein** `useState` für den Filter:
der Zustand steht in der Adresse und wird bei jedem Rendern neu gelesen, es
existiert also keine zweite Kopie, die auseinanderlaufen könnte.

Eine unbekannte Kennung wird **verworfen**, nicht als leere Liste dargestellt.
Das ist die Gegenentscheidung zu `/team/people/:personId`, wo eine unbekannte
Kennung einen Hinweis erzeugt: dort ist die Kennung die Identität der Seite,
hier nur eine Einstellung, und eine unbrauchbare Einstellung wird ignoriert.

Pfad- und Query-Parameter im Vergleich, beide im Projekt vorhanden:

|                       | `/team/people/nova-byte` | `/timeline?person=nova-byte` |
| --------------------- | ------------------------ | ---------------------------- |
| Bedeutung             | Identität der Seite      | Einstellung der Seite        |
| ohne den Wert         | andere Seite (Liste)     | dieselbe Seite, ungefiltert  |
| mehrere Werte möglich | nein                     | ja                           |
| unbekannter Wert      | Hinweis, kein Inhalt     | Filter verworfen             |

Die Bedienelemente in `TimelineToolbar` sind bewusst `disabled`. Sie zeigen den
Zustand, den die URL beschreibt, und niemand kann eine Auswahl treffen, die
wirkungslos bleibt. Verdrahtet werden sie in Exercise 5.

Verlinkt wird aus `PersonDetailPage` über `timelineForPerson(person.id)`.

## Abschluss Exercise 4: Stand der Migration

| View               | Variante | Route                                                       |
| ------------------ | -------- | ----------------------------------------------------------- |
| Dashboard          | React    | `/dashboard`                                                |
| People & Locations | React    | `/team/people`, `/team/locations`, `/team/people/:personId` |
| Timeline           | React    | `/timeline`, `/timeline?person=<id>`                        |
| Evidence           | Vanilla  | `/evidence` (Platzhalter, Exercise 5)                       |
| Workspace          | Vanilla  | `/workspace` (Platzhalter, Exercise 5)                      |

Im gesamten Ordner `js/react/` gibt es **einen** direkten DOM-Zugriff:
`document.getElementById("react-root")` in `mount.tsx`, also den Mountpunkt
selbst. Kein `innerHTML`, kein `dangerouslySetInnerHTML`, kein
`createElement`, kein `classList`, kein `addEventListener`, kein
`textContent`. Zum Vergleich: die Vanilla-Views enthalten 33 Zuweisungen an
`innerHTML` (dashboard 1, evidence 11, people 2, timeline 10, workspace 9).

`useState` und `useEffect` kommen an genau einer Stelle vor: in
`useCaseData()`, wo das asynchrone Laden einen Zustand braucht. Alle anderen
Komponenten sind Funktionen ihrer Props und der Adresse.

## Bekannte Schwächen (Stand Exercise 4)

- `useCaseData()` wird von jeder Seite einzeln aufgerufen. Beim Seitenwechsel
  werden die fünf JSON-Dateien erneut geladen. Geteilter Zustand ist in
  Exercise 4 ausdrücklich out of scope und folgt in Exercise 5.
- Die Normalisierung der Evidence-Daten existiert doppelt: in `js/api.ts`
  (Vanilla) und in `shared/data/useCaseData.ts` (React). Sie wandert in ein
  gemeinsames Modul, sobald die Vanilla-Variante entfällt.
- Die Kasten-Optik ist in `styles.css` doppelt definiert, solange die
  Vanilla-Variante die Dashboard-Kästen ohne `card` rendert.
