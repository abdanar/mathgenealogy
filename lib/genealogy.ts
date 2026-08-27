import { mathematicians } from "@/data/mathematicians";
import { relationships } from "@/data/relationships";
import type {
  AcademicRelationship,
  LocalGenealogy,
  Mathematician,
} from "@/types/genealogy";

const mathematiciansById = new Map(
  mathematicians.map((mathematician) => [mathematician.id, mathematician]),
);

export function getMathematician(id: string): Mathematician | undefined {
  return mathematiciansById.get(id);
}

export function searchMathematicians(query: string): Mathematician[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return mathematicians.filter((mathematician) =>
    mathematician.name.toLocaleLowerCase().includes(normalizedQuery),
  );
}

function getRelatedMathematicians(
  relationshipsToFollow: AcademicRelationship[],
  relatedId: (relationship: AcademicRelationship) => string,
): Mathematician[] {
  return relationshipsToFollow
    .map((relationship) => getMathematician(relatedId(relationship)))
    .filter((mathematician): mathematician is Mathematician => Boolean(mathematician));
}

export function getAdvisors(id: string): Mathematician[] {
  return getRelatedMathematicians(
    relationships.filter((relationship) => relationship.studentId === id),
    (relationship) => relationship.advisorId,
  );
}

export function getStudents(id: string): Mathematician[] {
  return getRelatedMathematicians(
    relationships.filter((relationship) => relationship.advisorId === id),
    (relationship) => relationship.studentId,
  );
}

export function getLocalGenealogy(id: string): LocalGenealogy | undefined {
  const subject = getMathematician(id);

  if (!subject) {
    return undefined;
  }

  const advisors = getAdvisors(id);
  const students = getStudents(id);
  const visibleIds = new Set([
    subject.id,
    ...advisors.map((mathematician) => mathematician.id),
    ...students.map((mathematician) => mathematician.id),
  ]);

  return {
    advisors,
    subject,
    students,
    relationships: relationships.filter(
      (relationship) =>
        visibleIds.has(relationship.advisorId) &&
        visibleIds.has(relationship.studentId),
    ),
  };
}