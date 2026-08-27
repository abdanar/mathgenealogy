import "server-only";

import { join } from "node:path";
import Database from "better-sqlite3";
import type { GenealogyRepository, PaginatedMathematicians } from "@/lib/data/repository";
import type { GenealogyPath, Mathematician } from "@/types/genealogy";

type PersonRow = {
  id: number;
  firstName: string;
  otherName: string | null;
  lastName: string;
  degreeYear: number | null;
  university: string | null;
  dissertation: string | null;
  fields: string | null;
};

const database = new Database(join(process.cwd(), "data", "mg.db"), { readonly: true });
const maximumPathExpansions = 100_000;
const autocompleteSearchLimit = 12;
const searchResultsPageSize = 20;
let studentIdsByAdvisor: Map<string, string[]> | undefined;

const personSelect = `
  SELECT
    p.MGID AS id,
    p.FNAME AS firstName,
    p.ONAME AS otherName,
    p.LNAME AS lastName,
    degree.DEGYEAR AS degreeYear,
    degree.SCHOOL AS university,
    degree.TITLE AS dissertation,
    (
      SELECT group_concat(msc.NAME, ' | ')
      FROM FIELDS field
      JOIN MSC msc ON msc.CODE = CASE
        WHEN field.GIVENFIELD <> 'NA' THEN field.GIVENFIELD
        ELSE field.INFERREDFIELD
      END
      WHERE field.MGID = p.MGID
    ) AS fields
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
    fields: row.fields?.split(" | "),
  };
}

function getPeople(sql: string, ...parameters: unknown[]): Mathematician[] {
  return (database.prepare(sql).all(...parameters) as PersonRow[]).map(toMathematician);
}

function getStudentIdsByAdvisor(): Map<string, string[]> {
  if (studentIdsByAdvisor) return studentIdsByAdvisor;

  const relationships = database.prepare("SELECT ADVISOR AS advisorId, STUDENT AS studentId FROM STUDENTS").all() as {
    advisorId: number;
    studentId: number;
  }[];

  studentIdsByAdvisor = new Map();
  for (const relationship of relationships) {
    const advisorId = String(relationship.advisorId);
    const students = studentIdsByAdvisor.get(advisorId) ?? [];
    students.push(String(relationship.studentId));
    studentIdsByAdvisor.set(advisorId, students);
  }

  return studentIdsByAdvisor;
}

function normalizedSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase().replaceAll("\u00df", "ss");
}

async function getMathematician(id: string) {
  const row = database.prepare(`${personSelect} WHERE p.MGID = ?`).get(id) as PersonRow | undefined;
  return row ? toMathematician(row) : undefined;
}

async function searchMathematiciansWithLimit(query: string, limit: number) {
  const normalizedQuery = normalizedSearchQuery(query);
  if (!normalizedQuery) return [];

  return getPeople(
    `${personSelect}
     WHERE replace(lower(trim(p.FNAME || ' ' || coalesce(p.ONAME, '') || ' ' || p.LNAME)), char(223), 'ss') LIKE ?
       ORDER BY CASE WHEN replace(lower(p.LNAME), char(223), 'ss') = ? THEN 0 ELSE 1 END, p.FNAME, p.ONAME, p.LNAME
     LIMIT ?`,
    `%${normalizedQuery}%`,
    normalizedQuery,
    limit,
  );
}

async function searchMathematicians(query: string) {
  return searchMathematiciansWithLimit(query, autocompleteSearchLimit);
}

async function searchMathematiciansForResults(query: string, requestedPage: number): Promise<PaginatedMathematicians> {
  const normalizedQuery = normalizedSearchQuery(query);
  if (!normalizedQuery) return { mathematicians: [], page: 1, total: 0, totalPages: 0 };

  const searchPattern = `%${normalizedQuery}%`;
  const predicate = "replace(lower(trim(p.FNAME || ' ' || coalesce(p.ONAME, '') || ' ' || p.LNAME)), char(223), 'ss') LIKE ?";
  const total = (database.prepare(`SELECT COUNT(*) AS total FROM PERSONS p WHERE ${predicate}`).get(searchPattern) as { total: number }).total;
  const totalPages = Math.ceil(total / searchResultsPageSize);
  const page = totalPages ? Math.min(Math.max(1, requestedPage), totalPages) : 1;
  const mathematicians = getPeople(
    `${personSelect}
     WHERE ${predicate}
     ORDER BY CASE WHEN replace(lower(p.LNAME), char(223), 'ss') = ? THEN 0 ELSE 1 END, p.FNAME, p.ONAME, p.LNAME
     LIMIT ? OFFSET ?`,
    searchPattern,
    normalizedQuery,
    searchResultsPageSize,
    (page - 1) * searchResultsPageSize,
  );

  return { mathematicians, page, total, totalPages };
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

async function findDescendantPath(sourceId: string, targetId: string): Promise<GenealogyPath | undefined> {
  const [source, target] = await Promise.all([getMathematician(sourceId), getMathematician(targetId)]);
  if (!source || !target) return undefined;
  if (sourceId === targetId) return { mathematicians: [source], generations: 0 };

  const predecessors = new Map<string, string | undefined>([[sourceId, undefined]]);
  const queue = [sourceId];
  const studentIds = getStudentIdsByAdvisor();
  let expansions = 0;

  for (let index = 0; index < queue.length && expansions < maximumPathExpansions; index += 1) {
    const advisorId = queue[index];
    for (const studentId of studentIds.get(advisorId) ?? []) {
      if (predecessors.has(studentId)) continue;
      predecessors.set(studentId, advisorId);
      if (studentId === targetId) {
        const pathIds: string[] = [];
        let currentId: string | undefined = targetId;
        while (currentId) {
          pathIds.unshift(currentId);
          currentId = predecessors.get(currentId);
        }
        const mathematicians = await Promise.all(pathIds.map(getMathematician));
        if (mathematicians.some((mathematician) => !mathematician)) return undefined;
        return { mathematicians: mathematicians as Mathematician[], generations: pathIds.length - 1 };
      }
      queue.push(studentId);
      expansions += 1;
    }
  }

  return undefined;
}

export const sqliteGenealogyRepository: GenealogyRepository = {
  getMathematician,
  searchMathematicians,
  searchMathematiciansForResults,
  getAdvisors,
  getStudents,
  getLocalGenealogy,
  findDescendantPath,
};