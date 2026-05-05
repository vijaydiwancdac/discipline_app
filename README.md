# Discipline PWA

A privacy-first habit tracker built with vanilla JavaScript, localStorage, and PWA support.

## Structure

- `index.html` — app shell and PWA entrypoint
- `manifest.json` — install metadata
- `service-worker.js` — offline caching and asset shell
- `src/app.js` — app bootstrap and state orchestration
- `src/components` — UI components for habits, dashboard, charts, and lock screen
- `src/services` — storage, auth, analytics, notification helpers
- `src/utils` — date and hashing utilities
- `src/styles/main.css` — mobile-first dark theme styles
- `public/icons` — PWA icon assets

## Run

1. Open `index.html` in a browser or serve the project with a local server.
2. The app will prompt for PIN setup on first use.
3. Add habits, toggle private mode, and view analytics.

## Notes

- The app uses SHA-256 hashing for PIN storage.
- It caches assets for offline usage and registers a service worker.
- Chart.js is loaded from CDN and rendered in the analytics view.
