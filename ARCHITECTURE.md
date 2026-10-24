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
        Card.tsx
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

## Bekannte Schwächen (Stand Exercise 4)

- `useCaseData()` wird von jeder Seite einzeln aufgerufen. Beim Seitenwechsel
  werden die fünf JSON-Dateien erneut geladen. Geteilter Zustand ist in
  Exercise 4 ausdrücklich out of scope und folgt in Exercise 5.
- Die Normalisierung der Evidence-Daten existiert doppelt: in `js/api.ts`
  (Vanilla) und in `shared/data/useCaseData.ts` (React). Sie wandert in ein
  gemeinsames Modul, sobald die Vanilla-Variante entfällt.
