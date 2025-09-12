Architecture outputs

- dependency-graph.dot: Import graph in Graphviz DOT (open with a DOT viewer)
- architecture-report.json: Circulars + orphans summary
- CODE_HYGIENE_REPORT.md: Band-aid scan summary (ts-ignore, eslint-disable, any, logs)
- code-smells.json: Raw findings by pattern
- route-map.dot: Route flow map extracted from routes/navigation/pages
- SUMMARY.md: Collated overview with top findings and next actions

Run locally

npm run arch:all

Optional: install Graphviz for SVG export.
