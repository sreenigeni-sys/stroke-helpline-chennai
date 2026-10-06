# Stroke Helpline Chennai

A bilingual emergency-navigation app focused on helping Chennai families reach hospital branches with stroke-care information. The homepage starts with the warning-sign screen and a prominent “Find hospitals now” action; emergency actions remain visible throughout.

- Location is requested only when the visitor taps the location button; area search and the Chennai-centre list remain available.
- Distances are straight-line distances, not live road-travel estimates.
- Existing hospital entries, category tags, service rules and notes are preserved unchanged from the public/clinician-reviewed source dataset. The directory’s capability tags remain distinct from live acceptance and formal certification.
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
