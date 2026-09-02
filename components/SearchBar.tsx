"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { fetchAutocomplete } from "@/lib/api-client";
import type { Mathematician } from "@/types/genealogy";

type SearchBarProps = {
  autoFocus?: boolean;
  compact?: boolean;
  home?: boolean;
  onEscape?: () => void;
};

export function SearchBar({ autoFocus = false, compact = false, home = false, onEscape }: SearchBarProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState<Mathematician[]>([]);
  const [hasError, setHasError] = useState(false);
  const isOpen = query.trim().length >= 2;
  const displayedResults = home ? results.slice(0, 6) : results;
  const hasMoreResults = home && results.length > displayedResults.length;

  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      setHasError(false);
      return;
    }

    let isCurrent = true;
    const timeout = window.setTimeout(() => {
      void fetchAutocomplete(query)
        .then((matches) => { if (isCurrent) setResults(matches); })
        .catch(() => { if (isCurrent) setHasError(true); });
    }, 225);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [isOpen, query]);

  function selectMathematician(mathematician: Mathematician) {
    setQuery("");
    setResults([]);
    router.push(`/mathematician?id=${encodeURIComponent(mathematician.id)}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
      setResults([]);
      inputRef.current?.blur();
      onEscape?.();
      return;
    }

    if (event.key === "ArrowDown" && displayedResults.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % displayedResults.length);
    }

    if (event.key === "ArrowUp" && displayedResults.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? displayedResults.length - 1 : index - 1));
    }

    if (event.key === "Enter") {
      const mathematician = displayedResults[activeIndex];
      if (mathematician) {
        event.preventDefault();
        selectMathematician(mathematician);
      } else if (query.trim()) {
        event.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  return (
    <div className={`search ${compact ? "search--compact" : ""} ${home ? "search--home" : ""}`}>
      <label className="sr-only" htmlFor={inputId}>Search mathematicians</label>
      {home && <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>}
      <input ref={inputRef} id={inputId} autoComplete="off" autoFocus={autoFocus} className="search__input" type="search" role="combobox" placeholder={home ? "Search mathematicians by name" : "Search a mathematician..."} value={query} onChange={(event) => { setQuery(event.target.value); setResults([]); setActiveIndex(-1); }} onKeyDown={handleKeyDown} aria-autocomplete="list" aria-controls={isOpen ? `${inputId}-results` : undefined} aria-expanded={isOpen} aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined} />
      {isOpen && (
        <div className="search__results" id={`${inputId}-results`} role="listbox">
          {results.length > 0 ? <>
            {displayedResults.map((mathematician, index) => (
            <button className="search-result" id={`${inputId}-option-${index}`} key={mathematician.id} type="button" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => selectMathematician(mathematician)}>
              <span>{mathematician.name}</span>
              <small>{mathematician.university ?? "University unknown"}{mathematician.degreeYear ? ` · PhD ${mathematician.degreeYear}` : ""}</small>
            </button>
            ))}
            {hasMoreResults && <Link className="search__all-results" href={`/search?q=${encodeURIComponent(query.trim())}`}>View all results →</Link>}
          </> : <p className="search__empty">{hasError ? "Search is temporarily unavailable." : "No mathematicians found."}</p>}
        </div>
      )}
    </div>
  );
}