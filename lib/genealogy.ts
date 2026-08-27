import "server-only";

import { sqliteGenealogyRepository } from "@/lib/data/sqlite-repository";

export const {
  getMathematician,
  searchMathematicians,
  getAdvisors,
  getStudents,
  getLocalGenealogy,
} = sqliteGenealogyRepository;