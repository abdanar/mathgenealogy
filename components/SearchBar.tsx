"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { searchMathematiciansAction } from "@/app/actions/search";
import type { Mathematician } from "@/types/genealogy";

type SearchBarProps = {
  autoFocus?: boolean;
  compact?: boolean;
};

export function SearchBar({ autoFocus = false, compact = false }: SearchBarProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState<Mathematician[]>([]);
  const isOpen = query.trim().length > 0;

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    void searchMathematiciansAction(query).then((matches) => {
      if (isCurrent) setResults(matches);
    });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, query]);

  function selectMathematician(mathematician: Mathematician) {
    setQuery("");
    setResults([]);
    router.push(`/mathematician/${mathematician.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
      setResults([]);
      inputRef.current?.blur();
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    }

    if (event.key === "Enter") {
      const mathematician = results[activeIndex] ?? results[0];
      if (mathematician) {
        event.preventDefault();
        selectMathematician(mathematician);
      }
    }
  }

  return (
    <div className={`search ${compact ? "search--compact" : ""}`}>
      <label className="sr-only" htmlFor={inputId}>Search mathematicians</label>
      <input ref={inputRef} id={inputId} autoComplete="off" autoFocus={autoFocus} className="search__input" type="search" role="combobox" placeholder="Search a mathematician..." value={query} onChange={(event) => { setQuery(event.target.value); setResults([]); setActiveIndex(-1); }} onKeyDown={handleKeyDown} aria-autocomplete="list" aria-controls={isOpen ? `${inputId}-results` : undefined} aria-expanded={isOpen} aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined} />
      {isOpen && (
        <div className="search__results" id={`${inputId}-results`} role="listbox">
          {results.length > 0 ? results.map((mathematician, index) => (
            <button className="search-result" id={`${inputId}-option-${index}`} key={mathematician.id} type="button" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => selectMathematician(mathematician)}>
              <span>{mathematician.name}</span>
              <small>{mathematician.university ?? "University unknown"}{mathematician.degreeYear ? ` · PhD ${mathematician.degreeYear}` : ""}</small>
            </button>
          )) : <p className="search__empty">No mathematicians found.</p>}
        </div>
      )}
    </div>
  );
}