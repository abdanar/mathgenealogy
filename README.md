# MathGenealogy

A minimal, search-first interface for exploring the academic genealogy of mathematicians.

## Technology

- Next.js App Router with TypeScript
- Tailwind CSS
- React Flow and Dagre for the local genealogy view
- A local SQLite database accessed only through a source-agnostic repository interface

## Data source and attribution

This application reads `data/mg.db` locally and server-side only. The database is intentionally ignored by Git, must not be committed, redistributed, or exposed to browsers. The data layer is isolated behind a repository interface so another permitted source can replace SQLite. See `/about` for the same attribution and local database policy.

Genealogy records are provided by the Curated Mathematics Genealogy Project database: Bar, H., Spencer, N. A., Guo, X., Schifano, E. D., & Yan, J. (2026), *Curated Mathematics Genealogy Project: Database and Reproducibility Code*, Zenodo, https://doi.org/10.5281/zenodo.20683099. The record is licensed under CC BY 4.0; attribution and license terms must accompany any permitted reuse. The Mathematics Genealogy Project remains the underlying source project.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run lint` and `npm run build` to validate the project.
