# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

This repository contains an existing vanilla-JavaScript (no frameworks used) investigation application. The system is
functional but has accumulated technical debt and inconsistent implementation decisions. Your task
during the course will be to analyse, maintain, refactor, migrate, and extend it.

## Running the application

This application uses `fetch()` to load its case data from local JSON files, so it must be served
over HTTP — opening `index.html` directly from the filesystem (`file://`) will not work in most
browsers.

Any static file server will do. For example, from the project root:

```bash
# Python 3
python -m http.server 8080

# Node.js (no install required)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then open `http://localhost:8080` (or whatever port your server prints) in your browser.

## Development backend (Exercise 6)

Since Exercise 6 the React variant reads its case data from a small **read-only Node backend**
instead of the static JSON files.

> **Development only.** This server is never deployed. The GitHub Pages workflow from Exercise 2
> still builds and publishes the static frontend only, and the production build keeps reading
> `public/data/*.json`. `express` is therefore a **devDependency**.

Run it in a second terminal, alongside the Vite dev server:

```bash
# terminal 1
npm run dev        # Vite on http://localhost:5173

# terminal 2
npm run server     # Express on http://localhost:3001
```

Vite proxies everything under `/api` to port 3001 (see `vite.config.js`), so the browser only ever
talks to `localhost:5173`. There is no second origin and therefore **no CORS configuration**
anywhere. Calling `http://localhost:3001/api/...` directly from the page would be blocked by the
browser.

### Endpoints

One `GET` per resource, each returning exactly the same JSON as the corresponding file in
`public/data/`:

| Endpoint         | Source file                  |
| ---------------- | ---------------------------- |
| `/api/case`      | `public/data/case.json`      |
| `/api/evidence`  | `public/data/evidence.json`  |
| `/api/people`    | `public/data/people.json`    |
| `/api/locations` | `public/data/locations.json` |
| `/api/timeline`  | `public/data/timeline.json`  |
| `/api/health`    | liveness check               |

There are no write endpoints. Bookmarks, notes, and the hypothesis draft stay in `localStorage`.

### Simulating slow, failing, and empty responses

A static file is either instant or a 404, which makes loading indicators, error states, empty
states, and request races impossible to demonstrate. Three switches fix that:

| Switch           | Effect                            | Example                         |
| ---------------- | --------------------------------- | ------------------------------- |
| `?delay=<ms>`    | delays the response (max 30 s)    | `/api/evidence?delay=3000`      |
| `?fail=1`        | responds `500` instead of data    | `/api/evidence?fail=1`          |
| `?empty=1`       | responds `200` with an empty list | `/api/evidence?empty=1`         |
| `API_DELAY=<ms>` | same, for every request           | `API_DELAY=2000 npm run server` |
| `API_FAIL=1`     | same, for every request           | `API_FAIL=1 npm run server`     |
| `API_EMPTY=1`    | same, for every request           | `API_EMPTY=1 npm run server`    |

`?empty=1` only affects the list resources. `/api/case` is a single object, so there is no
meaningful empty version of it and the switch is ignored there.

`PORT` overrides the default port 3001.

## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.

## Where the data goes

The full path of one piece of evidence — from `public/data/evidence.json` through
the endpoint, the API layer, the custom hook and the provider to the badge on
screen — is documented with a diagram in [`docs/DATAFLOW.md`](docs/DATAFLOW.md),
together with what breaks if any single step silently stops happening, and the
reasoning behind the loading / error / empty states.
