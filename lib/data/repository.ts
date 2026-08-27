import type {
  GenealogyPath,
  LocalGenealogy,
  Mathematician,
} from "@/types/genealogy";

export interface GenealogyRepository {
  getMathematician(id: string): Promise<Mathematician | undefined>;
  searchMathematicians(query: string): Promise<Mathematician[]>;
  getAdvisors(id: string): Promise<Mathematician[]>;
  getStudents(id: string): Promise<Mathematician[]>;
  getLocalGenealogy(id: string): Promise<LocalGenealogy | undefined>;
  findDescendantPath(sourceId: string, targetId: string): Promise<GenealogyPath | undefined>;
}