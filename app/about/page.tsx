import Link from "next/link";

export const metadata = {
  title: "Data Sources | MathGenealogy",
};

export default function DataSourcesPage() {
  return (
    <main className="data-sources">
      <Link className="wordmark" href="/">Math<span style={{ color: "var(--accent)" }}>Genealogy</span></Link>
      <article>
        <p className="eyebrow">Data sources</p>
        <h1>Mathematics Genealogy Project data</h1>
        <p>
          Genealogy records are drawn from the Curated Mathematics Genealogy Project database.
          The database is used locally and server-side only by this application.
        </p>
        <h2>Attribution</h2>
        <p>
          Bar, H., Spencer, N. A., Guo, X., Schifano, E. D., &amp; Yan, J. (2026).
          <em> Curated Mathematics Genealogy Project: Database and Reproducibility Code.</em>
          Zenodo. https://doi.org/10.5281/zenodo.20683099
        </p>
        <p>
          The Zenodo record is licensed under Creative Commons Attribution 4.0 International.
          The Mathematics Genealogy Project is the underlying source project.
        </p>
        <h2>Local database policy</h2>
        <p>
          The <code>mg.db</code> file is a local/server-side dependency. It is ignored by Git and is
          not committed, redistributed, or sent to browsers by MathGenealogy.
        </p>
      </article>
    </main>
  );
}