# Stroke Helpline Chennai

A bilingual emergency-navigation app focused on helping Chennai families reach hospital branches with stroke-care information. The homepage preserves the original warning-sign and last-known-well flow, with a prominent “Find hospitals now” action that opens the finder directly.

- Device location is requested only after the visitor taps “Find hospitals now” or the location button; the finder remains usable if permission is denied, with area search and the Chennai-centre list available.
- Distances are straight-line distances, not live road-travel estimates.
- Existing hospital entries, category tags, service rules and notes are preserved unchanged from the public/clinician-reviewed source dataset. The directory’s capability tags remain distinct from live acceptance and formal certification.
- The app does not have live hospital acceptance/bed status. Every result says current acceptance is not confirmed.
- No 108/112 call bar appears on the landing or general content pages. Government hospital cards show a separate 108 ambulance action; each branch’s existing direct contact remains separate. Private cards do not offer 108, and 112 is not offered by this app.
- The original browser session restore remains enabled for screening answers, last-known-well time, language, and selected location. Hospital call-button taps are stored in the private database or private Blob for administrative review; `/activity` remains hidden from the public and redirects home, and no public activity-read endpoint is exposed. Events record only the selected hospital/108 target and time-window category, not patient identity. Historical events have not been purged.
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
