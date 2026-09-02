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

const database = new Database(process.env.MATHGENEALOGY_DB_PATH ?? join(process.cwd(), "data", "mg.db"), { readonly: true });
const maximumPathExpansions = 100_000;
const autocompleteSearchLimit = 12;
const searchCandidateLimit = 1_000;
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
  return query.normalize("NFKD").replace(/\p{Diacritic}/gu, "").trim().replace(/\s+/g, " ").toLocaleLowerCase().replaceAll("\u00df", "ss");
}

function matchRank(name: string, query: string): number | undefined {
  const normalizedName = normalizedSearchQuery(name);
  const nameParts = normalizedName.split(" ");
  const queryParts = query.split(" ");

  if (normalizedName === query) return 0;
  if (normalizedName.startsWith(query)) return 1;
  if (nameParts.some((part) => part.startsWith(query))) return 2;
  if (queryParts.length > 1 && queryParts.every((part, index) => nameParts.slice(index).some((namePart) => namePart.startsWith(part)))) return 2;
  if (query.length >= 3 && normalizedName.includes(query)) return 3;
  if (query.length >= 3 && nameParts.some((part) => levenshteinDistance(part, query) <= 1)) return 4;
}

function levenshteinDistance(first: string, second: string): number {
  if (Math.abs(first.length - second.length) > 1) return 2;

  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] + Number(first[firstIndex - 1] !== second[secondIndex - 1]),
      );
    }
    previous = current;
  }
  return previous[second.length];
}

async function rankedSearchMathematicians(query: string): Promise<Mathematician[]> {
  const normalizedQuery = normalizedSearchQuery(query);
  if (normalizedQuery.length < 2) return [];

  const nameExpression = "replace(lower(trim(p.FNAME || ' ' || coalesce(p.ONAME, '') || ' ' || p.LNAME)), char(223), 'ss')";
  const firstNameExpression = "replace(lower(p.FNAME), char(223), 'ss')";
  const otherNameExpression = "replace(lower(coalesce(p.ONAME, '')), char(223), 'ss')";
  const lastNameExpression = "replace(lower(p.LNAME), char(223), 'ss')";
  const queryParts = normalizedQuery.split(" ");
  const nameContainsQueryParts = queryParts.map(() => `${nameExpression} LIKE ?`).join(" AND ");
  const componentPrefix = `${normalizedQuery}%`;
  const fuzzyPrefix = `${normalizedQuery.slice(0, 2)}%`;
  const parameters = normalizedQuery.length === 2
    ? [componentPrefix, componentPrefix, componentPrefix, componentPrefix, searchCandidateLimit]
    : [
      ...queryParts.map((part) => `%${part}%`), componentPrefix, componentPrefix, componentPrefix, fuzzyPrefix, fuzzyPrefix, fuzzyPrefix,
      ...queryParts.map((part) => `%${part}%`), `%${normalizedQuery}%`, componentPrefix, componentPrefix, componentPrefix, `%${normalizedQuery}%`, searchCandidateLimit,
    ];
  const predicate = normalizedQuery.length === 2
    ? `(${nameExpression} LIKE ? OR ${firstNameExpression} LIKE ? OR ${otherNameExpression} LIKE ? OR ${lastNameExpression} LIKE ?)`
    : `(${nameContainsQueryParts} OR ${firstNameExpression} LIKE ? OR ${otherNameExpression} LIKE ? OR ${lastNameExpression} LIKE ? OR ${firstNameExpression} LIKE ? OR ${otherNameExpression} LIKE ? OR ${lastNameExpression} LIKE ?)`;
  const candidateOrder = normalizedQuery.length === 2
    ? "p.LNAME, p.FNAME, p.ONAME"
    : `CASE
         WHEN ${nameExpression} LIKE ? THEN 0
          WHEN ${nameContainsQueryParts} THEN 1
          WHEN ${firstNameExpression} LIKE ? OR ${otherNameExpression} LIKE ? OR ${lastNameExpression} LIKE ? THEN 2
          WHEN ${nameExpression} LIKE ? THEN 3
          ELSE 4
       END, p.LNAME, p.FNAME, p.ONAME`;
  const candidates = getPeople(`${personSelect} WHERE ${predicate} ORDER BY ${candidateOrder} LIMIT ?`, ...parameters);

  return candidates
    .map((mathematician) => ({ mathematician, rank: matchRank(mathematician.name, normalizedQuery) }))
    .filter((candidate): candidate is { mathematician: Mathematician; rank: number } => candidate.rank !== undefined)
    .sort((first, second) => first.rank - second.rank || first.mathematician.name.localeCompare(second.mathematician.name))
    .map(({ mathematician }) => mathematician);
}

async function getMathematician(id: string) {
  const row = database.prepare(`${personSelect} WHERE p.MGID = ?`).get(id) as PersonRow | undefined;
  return row ? toMathematician(row) : undefined;
}

async function searchMathematicians(query: string) {
  return (await rankedSearchMathematicians(query)).slice(0, autocompleteSearchLimit);
}

async function searchMathematiciansForResults(query: string, requestedPage: number): Promise<PaginatedMathematicians> {
  const mathematicians = await rankedSearchMathematicians(query);
  const total = mathematicians.length;
  const totalPages = Math.ceil(total / searchResultsPageSize);
  const page = totalPages ? Math.min(Math.max(1, requestedPage), totalPages) : 1;

  return { mathematicians: mathematicians.slice((page - 1) * searchResultsPageSize, page * searchResultsPageSize), page, total, totalPages };
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