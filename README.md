# Multiscale Landscape Structures

An independent English publication of GISLab's Bornholm landscape structure analysis: one integrated report, the interactive R10–R6 map and the supporting model tables.

Published site: https://gislab-se.github.io/multiscale-landscape-structures/

## Scope

The publication presents five interpreted v10 landscape types built on the existing eight-cluster v9 solution. The original cell geometry, H3 identifiers, class assignments and factor scores are preserved. Text, navigation and exported descriptive fields are in English.

Only the selected report, map assets and necessary analytical tables are distributed. There is no runtime dependency on another GISLab repository. OpenStreetMap supplies the background tiles. Leaflet 1.9.4 is bundled locally with its licence.

This is a public website and repository. It provides a separate publication with a focused scope; it is not an access-control system for other public material.

## Build and preview

Node.js 22 or later is sufficient; no package installation is required.

```sh
npm run build
npm run check
npm run preview
```

Preview: http://127.0.0.1:4173/multiscale-landscape-structures/

The English report source is `content/report.md`. The builder generates the landing page, report and factor-loading page in `docs/`. Map code and style are in `docs/assets/map.js` and `docs/assets/map.css`. The source report can also be downloaded as Markdown. The published PDF is a print export of the report page; regenerate it after substantive report edits using a browser's Save as PDF command.

## Publication

GitHub Pages serves the `docs/` directory on `main`. Commit the reviewed `docs/` output together with any source changes. `.nojekyll` enables direct static-file serving. All publication links and map data URLs are relative so the site works under its repository URL.

This repository starts with fresh history. It does not carry over commits or unrelated folders from the source workspace.

## Data provenance

`docs/data/source-manifest.json` records the source file names, checksums, feature counts and adaptations. The generated GeoJSON files are intentionally committed because the interactive map fetches them directly on GitHub Pages. They are selected display exports, not raw GIS layers or a complete analytical pipeline.

R10 has 47,117 cells; R9 has 6,854; R8 has 1,029; R7 has 166; R6 has 32. English labels replace the source descriptive strings, and redundant pre-rendered popup HTML is omitted. Geometries and numerical analytical attributes are unchanged; standard JSON serialization normalizes signed negative zero to zero. Existing modal class and mean-factor rollups are preserved. A request-order guard prevents a slow earlier map request from overriding a newer resolution selection. Collapsible controls and a padded initial map extent keep the island visible on small screens.

Native analytical CRS: EPSG:25833. Web GeoJSON: EPSG:4326. No new geometry operations or analytical model fitting are performed here. The report explicitly distinguishes source-cell shares from area-weighted statistics and display resolution from analytical neighbourhood scale.

The source analysis is an interpreted synthesis, not a field-verified classification. Methodological attribution to Kawalerowicz and Malmberg (2021), and to Pontus Hennerdal's geocontext work, is retained in the report. Local reference PDF material is cited but not distributed. Third-party components retain their own licence terms.
