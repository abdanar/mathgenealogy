"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { SearchPagination, SearchResults } from "@/components/SearchResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchSearchResults, type SearchResultsPage } from "@/lib/api-client";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const parsedPage = Number(searchParams.get("page"));
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [results, setResults] = useState<SearchResultsPage>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(undefined);
      return;
    }
    let isCurrent = true;
    setResults(undefined);
    setHasError(false);
    void fetchSearchResults(query, requestedPage)
      .then((response) => { if (isCurrent) setResults(response); })
      .catch(() => { if (isCurrent) setHasError(true); });
    return () => { isCurrent = false; };
  }, [query, requestedPage]);

  return (
    <main className="search-page">
      <div className="profile__search">
        <Link className="wordmark" href="/">Math<span style={{ color: "var(--accent-fg)" }}>Genealogy</span></Link>
        <div className="profile__tools"><Link href="/path">Path</Link><ThemeToggle /><HeaderSearch /></div>
      </div>
      <header className="search-page__header">
        <p className="eyebrow">Mathematicians</p>
        <h1>{query && results ? `${results.total} result${results.total === 1 ? "" : "s"} for “${query}”` : query ? `Searching for “${query}”` : "Search mathematicians"}</h1>
      </header>
      {query && !results && !hasError && <p className="search-page__empty">Searching mathematicians...</p>}
      {query && hasError && <p className="search-page__empty">Search is temporarily unavailable.</p>}
      {results && (results.mathematicians.length ? <><SearchResults mathematicians={results.mathematicians} /><SearchPagination query={query} page={results.page} totalPages={results.totalPages} /></> : <p className="search-page__empty">No mathematicians found for “{query}”.</p>)}
    </main>
  );
}