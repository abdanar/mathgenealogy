"use client";

import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import {
  findDescendantPathAction,
  searchMathematiciansAction,
} from "@/app/actions/search";
import type { GenealogyPath, Mathematician } from "@/types/genealogy";

type PickerProps = {
  label: string;
  onSelect: (mathematician: Mathematician) => void;
};

function MathematicianPicker({ label, onSelect }: PickerProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Mathematician[]>([]);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (!query.trim() || hasSelection) return;
    let isCurrent = true;
    void searchMathematiciansAction(query).then((results) => {
      if (isCurrent) setMatches(results);
    });
    return () => { isCurrent = false; };
  }, [hasSelection, query]);

  return (
    <div className="path-picker">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        autoComplete="off"
        value={query}
        placeholder="Search a mathematician"
        onChange={(event) => { setQuery(event.target.value); setMatches([]); setHasSelection(false); }}
        aria-autocomplete="list"
        aria-controls={query.trim() && !hasSelection ? `${inputId}-results` : undefined}
        aria-expanded={query.trim().length > 0 && !hasSelection}
      />
      {query.trim() && !hasSelection && (
        <div className="path-picker__results" id={`${inputId}-results`} role="listbox">
          {matches.map((mathematician) => (
            <button
              key={mathematician.id}
              type="button"
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onSelect(mathematician); setQuery(mathematician.name); setMatches([]); setHasSelection(true); }}
            >
              <span>{mathematician.name}</span>
              {(mathematician.university || mathematician.degreeYear) && (
                <small>{mathematician.university}{mathematician.university && mathematician.degreeYear ? " · " : ""}{mathematician.degreeYear}</small>
              )}
            </button>
          ))}
          {matches.length === 0 && <p>No mathematicians found.</p>}
        </div>
      )}
    </div>
  );
}

function Lineage({ path }: { path: GenealogyPath }) {
  return (
    <section className="path-result" aria-live="polite" aria-labelledby="path-result-heading">
      <h2 id="path-result-heading">Academic lineage</h2>
      <ol>
        {path.mathematicians.map((mathematician, index) => (
          <li key={mathematician.id}>
            {index > 0 && <span className="path-result__connector" aria-hidden="true" />}
            <Link href={`/mathematician/${mathematician.id}`}>
              <strong>{mathematician.name}</strong>
              {(mathematician.university || mathematician.degreeYear) && (
                <small>{mathematician.university}{mathematician.university && mathematician.degreeYear ? " · " : ""}{mathematician.degreeYear}</small>
              )}
            </Link>
          </li>
        ))}
      </ol>
      <p>{path.generations} academic generation{path.generations === 1 ? "" : "s"}</p>
    </section>
  );
}

export function PathFinder() {
  const [source, setSource] = useState<Mathematician>();
  const [target, setTarget] = useState<Mathematician>();
  const [result, setResult] = useState<GenealogyPath | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function findPath(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source || !target) return;
    startTransition(async () => {
      setResult(await findDescendantPathAction(source.id, target.id));
      setHasSearched(true);
    });
  }

  return (
    <>
      <form className="path-form" onSubmit={findPath}>
        <MathematicianPicker label="From" onSelect={(mathematician) => { setSource(mathematician); setHasSearched(false); }} />
        <MathematicianPicker label="To" onSelect={(mathematician) => { setTarget(mathematician); setHasSearched(false); }} />
        <button type="submit" disabled={!source || !target || isPending}>
          {isPending ? "Finding relationship..." : "Find relationship"}
        </button>
      </form>
      {hasSearched && (result ? <Lineage path={result} /> : <p className="path-empty" aria-live="polite">No recorded descendant path found.</p>)}
    </>
  );
}