import Link from "next/link";
import { HeaderSearch } from "@/components/HeaderSearch";
import { SearchPagination, SearchResults } from "@/components/SearchResults";
import { searchMathematiciansForResults } from "@/lib/genealogy";

export const metadata = { title: "Search | MathGenealogy" };

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { page: pageParameter, q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const parsedPage = typeof pageParameter === "string" ? Number(pageParameter) : 1;
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const results = query ? await searchMathematiciansForResults(query, requestedPage) : undefined;

  return (
    <main className="search-page">
      <div className="profile__search">
        <Link className="wordmark" href="/">MathGenealogy</Link>
        <div className="profile__tools">
          <Link href="/path">Path</Link>
          <HeaderSearch />
        </div>
      </div>
      <header className="search-page__header">
        <p className="eyebrow">Mathematicians</p>
        <h1>{query ? `${results?.total} result${results?.total === 1 ? "" : "s"} for “${query}”` : "Search mathematicians"}</h1>
      </header>
      {query && (results?.mathematicians.length ? <>
        <SearchResults mathematicians={results.mathematicians} />
        <SearchPagination query={query} page={results.page} totalPages={results.totalPages} />
      </> : <p className="search-page__empty">No mathematicians found for “{query}”.</p>)}
    </main>
  );
}