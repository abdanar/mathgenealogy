import "server-only";

import { join } from "node:path";
import Database from "better-sqlite3";
import type { GenealogyRepository } from "@/lib/data/repository";
import type { Mathematician } from "@/types/genealogy";

type PersonRow = {
  id: number;
  firstName: string;
  otherName: string | null;
  lastName: string;
  degreeYear: number | null;
  university: string | null;
  dissertation: string | null;
};

const database = new Database(join(process.cwd(), "data", "mg.db"), { readonly: true });

const personSelect = `
  SELECT
    p.MGID AS id,
    p.FNAME AS firstName,
    p.ONAME AS otherName,
    p.LNAME AS lastName,
    degree.DEGYEAR AS degreeYear,
    degree.SCHOOL AS university,
    degree.TITLE AS dissertation
  FROM PERSONS p
  LEFT JOIN DEGREES degree ON degree.rowid = (
    SELECT d.rowid
    FROM DEGREES d
    WHERE d.DEGMGID = p.MGID
    ORDER BY CASE d.DEGTYPE WHEN 'Ph.D.' THEN 0 ELSE 1 END, d.DEGYEAR
    LIMIT 1
  )
`;

function toMathematician(row: PersonRow): Mathematician {
  return {
    id: String(row.id),
    name: [row.firstName, row.otherName, row.lastName].filter(Boolean).join(" "),
    degreeYear: row.degreeYear ?? undefined,
    university: row.university ?? undefined,
    dissertation: row.dissertation ?? undefined,
  };
}

function getPeople(sql: string, ...parameters: unknown[]): Mathematician[] {
  return (database.prepare(sql).all(...parameters) as PersonRow[]).map(toMathematician);
}

function normalizedSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase().replaceAll("\u00df", "ss");
}

async function getMathematician(id: string) {
  const row = database.prepare(`${personSelect} WHERE p.MGID = ?`).get(id) as PersonRow | undefined;
  return row ? toMathematician(row) : undefined;
}

async function searchMathematicians(query: string) {
  const normalizedQuery = normalizedSearchQuery(query);
  if (!normalizedQuery) return [];

  return getPeople(
    `${personSelect}
     WHERE replace(lower(trim(p.FNAME || ' ' || coalesce(p.ONAME, '') || ' ' || p.LNAME)), char(223), 'ss') LIKE ?
       ORDER BY CASE WHEN replace(lower(p.LNAME), char(223), 'ss') = ? THEN 0 ELSE 1 END, p.FNAME, p.ONAME, p.LNAME
     LIMIT 12`,
    `%${normalizedQuery}%`,
      normalizedQuery,
  );
}

async function getAdvisors(id: string) {
  return getPeople(
    `${personSelect}
     WHERE p.MGID IN (SELECT ADVISOR FROM STUDENTS WHERE STUDENT = ?)
     ORDER BY p.LNAME, p.FNAME, p.ONAME`,
    id,
  );
}

async function getStudents(id: string) {
  return getPeople(
    `${personSelect}
     WHERE p.MGID IN (SELECT STUDENT FROM STUDENTS WHERE ADVISOR = ?)
     ORDER BY p.LNAME, p.FNAME, p.ONAME`,
    id,
  );
}

async function getLocalGenealogy(id: string) {
  const subject = await getMathematician(id);
  if (!subject) return undefined;

  const [advisors, students] = await Promise.all([getAdvisors(id), getStudents(id)]);
  return {
    advisors,
    subject,
    students,
    relationships: [
      ...advisors.map((advisor) => ({ advisorId: advisor.id, studentId: subject.id })),
      ...students.map((student) => ({ advisorId: subject.id, studentId: student.id })),
    ],
  };
}

export const sqliteGenealogyRepository: GenealogyRepository = {
  getMathematician,
  searchMathematicians,
  getAdvisors,
  getStudents,
  getLocalGenealogy,
};