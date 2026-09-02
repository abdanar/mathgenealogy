# MathGenealogy

MathGenealogy is a modern, search-first interface for exploring mathematical academic genealogy.

## Features

- Search for mathematicians by name, including normalized variants such as `Gauß` and `Gauss`.
- Browse mathematician profiles with dissertation, institution, and degree-year information.
- Navigate advisor and immediate-student relationships.
- Sort students by degree year in ascending or descending order.
- Find a directed academic genealogy path between two mathematicians.
- View local advisor-student relationships as an interactive genealogy diagram.
- Use a responsive, minimal interface across search, profile, and path views.

## Development transparency

> **Development transparency.** This project is an experiment in AI-assisted software development. I defined the project idea, requirements, design direction, testing criteria, and reviewed the results, while the implementation was generated and modified using OpenAI Codex. I did not manually write the source code in this repository.

## Data

The application source code and genealogy data are separate. The local database, `data/mg.db`, is deliberately ignored by Git and is not distributed with this repository.

The application uses the *Curated Mathematics Genealogy Project: Database and Reproducibility Code* (Bar, H., Spencer, N. A., Guo, X., Schifano, E. D., & Yan, J., 2026), distributed through Zenodo: https://doi.org/10.5281/zenodo.20683099. The Mathematics Genealogy Project is the underlying genealogy source.

The database and other third-party data are governed by their own terms and licensing. Any source-code license for this repository does not grant rights to external datasets.

## Running locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Place the required local database at `data/mg.db`, then open http://localhost:3000. Do not commit the database.

## Project structure

- `app/` - Next.js routes and pages.
- `components/` - Reusable interface components.
- `lib/` - Repository and application logic.
- `types/` - Shared TypeScript types.
- `public/` - Static assets.
- `data/` - Local, Git-ignored database files.

## Technology

- Next.js
- React
- TypeScript
- SQLite via better-sqlite3
- React Flow and Dagre

## Motivation

MathGenealogy is intended to make academic genealogy easy to search, navigate, and explore through a clean interface while keeping provenance and external data sources explicit.

## License

The source code in this repository is licensed under the MIT License. This license does not grant rights to the Mathematics Genealogy Project data, the curated Zenodo database, or other third-party datasets; their terms and licensing remain separate.

## Acknowledgements

Thanks to the Mathematics Genealogy Project and to the authors and maintainers of the Curated Mathematics Genealogy Project database. This project also relies on open-source libraries including Next.js, React, React Flow, Dagre, and better-sqlite3.
