import "server-only";

import { sqliteGenealogyRepository } from "@/lib/data/sqlite-repository";

export const {
  getMathematician,
  searchMathematicians,
  searchMathematiciansForResults,
  getAdvisors,
  getStudents,
  getLocalGenealogy,
  findDescendantPath,
} = sqliteGenealogyRepository;