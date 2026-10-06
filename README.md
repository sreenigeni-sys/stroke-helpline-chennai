# Stroke Helpline Chennai

A bilingual emergency-navigation app focused on finding Chennai hospital branches with stroke-care information. The hospital finder opens first; warning-sign education is optional and never blocks emergency actions.

- Location is requested only when the visitor taps the location button; area search and the Chennai-centre list remain available.
- Distances are straight-line distances, not live road-travel estimates.
- Positive service values mean a service is listed in existing notes, not that it is available now or 24/7. Unknowns say “Call to confirm”; source class and list date are shown. These are not formal certifications.
- Raw source categories, internal notes and verification prompts are excluded from browser-bound hospital records; original source notes are kept in the separate audit package, not rendered to visitors.
- The app does not have live hospital acceptance/bed status. Every result says current acceptance is not confirmed.
- Call 108 for ambulance help or 112 for emergency assistance. The app does not dispatch an ambulance; follow dispatch guidance.
- Symptom, location, and timing state is kept in memory for the current visit and is not written to local storage. This build sends no new individual call events; `/activity` is redirected. Historical call records may remain in the existing database/blob and have not been purged.
- The third-party map loads only after a visitor opens Map. A notice explains that CARTO tile requests can reveal the visible area and ordinary connection data; device location is requested only after a tap.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:8080

## Checks

```bash
npm run typecheck
npm test
npm run lint
npm run build:dev
```

Production build command in `package.json` also runs the database migration step; use it only in the intended deployment environment.
