import Link from "next/link";
import type { Mathematician } from "@/types/genealogy";

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
          <span className="genealogy-list__year" aria-hidden="true">
            {mathematician.degreeYear}
          </span>
        )}
      </Link>
    </li>
  );
}

export function GenealogyList({ students }: { students: Mathematician[] }) {
  return (
    <section className="genealogy-list" aria-labelledby="students-heading">
      <h2 id="students-heading">Students · {students.length}</h2>
      {students.length > 0 ? (
        <ul className="genealogy-list__entries">
          {students.map((mathematician) => <PersonEntry key={mathematician.id} mathematician={mathematician} />)}
        </ul>
      ) : <p className="genealogy-list__empty">No immediate students are recorded.</p>}
    </section>
  );
}