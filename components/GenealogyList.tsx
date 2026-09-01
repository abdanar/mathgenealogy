"use client";

import Link from "next/link";
import type { Mathematician } from "@/types/genealogy";
import { useMemo, useState } from "react";

function PersonEntry({ mathematician }: { mathematician: Mathematician }) {
  return (
    <li className="genealogy-list__entry">
      <Link className="genealogy-list__link" href={`/mathematician/${mathematician.id}`}>
        <div className="genealogy-list__person">
          <h3>{mathematician.name}</h3>
          {mathematician.university && <p className="genealogy-list__institution">{mathematician.university}</p>}
          {mathematician.dissertation && (
            <p className="genealogy-list__dissertation">{mathematician.dissertation}</p>
          )}
        </div>
        {mathematician.degreeYear && (
          <span className="genealogy-list__year">
            {mathematician.degreeYear}
          </span>
        )}
      </Link>
    </li>
  );
}

export function GenealogyList({ students }: { students: Mathematician[] }) {
  const [isAscending, setIsAscending] = useState(true);
  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => {
      if (a.degreeYear == null) return b.degreeYear == null ? a.name.localeCompare(b.name) : 1;
      if (b.degreeYear == null) return -1;
      return (a.degreeYear - b.degreeYear) * (isAscending ? 1 : -1) || a.name.localeCompare(b.name);
    }),
    [isAscending, students],
  );

  return (
    <section className="genealogy-list" aria-labelledby="students-heading">
      <div className="genealogy-list__heading">
        <h2 id="students-heading">Students · {students.length}</h2>
        <button type="button" onClick={() => setIsAscending((ascending) => !ascending)} aria-label={`Sort by PhD year: ${isAscending ? "ascending" : "descending"}`}>
          Year {isAscending ? "↑" : "↓"}
        </button>
      </div>
      {students.length > 0 ? (
        <ul className="genealogy-list__entries">
          {sortedStudents.map((mathematician) => <PersonEntry key={mathematician.id} mathematician={mathematician} />)}
        </ul>
      ) : <p className="genealogy-list__empty">No immediate students are recorded.</p>}
    </section>
  );
}