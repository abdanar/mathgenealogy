"use server";

import { searchMathematicians } from "@/lib/genealogy";
import { findDescendantPath } from "@/lib/genealogy";
import type { GenealogyPath, Mathematician } from "@/types/genealogy";

export async function searchMathematiciansAction(query: string): Promise<Mathematician[]> {
  return searchMathematicians(query);
}

export async function findDescendantPathAction(
  sourceId: string,
  targetId: string,
): Promise<GenealogyPath | undefined> {
  return findDescendantPath(sourceId, targetId);
}