import Link from "next/link";
import type { PaginatedMathematicians } from "@/lib/data/repository";
import type { Mathematician } from "@/types/genealogy";

export function SearchResults({ mathematicians }: { mathematicians: Mathematician[] }) {
  return (
    <ul className="search-page__results">
      {mathematicians.map((mathematician) => (
        <li key={mathematician.id}>
          <Link href={`/mathematician/${mathematician.id}`}>
            <h2>{mathematician.name}</h2>
            {(mathematician.university || mathematician.degreeYear) && (
              <p>{mathematician.university}{mathematician.university && mathematician.degreeYear ? " · " : ""}{mathematician.degreeYear}</p>
            )}
            {mathematician.dissertation && <p className="search-page__dissertation">{mathematician.dissertation}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function pageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  if (currentPage >= totalPages - 3) return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function SearchPagination({
  query,
  page,
  totalPages,
}: Pick<PaginatedMathematicians, "page" | "totalPages"> & { query: string }) {
  if (totalPages <= 1) return null;

  const hrefForPage = (nextPage: number) => `/search?q=${encodeURIComponent(query)}&page=${nextPage}`;

  return (
    <nav aria-label="Search results pagination" className="search-pagination">
      {page > 1 ? <Link href={hrefForPage(page - 1)}>← Previous</Link> : <span>← Previous</span>}
      <span className="search-pagination__numbers">
        {pageNumbers(page, totalPages).map((item, index) => item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} aria-hidden="true">…</span>
        ) : item === page ? (
          <span aria-current="page" className="search-pagination__current" key={item}>{item}</span>
        ) : <Link href={hrefForPage(item)} key={item}>{item}</Link>)}
      </span>
      <span className="search-pagination__status">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link href={hrefForPage(page + 1)}>Next →</Link> : <span>Next →</span>}
    </nav>
  );
}