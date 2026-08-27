import type {
  GenealogyPath,
  LocalGenealogy,
  Mathematician,
} from "@/types/genealogy";

export type PaginatedMathematicians = {
  mathematicians: Mathematician[];
  page: number;
  total: number;
  totalPages: number;
};

export interface GenealogyRepository {
  getMathematician(id: string): Promise<Mathematician | undefined>;
  searchMathematicians(query: string): Promise<Mathematician[]>;
  searchMathematiciansForResults(query: string, page: number): Promise<PaginatedMathematicians>;
  getAdvisors(id: string): Promise<Mathematician[]>;
  getStudents(id: string): Promise<Mathematician[]>;
  getLocalGenealogy(id: string): Promise<LocalGenealogy | undefined>;
  findDescendantPath(sourceId: string, targetId: string): Promise<GenealogyPath | undefined>;
}